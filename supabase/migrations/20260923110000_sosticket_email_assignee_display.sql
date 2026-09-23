-- Ensure every ticket email shows a proper Assignee value:
-- assigned staff first, else project manager, else team name.

CREATE OR REPLACE FUNCTION public.sosticket_ticket_assignee_display(
  p_assignee_id uuid,
  p_project_id uuid,
  p_team text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_name text;
BEGIN
  IF p_assignee_id IS NOT NULL THEN
    SELECT nullif(trim(u.full_name), '') INTO v_name
    FROM public.sosticket_users u
    WHERE u.id = p_assignee_id;
    IF v_name IS NOT NULL THEN
      RETURN v_name;
    END IF;
  END IF;

  SELECT nullif(trim(u.full_name), '') INTO v_name
  FROM public.sosticket_projects p
  JOIN public.sosticket_users u ON u.id = p.owner_id
  WHERE p.id = p_project_id
  LIMIT 1;
  IF v_name IS NOT NULL THEN
    RETURN v_name;
  END IF;

  v_name := nullif(trim(coalesce(p_team, '')), '');
  IF v_name IS NOT NULL AND v_name <> 'Unassigned' THEN
    RETURN v_name;
  END IF;

  RETURN 'Unassigned';
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
  v_resolve_note text;
  v_rows jsonb;
  v_footer text;
  v_assignee_label text;
BEGIN
  SELECT name INTO v_org FROM public.sosticket_organizations WHERE id = NEW.organization_id;
  SELECT name INTO v_project FROM public.sosticket_projects WHERE id = NEW.project_id;
  SELECT * INTO v_req FROM public.sosticket_users WHERE id = NEW.requester_id;
  SELECT * INTO v_asg FROM public.sosticket_users WHERE id = NEW.assignee_id;
  v_assignee_label := public.sosticket_ticket_assignee_display(NEW.assignee_id, NEW.project_id, NEW.team);

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
        jsonb_build_object('label', 'Assignee', 'value', v_assignee_label),
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
        jsonb_build_object('label', 'Assignee', 'value', v_assignee_label),
        jsonb_build_object('label', 'Requester', 'value', coalesce(v_req.full_name, ''))
      ),
      'Sign in to the Operations Console to review this ticket.',
      'Assigned · ' || NEW.ticket_no || ' · ' || NEW.title
    );
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT (v_assigned AND NEW.status = 'Assigned') THEN
    v_rows := jsonb_build_array(
      jsonb_build_object('label', 'Ticket', 'value', NEW.ticket_no),
      jsonb_build_object('label', 'Title', 'value', NEW.title),
      jsonb_build_object('label', 'Previous status', 'value', OLD.status),
      jsonb_build_object('label', 'New status', 'value', NEW.status),
      jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
      jsonb_build_object('label', 'Assignee', 'value', v_assignee_label)
    );
    v_footer := 'Open the ticket in Siyana OneServe for the latest conversation and timeline.';

    IF NEW.status = 'Resolved' THEN
      SELECT m.body INTO v_resolve_note
      FROM public.sosticket_ticket_messages m
      WHERE m.ticket_id = NEW.id
        AND m.visibility = 'client'
      ORDER BY m.created_at DESC
      LIMIT 1;

      IF nullif(trim(coalesce(v_resolve_note, '')), '') IS NOT NULL THEN
        v_rows := v_rows || jsonb_build_array(
          jsonb_build_object('label', 'Resolution note', 'value', v_resolve_note)
        );
        v_footer := 'Resolution note: ' || left(trim(v_resolve_note), 500);
      END IF;
    END IF;

    v_html := public.sosticket_mail_html(
      'Ticket status updated',
      'Status changed to ' || NEW.status,
      'A Siyana OneServe request you are connected to has a new status.',
      v_rows,
      v_footer
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
      v_rows,
      v_footer,
      NEW.ticket_no || ' is now ' || NEW.status || ' · ' || NEW.title
    );
  END IF;

  RETURN NEW;
END;
$$;

-- New-request email also includes Assignee (project manager until staff assigns).
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
      jsonb_build_object('label', 'Assignee', 'value', public.sosticket_ticket_assignee_display(v_ticket.assignee_id, v_ticket.project_id, v_ticket.team)),
      jsonb_build_object('label', 'Requester', 'value', v_user.full_name)
    ),
    'Open the Operations Console to review and assign this request.',
    'New request · ' || v_ticket.ticket_no || ' · ' || v_ticket.title
  );

  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
END;
$$;

REVOKE ALL ON FUNCTION public.sosticket_ticket_assignee_display(uuid, uuid, text) FROM PUBLIC;
