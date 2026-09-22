-- Email the project manager (sosticket_projects.owner_id) in addition to
-- existing recipients. Does not change ticket or project workflow.

CREATE OR REPLACE FUNCTION public.sosticket_email_project_manager(
  p_project_id uuid,
  p_exclude_user_ids uuid[],
  p_eyebrow text,
  p_title text,
  p_intro text,
  p_rows jsonb,
  p_note text,
  p_subject text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_mgr public.sosticket_users;
BEGIN
  SELECT u.* INTO v_mgr
  FROM public.sosticket_projects p
  JOIN public.sosticket_users u ON u.id = p.owner_id
  WHERE p.id = p_project_id
    AND u.status = 'active'
    AND coalesce(trim(u.email), '') <> ''
  LIMIT 1;

  IF v_mgr.id IS NULL THEN
    RETURN;
  END IF;

  IF p_exclude_user_ids IS NOT NULL AND v_mgr.id = ANY (p_exclude_user_ids) THEN
    RETURN;
  END IF;

  PERFORM public.sosticket_send_flow_email(
    v_mgr.email,
    p_subject,
    public.sosticket_mail_html(p_eyebrow, p_title, p_intro, p_rows, p_note)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_email_ticket_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_req public.sosticket_users;
  v_asg public.sosticket_users;
  v_org text;
  v_project text;
  v_html text;
  v_assigned boolean := false;
BEGIN
  SELECT name INTO v_org FROM public.sosticket_organizations WHERE id = NEW.organization_id;
  SELECT name INTO v_project FROM public.sosticket_projects WHERE id = NEW.project_id;
  SELECT * INTO v_req FROM public.sosticket_users WHERE id = NEW.requester_id;
  SELECT * INTO v_asg FROM public.sosticket_users WHERE id = NEW.assignee_id;

  v_assigned := NEW.assignee_id IS NOT NULL AND NEW.assignee_id IS DISTINCT FROM OLD.assignee_id;

  IF v_assigned AND v_asg.email IS NOT NULL THEN
    v_html := public.sosticket_mail_html(
      'Ticket assigned',
      'A ticket has been assigned to you',
      'You have been assigned a service request in Siyana OneServe. Please review it in the Operations Console.',
      jsonb_build_array(
        jsonb_build_object('label', 'Ticket', 'value', NEW.ticket_no),
        jsonb_build_object('label', 'Title', 'value', NEW.title),
        jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
        jsonb_build_object('label', 'Organization', 'value', coalesce(v_org, '')),
        jsonb_build_object('label', 'Priority', 'value', NEW.priority),
        jsonb_build_object('label', 'Status', 'value', NEW.status),
        jsonb_build_object('label', 'Requester', 'value', coalesce(v_req.full_name, ''))
      ),
      'Sign in to the Operations Console to pick up this ticket.'
    );
    PERFORM public.sosticket_send_flow_email(
      v_asg.email,
      'Assigned to you · ' || NEW.ticket_no || ' · ' || NEW.title,
      v_html
    );
  END IF;

  IF v_assigned THEN
    PERFORM public.sosticket_email_project_manager(
      NEW.project_id,
      ARRAY[NEW.assignee_id],
      'Ticket assigned',
      'A ticket was assigned on your project',
      'A service request on your project was assigned. Please review it in the Operations Console.',
      jsonb_build_array(
        jsonb_build_object('label', 'Ticket', 'value', NEW.ticket_no),
        jsonb_build_object('label', 'Title', 'value', NEW.title),
        jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
        jsonb_build_object('label', 'Organization', 'value', coalesce(v_org, '')),
        jsonb_build_object('label', 'Priority', 'value', NEW.priority),
        jsonb_build_object('label', 'Status', 'value', NEW.status),
        jsonb_build_object('label', 'Assigned to', 'value', coalesce(v_asg.full_name, '')),
        jsonb_build_object('label', 'Requester', 'value', coalesce(v_req.full_name, ''))
      ),
      'Sign in to the Operations Console to review this ticket.',
      'Assigned · ' || NEW.ticket_no || ' · ' || NEW.title
    );
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT (v_assigned AND NEW.status = 'Assigned') THEN
    v_html := public.sosticket_mail_html(
      'Ticket status updated',
      'Status changed to ' || NEW.status,
      'A Siyana OneServe request you are connected to has a new status.',
      jsonb_build_array(
        jsonb_build_object('label', 'Ticket', 'value', NEW.ticket_no),
        jsonb_build_object('label', 'Title', 'value', NEW.title),
        jsonb_build_object('label', 'Previous status', 'value', OLD.status),
        jsonb_build_object('label', 'New status', 'value', NEW.status),
        jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
        jsonb_build_object('label', 'Assignee', 'value', coalesce(v_asg.full_name, 'Unassigned'))
      ),
      'Open the ticket in Siyana OneServe for the latest conversation and timeline.'
    );

    IF v_req.email IS NOT NULL THEN
      PERFORM public.sosticket_send_flow_email(
        v_req.email,
        NEW.ticket_no || ' is now ' || NEW.status || ' · ' || NEW.title,
        v_html
      );
    END IF;

    IF v_asg.email IS NOT NULL AND (v_req.id IS NULL OR v_asg.id IS DISTINCT FROM v_req.id) THEN
      PERFORM public.sosticket_send_flow_email(
        v_asg.email,
        NEW.ticket_no || ' is now ' || NEW.status || ' · ' || NEW.title,
        v_html
      );
    END IF;

    PERFORM public.sosticket_email_project_manager(
      NEW.project_id,
      ARRAY[NEW.requester_id, NEW.assignee_id],
      'Ticket status updated',
      'Status changed to ' || NEW.status,
      'A request on your project has a new status.',
      jsonb_build_array(
        jsonb_build_object('label', 'Ticket', 'value', NEW.ticket_no),
        jsonb_build_object('label', 'Title', 'value', NEW.title),
        jsonb_build_object('label', 'Previous status', 'value', OLD.status),
        jsonb_build_object('label', 'New status', 'value', NEW.status),
        jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
        jsonb_build_object('label', 'Assignee', 'value', coalesce(v_asg.full_name, 'Unassigned'))
      ),
      'Open the ticket in Siyana OneServe for the latest conversation and timeline.',
      NEW.ticket_no || ' is now ' || NEW.status || ' · ' || NEW.title
    );
  END IF;

  RETURN NEW;
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
  v_org text;
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

  SELECT name INTO v_org FROM public.sosticket_organizations WHERE id = v_project.organization_id;
  PERFORM public.sosticket_email_project_manager(
    v_project.id,
    ARRAY[v_user.id],
    'New request',
    'A new request was created on your project',
    'A service request was raised in Siyana OneServe on a project you manage.',
    jsonb_build_array(
      jsonb_build_object('label', 'Ticket', 'value', v_ticket.ticket_no),
      jsonb_build_object('label', 'Title', 'value', v_ticket.title),
      jsonb_build_object('label', 'Project', 'value', coalesce(v_project.name, '')),
      jsonb_build_object('label', 'Organization', 'value', coalesce(v_org, '')),
      jsonb_build_object('label', 'Priority', 'value', v_ticket.priority),
      jsonb_build_object('label', 'Status', 'value', v_ticket.status),
      jsonb_build_object('label', 'Requester', 'value', v_user.full_name)
    ),
    'Open the Operations Console to review and assign this request.',
    'New request · ' || v_ticket.ticket_no || ' · ' || v_ticket.title
  );

  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
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
  v_created boolean := false;
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
    v_created := true;
  END IF;

  IF v_created AND v_project.owner_id IS NOT NULL THEN
    SELECT name INTO v_org_name FROM public.sosticket_organizations WHERE id = v_project.organization_id;
    PERFORM public.sosticket_email_project_manager(
      v_project.id,
      ARRAY[]::uuid[],
      'New project',
      'You have been assigned as Project Manager',
      'A new project was created in Siyana OneServe and you are listed as the Project Manager.',
      jsonb_build_array(
        jsonb_build_object('label', 'Project', 'value', v_project.name),
        jsonb_build_object('label', 'Code', 'value', v_project.code),
        jsonb_build_object('label', 'Organization', 'value', coalesce(v_org_name, '')),
        jsonb_build_object('label', 'Status', 'value', v_project.status),
        jsonb_build_object('label', 'Created by', 'value', v_user.full_name)
      ),
      'Open the Operations Console to review the project.',
      'New project · ' || v_project.code || ' · ' || v_project.name
    );
  END IF;

  RETURN public.sosticket_project_json(v_project);
END;
$$;

REVOKE ALL ON FUNCTION public.sosticket_email_project_manager(uuid, uuid[], text, text, text, jsonb, text, text) FROM PUBLIC;
