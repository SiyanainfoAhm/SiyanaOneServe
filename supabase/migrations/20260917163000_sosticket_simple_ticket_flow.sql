-- Simplified ticket model: New → Assigned → In Progress → Resolved, plus Rejected.
-- Removes approval, verification, category, and SLA from live RPCs and schema.

ALTER TABLE public.sosticket_tickets
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES public.sosticket_users(id),
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

ALTER TABLE public.sosticket_tickets ALTER COLUMN category DROP NOT NULL;

UPDATE public.sosticket_tickets
SET status = 'New'
WHERE status IN ('Draft', 'Need Approval');

UPDATE public.sosticket_tickets
SET status = 'Resolved',
    resolved_at = coalesce(resolved_at, updated_at)
WHERE status = 'Closed';

UPDATE public.sosticket_tickets
SET resolved_at = coalesce(resolved_at, updated_at)
WHERE status = 'Resolved' AND resolved_at IS NULL;

UPDATE public.sosticket_projects
SET status = 'Inactive'
WHERE status NOT IN ('Active', 'Inactive');

CREATE OR REPLACE FUNCTION public.sosticket_ticket_json(p_ticket public.sosticket_tickets)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_org text;
  v_project public.sosticket_projects;
  v_req public.sosticket_users;
  v_asg public.sosticket_users;
  v_rej public.sosticket_users;
