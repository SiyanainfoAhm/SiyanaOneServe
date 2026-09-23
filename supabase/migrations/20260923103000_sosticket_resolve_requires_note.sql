-- Require a resolution comment when marking Resolved.
-- Comment is stored as a client-visible note and included in status emails.

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
  v_resolve_note text;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  IF public.sosticket_is_client_role(v_user.role) THEN
    RAISE EXCEPTION 'Government users cannot change ticket status or assignment';
  END IF;
  v_ticket := public.sosticket_require_ticket(v_user, coalesce(p_payload->>'id', p_payload->>'ticket_no'));
  v_old_status := v_ticket.status;
  IF v_old_status = 'Resolved' THEN
    RAISE EXCEPTION 'This ticket is already closed';
  END IF;
  v_status := coalesce(nullif(p_payload->>'status', ''), v_ticket.status);
  IF v_status NOT IN ('New', 'Assigned', 'In Progress', 'Resolved') THEN
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

  -- Mandatory resolution comment before closing; insert note while still open.
  IF v_status = 'Resolved' AND v_old_status IS DISTINCT FROM 'Resolved' THEN
    v_resolve_note := nullif(trim(coalesce(
      p_payload->>'resolve_note',
      p_payload->>'note',
      p_payload->>'comment',
      ''
    )), '');
    IF v_resolve_note IS NULL THEN
      RAISE EXCEPTION 'A resolution comment is required before marking this ticket Resolved';
    END IF;

    INSERT INTO public.sosticket_ticket_messages (ticket_id, author_id, body, visibility)
    VALUES (v_ticket.id, v_user.id, v_resolve_note, 'client');

    PERFORM public.sosticket_add_event(
      v_ticket.id,
      v_user.id,
      'message_added',
      'Resolution note added',
      left(v_resolve_note, 140)
    );
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
        CASE
          WHEN v_resolve_note IS NOT NULL THEN v_ticket.title || E'\n\n' || v_resolve_note
          ELSE v_ticket.title
        END,
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
    v_rows := jsonb_build_array(
      jsonb_build_object('label', 'Ticket', 'value', NEW.ticket_no),
      jsonb_build_object('label', 'Title', 'value', NEW.title),
      jsonb_build_object('label', 'Previous status', 'value', OLD.status),
      jsonb_build_object('label', 'New status', 'value', NEW.status),
      jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
      jsonb_build_object('label', 'Assignee', 'value', coalesce(v_asg.full_name, 'Unassigned'))
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