BEGIN
  SELECT * INTO v_project FROM public.sosticket_projects WHERE id = p_ticket.project_id;
  SELECT name INTO v_org FROM public.sosticket_organizations WHERE id = p_ticket.organization_id;
  SELECT * INTO v_req FROM public.sosticket_users WHERE id = p_ticket.requester_id;
  SELECT * INTO v_asg FROM public.sosticket_users WHERE id = p_ticket.assignee_id;
  SELECT * INTO v_rej FROM public.sosticket_users WHERE id = p_ticket.rejected_by;

  RETURN jsonb_build_object(
    'id', p_ticket.ticket_no,
    'ticket_id', p_ticket.id,
    'ticket_no', p_ticket.ticket_no,
    'title', p_ticket.title,
    'description', coalesce(p_ticket.description, ''),
    'notes', coalesce(p_ticket.notes, ''),
    'reference_url', p_ticket.reference_url,
    'organization', coalesce(v_org, ''),
    'organization_id', p_ticket.organization_id,
    'project', coalesce(v_project.name, ''),
    'project_id', p_ticket.project_id,
    'project_code', coalesce(v_project.code, ''),
    'status', p_ticket.status,
    'priority', p_ticket.priority,
    'assignee', coalesce(v_asg.full_name, 'Unassigned'),
    'assignee_id', p_ticket.assignee_id,
    'assignee_initials', coalesce(v_asg.initials, '—'),
    'team', coalesce(nullif(p_ticket.team, ''), 'Unassigned'),
    'requester', coalesce(v_req.full_name, ''),
    'requester_id', p_ticket.requester_id,
    'requester_email', v_req.email,
    'requester_role', public.sosticket_role_label(v_req.role),
    'requester_initials', coalesce(v_req.initials, ''),
    'created', to_char(p_ticket.created_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD'),
    'created_at', p_ticket.created_at,
    'updated_at', p_ticket.updated_at,
    'updated', public.sosticket_relative_time(p_ticket.updated_at),
    'resolved_at', p_ticket.resolved_at,
    'rejection_reason', p_ticket.rejection_reason,
    'rejected_by', v_rej.full_name,
    'rejected_by_id', p_ticket.rejected_by,
    'rejected_at', p_ticket.rejected_at,
    'submitted_by', v_req.full_name,
    'waiting_on_me', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_create_ticket(p_token text, p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_project public.sosticket_projects;
  v_ticket public.sosticket_tickets;
  v_priority text;
  v_comment text;
  v_notify uuid[];
BEGIN
  v_user := public.sosticket_require_user(p_token);

  SELECT * INTO v_project
  FROM public.sosticket_projects
  WHERE id::text = coalesce(p_payload->>'project_id', '')
     OR code = p_payload->>'project_code'
     OR name = p_payload->>'project'
  LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Please choose a valid project';
  END IF;
  IF NOT public.sosticket_can_access_project(v_user, v_project.id) THEN
    RAISE EXCEPTION 'You do not have access to this project';
  END IF;

  v_priority := coalesce(nullif(p_payload->>'priority', ''), 'Normal');
  IF v_priority NOT IN ('Critical', 'High', 'Normal', 'Low') THEN
    v_priority := 'Normal';
  END IF;
  v_comment := nullif(trim(coalesce(p_payload->>'comment', p_payload->>'notes', '')), '');

  INSERT INTO public.sosticket_tickets (
    ticket_no, organization_id, project_id, title, description, notes,
    reference_url, status, priority, requester_id
  ) VALUES (
    public.sosticket_next_ticket_no(v_project.id),
    v_project.organization_id,
    v_project.id,
    trim(p_payload->>'title'),
    p_payload->>'description',
    v_comment,
    nullif(p_payload->>'reference_url', ''),
    'New',
    v_priority,
    v_user.id
  ) RETURNING * INTO v_ticket;

  PERFORM public.sosticket_add_event(
    v_ticket.id, v_user.id, 'created', 'Request Created',
    'Raised by ' || v_user.full_name
  );

  IF v_comment IS NOT NULL THEN
    INSERT INTO public.sosticket_ticket_messages (ticket_id, author_id, body, visibility)
    VALUES (v_ticket.id, v_user.id, v_comment, 'client');
  END IF;

  SELECT coalesce(array_agg(id), ARRAY[]::uuid[]) INTO v_notify
  FROM public.sosticket_users
  WHERE public.sosticket_is_console_role(role) AND status = 'active' AND id <> v_user.id;
  PERFORM public.sosticket_notify_users(
    v_notify,
    'New request received',
    v_ticket.title,
    '/console/tickets/' || v_ticket.ticket_no,
    v_ticket.id
  );

  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_update_ticket(p_token text, p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_ticket public.sosticket_tickets;
  v_status text;
  v_team text;
  v_assignee_id uuid;
  v_assignee public.sosticket_users;
  v_old_status text;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  IF public.sosticket_is_client_role(v_user.role) THEN
    RAISE EXCEPTION 'Government users cannot change ticket status or assignment';
  END IF;
  v_ticket := public.sosticket_require_ticket(v_user, coalesce(p_payload->>'id', p_payload->>'ticket_no'));
  v_old_status := v_ticket.status;
  IF v_old_status IN ('Resolved', 'Rejected') THEN
    RAISE EXCEPTION 'This ticket is already closed';
  END IF;
  v_status := coalesce(nullif(p_payload->>'status', ''), v_ticket.status);
  IF v_status NOT IN ('New', 'Assigned', 'In Progress', 'Resolved', 'Rejected') THEN
    RAISE EXCEPTION 'Invalid ticket status';
  END IF;
  v_team := coalesce(nullif(p_payload->>'team', ''), v_ticket.team);

  IF p_payload ? 'assignee_id' AND nullif(p_payload->>'assignee_id', '') IS NOT NULL THEN
    v_assignee_id := (p_payload->>'assignee_id')::uuid;
  ELSIF nullif(p_payload->>'assignee', '') IS NOT NULL AND p_payload->>'assignee' <> 'Unassigned' THEN
    SELECT id INTO v_assignee_id FROM public.sosticket_users WHERE full_name = p_payload->>'assignee' LIMIT 1;
  ELSIF p_payload->>'assignee' = 'Unassigned' THEN
    v_assignee_id := NULL;
  ELSE
    v_assignee_id := v_ticket.assignee_id;
  END IF;

  IF v_assignee_id IS NOT NULL AND v_ticket.assignee_id IS DISTINCT FROM v_assignee_id AND v_status = 'New' THEN
    v_status := 'Assigned';
  END IF;

  UPDATE public.sosticket_tickets SET
    status = v_status,
    team = nullif(v_team, 'Unassigned'),
    assignee_id = v_assignee_id,
    resolved_at = CASE WHEN v_status = 'Resolved' THEN coalesce(resolved_at, now()) ELSE resolved_at END
  WHERE id = v_ticket.id
  RETURNING * INTO v_ticket;

  IF v_old_status IS DISTINCT FROM v_status THEN
    PERFORM public.sosticket_add_event(v_ticket.id, v_user.id, 'status_changed', 'Status Updated', v_old_status || ' → ' || v_status);
    IF v_status = 'Resolved' THEN
      PERFORM public.sosticket_notify_users(
        ARRAY(
          SELECT DISTINCT u.id
          FROM public.sosticket_users u
          WHERE u.id = v_ticket.requester_id
             OR (
               public.sosticket_is_client_role(u.role)
               AND u.status = 'active'
               AND EXISTS (
                 SELECT 1 FROM public.sosticket_user_projects up
                 WHERE up.user_id = u.id AND up.project_id = v_ticket.project_id
               )
             )
        ),
        'Request resolved',
        v_ticket.title,
        '/client/requests/' || v_ticket.ticket_no,
        v_ticket.id
      );
    END IF;
  END IF;

  IF v_ticket.assignee_id IS NOT NULL AND (v_old_status = 'New' OR p_payload ? 'assignee' OR p_payload ? 'assignee_id' OR p_payload ? 'team') THEN
    SELECT * INTO v_assignee FROM public.sosticket_users WHERE id = v_ticket.assignee_id;
    PERFORM public.sosticket_add_event(
      v_ticket.id, v_user.id, 'assigned', 'Assigned',
      'Assigned to ' || coalesce(v_ticket.team, 'team') || ' · ' || coalesce(v_assignee.full_name, 'Unassigned')
    );
    IF v_assignee.id IS NOT NULL AND v_assignee.id <> v_user.id THEN
      PERFORM public.sosticket_notify_users(
        ARRAY[v_assignee.id],
        'Ticket assigned to you',
        v_ticket.title,
        '/console/tickets/' || v_ticket.ticket_no,
        v_ticket.id
      );
    END IF;
  END IF;

  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_reject_ticket(p_token text, p_ticket_id text, p_note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_ticket public.sosticket_tickets;
  v_reason text;
  v_notify uuid[];
BEGIN
  v_user := public.sosticket_require_user(p_token);
  v_ticket := public.sosticket_require_ticket(v_user, p_ticket_id);
  IF v_ticket.status IN ('Resolved', 'Rejected') THEN
    RAISE EXCEPTION 'This ticket is already closed';
  END IF;
  v_reason := nullif(trim(coalesce(p_note, '')), '');
  IF v_reason IS NULL THEN
    RAISE EXCEPTION 'A rejection reason is mandatory';
  END IF;

  UPDATE public.sosticket_tickets SET
    status = 'Rejected',
    rejection_reason = v_reason,
    rejected_by = v_user.id,
    rejected_at = now()
  WHERE id = v_ticket.id
  RETURNING * INTO v_ticket;

  PERFORM public.sosticket_add_event(v_ticket.id, v_user.id, 'rejected', 'Rejected', v_reason);

  IF public.sosticket_is_client_role(v_user.role) THEN
    SELECT coalesce(array_agg(id), ARRAY[]::uuid[]) INTO v_notify
    FROM public.sosticket_users
    WHERE (id = v_ticket.assignee_id OR public.sosticket_is_console_role(role))
      AND status = 'active'
      AND id <> v_user.id;
    PERFORM public.sosticket_notify_users(
      v_notify,
      'Request rejected by government user',
      v_ticket.title,
      '/console/tickets/' || v_ticket.ticket_no,
      v_ticket.id
    );
  ELSE
    SELECT coalesce(array_agg(DISTINCT u.id), ARRAY[]::uuid[]) INTO v_notify
    FROM public.sosticket_users u
    WHERE u.status = 'active'
      AND u.id <> v_user.id
      AND (
        u.id = v_ticket.requester_id
        OR (
          public.sosticket_is_client_role(u.role)
          AND EXISTS (
            SELECT 1 FROM public.sosticket_user_projects up
            WHERE up.user_id = u.id AND up.project_id = v_ticket.project_id
          )
        )
      );
    PERFORM public.sosticket_notify_users(
      v_notify,
      'Request rejected by Siyana',
      v_ticket.title,
      '/client/requests/' || v_ticket.ticket_no,
      v_ticket.id
    );
  END IF;

  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_approve_ticket(p_token text, p_ticket_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  PERFORM public.sosticket_require_user(p_token);
  RAISE EXCEPTION 'Approval is no longer part of this workflow';
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_verify_ticket(p_token text, p_ticket_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  PERFORM public.sosticket_require_user(p_token);
  RAISE EXCEPTION 'Client verification is no longer part of this workflow';
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_request_changes(p_token text, p_ticket_id text, p_note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  PERFORM public.sosticket_require_user(p_token);
  RAISE EXCEPTION 'Change requests are no longer part of this workflow';
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_sla_list(p_token text, p_project_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  PERFORM public.sosticket_require_user(p_token);
  RETURN '[]'::jsonb;
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_project_json(p_project public.sosticket_projects)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_org public.sosticket_organizations;
  v_owner public.sosticket_users;
  v_open int;
  v_total int;
  v_resolved int;
BEGIN
  SELECT * INTO v_org FROM public.sosticket_organizations WHERE id = p_project.organization_id;
  SELECT * INTO v_owner FROM public.sosticket_users WHERE id = p_project.owner_id;
  SELECT count(*)::int INTO v_total FROM public.sosticket_tickets WHERE project_id = p_project.id;
  SELECT count(*)::int INTO v_open FROM public.sosticket_tickets
    WHERE project_id = p_project.id AND status NOT IN ('Resolved', 'Rejected');
  SELECT count(*)::int INTO v_resolved FROM public.sosticket_tickets
    WHERE project_id = p_project.id AND status = 'Resolved';

  RETURN jsonb_build_object(
    'id', p_project.id,
    'name', p_project.name,
    'code', p_project.code,
    'organization', coalesce(v_org.name, ''),
    'organization_id', p_project.organization_id,
    'status', CASE WHEN p_project.status = 'Active' THEN 'Active' ELSE 'Inactive' END,
    'manager', coalesce(v_owner.full_name, ''),
    'managerInitials', coalesce(v_owner.initials, ''),
    'owner_id', p_project.owner_id,
    'started', CASE WHEN p_project.started_on IS NULL THEN '' ELSE to_char(p_project.started_on, 'Mon YYYY') END,
    'deadline', CASE WHEN p_project.deadline IS NULL THEN '' ELSE to_char(p_project.deadline, 'Mon YYYY') END,
    'started_on', p_project.started_on,
    'deadline_date', p_project.deadline,
    'openTickets', v_open,
    'totalTickets', v_total,
    'progress', CASE WHEN v_total = 0 THEN 0 ELSE least(100, round(100.0 * v_resolved / greatest(v_total, 1))) END,
    'requests', v_total
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_upsert_project(p_token text, p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_org uuid;
  v_owner uuid;
  v_project public.sosticket_projects;
  v_id uuid;
  v_org_name text;
  v_code text;
  v_prefix text;
  v_seq int;
  v_status text;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  IF public.sosticket_is_client_role(v_user.role) THEN
    RAISE EXCEPTION 'Only Siyana staff can manage projects';
  END IF;

  v_org_name := nullif(trim(coalesce(p_payload->>'organization', '')), '');
  SELECT id INTO v_org FROM public.sosticket_organizations
  WHERE id::text = coalesce(p_payload->>'organization_id', '')
     OR (v_org_name IS NOT NULL AND lower(name) = lower(v_org_name))
  LIMIT 1;

  IF v_org IS NULL THEN
    IF v_org_name IS NULL THEN
      RAISE EXCEPTION 'Please choose a valid organization';
    END IF;
    INSERT INTO public.sosticket_organizations (name, type, full_name)
    VALUES (
      v_org_name,
      'government',
      coalesce(nullif(trim(coalesce(p_payload->>'organization_full', '')), ''), v_org_name)
    )
    RETURNING id INTO v_org;
  END IF;

  IF nullif(p_payload->>'owner_id', '') IS NOT NULL THEN
    v_owner := (p_payload->>'owner_id')::uuid;
  ELSIF nullif(p_payload->>'manager', '') IS NOT NULL THEN
    SELECT id INTO v_owner FROM public.sosticket_users WHERE full_name = p_payload->>'manager' LIMIT 1;
  END IF;

  v_code := nullif(upper(trim(coalesce(p_payload->>'code', ''))), '');
  IF nullif(p_payload->>'id', '') IS NOT NULL THEN
    v_id := (p_payload->>'id')::uuid;
  END IF;

  IF v_code IS NULL OR EXISTS (
    SELECT 1 FROM public.sosticket_projects p
    WHERE p.code = v_code AND (v_id IS NULL OR p.id <> v_id)
  ) THEN
    SELECT upper(left(regexp_replace(name, '[^A-Za-z0-9]', '', 'g'), 4)) INTO v_prefix
    FROM public.sosticket_organizations WHERE id = v_org;
    IF v_prefix IS NULL OR v_prefix = '' THEN
      v_prefix := 'PRJ';
    END IF;
    SELECT coalesce(max(substring(code from '[0-9]+$')::int), 0) + 1 INTO v_seq
    FROM public.sosticket_projects WHERE code ~ ('^' || v_prefix || '-[0-9]+$');
    v_code := v_prefix || '-' || lpad(v_seq::text, 3, '0');
  END IF;

  v_status := coalesce(nullif(p_payload->>'status', ''), 'Active');
  IF v_status <> 'Active' THEN
    v_status := 'Inactive';
  END IF;

  IF v_id IS NOT NULL THEN
    UPDATE public.sosticket_projects SET
      name = coalesce(nullif(p_payload->>'name', ''), name),
      code = coalesce(v_code, code),
      organization_id = v_org,
      status = v_status,
      owner_id = coalesce(v_owner, owner_id),
      started_on = coalesce((p_payload->>'started_on')::date, started_on),
      deadline = coalesce((p_payload->>'deadline')::date, deadline)
    WHERE id = v_id
    RETURNING * INTO v_project;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Project was not found';
    END IF;
  ELSE
    IF nullif(trim(coalesce(p_payload->>'name', '')), '') IS NULL THEN
      RAISE EXCEPTION 'Please enter a project name';
    END IF;
    INSERT INTO public.sosticket_projects (organization_id, name, code, status, owner_id, started_on, deadline)
    VALUES (
      v_org,
      trim(p_payload->>'name'),
      v_code,
      'Active',
      v_owner,
      coalesce(nullif(p_payload->>'started_on', '')::date, (now() AT TIME ZONE 'Asia/Kolkata')::date),
      nullif(p_payload->>'deadline', '')::date
    ) RETURNING * INTO v_project;
  END IF;

  RETURN public.sosticket_project_json(v_project);
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_dashboard_stats(p_token text, p_project_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  RETURN jsonb_build_object(
    'projects', (SELECT count(*) FROM public.sosticket_projects p WHERE public.sosticket_can_access_project(v_user, p.id) AND (p_project_id IS NULL OR p.id = p_project_id)),
    'active_tickets', (SELECT count(*) FROM public.sosticket_tickets t WHERE public.sosticket_can_access_project(v_user, t.project_id) AND (p_project_id IS NULL OR t.project_id = p_project_id) AND t.status NOT IN ('Resolved', 'Rejected')),
    'unassigned', (SELECT count(*) FROM public.sosticket_tickets t WHERE public.sosticket_can_access_project(v_user, t.project_id) AND (p_project_id IS NULL OR t.project_id = p_project_id) AND t.assignee_id IS NULL AND t.status NOT IN ('Resolved', 'Rejected')),
    'resolved_today', (SELECT count(*) FROM public.sosticket_tickets t WHERE public.sosticket_can_access_project(v_user, t.project_id) AND (p_project_id IS NULL OR t.project_id = p_project_id) AND t.status = 'Resolved' AND coalesce(t.resolved_at, t.updated_at)::date = (now() AT TIME ZONE 'Asia/Kolkata')::date),
    'trend', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'day', to_char(d::date, 'DD Mon'),
        'created', (SELECT count(*) FROM public.sosticket_tickets t WHERE public.sosticket_can_access_project(v_user, t.project_id) AND (p_project_id IS NULL OR t.project_id = p_project_id) AND t.created_at::date = d::date),
        'closed', (SELECT count(*) FROM public.sosticket_tickets t WHERE public.sosticket_can_access_project(v_user, t.project_id) AND (p_project_id IS NULL OR t.project_id = p_project_id) AND t.status = 'Resolved' AND coalesce(t.resolved_at, t.updated_at)::date = d::date)
      ) ORDER BY d), '[]'::jsonb)
      FROM generate_series((now() AT TIME ZONE 'Asia/Kolkata')::date - 13, (now() AT TIME ZONE 'Asia/Kolkata')::date, interval '1 day') AS d
    ),
    'priorities', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('name', priority, 'value', cnt)), '[]'::jsonb)
      FROM (
        SELECT t.priority, count(*)::int AS cnt
        FROM public.sosticket_tickets t
        WHERE public.sosticket_can_access_project(v_user, t.project_id) AND (p_project_id IS NULL OR t.project_id = p_project_id)
        GROUP BY t.priority
      ) s
    ),
    'workload', (
      SELECT coalesce(jsonb_agg(jsonb_build_object('team', coalesce(nullif(team, ''), 'Unassigned'), 'open', cnt) ORDER BY cnt DESC), '[]'::jsonb)
      FROM (
        SELECT t.team, count(*)::int AS cnt
        FROM public.sosticket_tickets t
        WHERE public.sosticket_can_access_project(v_user, t.project_id) AND (p_project_id IS NULL OR t.project_id = p_project_id) AND t.status NOT IN ('Resolved', 'Rejected')
        GROUP BY t.team
      ) s
    ),
    'recent', (
      SELECT coalesce(jsonb_agg(public.sosticket_ticket_json(t) ORDER BY t.created_at DESC), '[]'::jsonb)
      FROM (
        SELECT t.* FROM public.sosticket_tickets t
        WHERE public.sosticket_can_access_project(v_user, t.project_id) AND (p_project_id IS NULL OR t.project_id = p_project_id)
        ORDER BY t.created_at DESC LIMIT 8
      ) t
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_reports(p_token text, p_project_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  IF public.sosticket_is_client_role(v_user.role) THEN
    RAISE EXCEPTION 'Reports are only available in the operations console';
  END IF;
  RETURN jsonb_build_object(
    'projects', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'name', p.name,
        'code', p.code,
        'open', (SELECT count(*) FROM public.sosticket_tickets t WHERE t.project_id = p.id AND t.status NOT IN ('Resolved', 'Rejected')),
        'total', (SELECT count(*) FROM public.sosticket_tickets t WHERE t.project_id = p.id),
        'resolved', (SELECT count(*) FROM public.sosticket_tickets t WHERE t.project_id = p.id AND t.status = 'Resolved')
      ) ORDER BY p.name), '[]'::jsonb)
      FROM public.sosticket_projects p
      WHERE p_project_id IS NULL OR p.id = p_project_id
    ),
    'teams', (
      SELECT coalesce(jsonb_agg(jsonb_build_object(
        'team', coalesce(nullif(team, ''), 'Unassigned'),
        'open', count(*) FILTER (WHERE status NOT IN ('Resolved', 'Rejected')),
        'resolved', count(*) FILTER (WHERE status = 'Resolved')
      ) ORDER BY count(*) DESC), '[]'::jsonb)
      FROM public.sosticket_tickets t
      WHERE p_project_id IS NULL OR t.project_id = p_project_id
      GROUP BY t.team
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_session(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_open int;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  SELECT count(*)::int INTO v_open
  FROM public.sosticket_tickets t
  WHERE t.status NOT IN ('Resolved', 'Rejected')
    AND (
      public.sosticket_is_console_role(v_user.role)
      OR t.project_id IN (SELECT project_id FROM public.sosticket_user_projects WHERE user_id = v_user.id)
    );
  RETURN jsonb_build_object(
    'user', public.sosticket_user_json(v_user),
    'portal', CASE WHEN public.sosticket_is_client_role(v_user.role) THEN 'client' ELSE 'console' END,
    'queue_open', v_open
  );
END;
$$;

ALTER TABLE public.sosticket_tickets DROP CONSTRAINT IF EXISTS sosticket_tickets_status_check;
ALTER TABLE public.sosticket_tickets
  ADD CONSTRAINT sosticket_tickets_status_check CHECK (status IN (
    'New', 'Assigned', 'In Progress', 'Resolved', 'Rejected'
  ));

ALTER TABLE public.sosticket_projects DROP CONSTRAINT IF EXISTS sosticket_projects_status_check;
ALTER TABLE public.sosticket_projects
  ADD CONSTRAINT sosticket_projects_status_check CHECK (status IN ('Active', 'Inactive'));

ALTER TABLE public.sosticket_tickets DROP COLUMN IF EXISTS sla_due_at;
ALTER TABLE public.sosticket_tickets DROP COLUMN IF EXISTS approved_by;
ALTER TABLE public.sosticket_tickets DROP COLUMN IF EXISTS approved_at;
ALTER TABLE public.sosticket_tickets DROP COLUMN IF EXISTS category;
ALTER TABLE public.sosticket_tickets DROP COLUMN IF EXISTS request_type;
ALTER TABLE public.sosticket_projects DROP COLUMN IF EXISTS category;

DROP TABLE IF EXISTS public.sosticket_project_sla;
