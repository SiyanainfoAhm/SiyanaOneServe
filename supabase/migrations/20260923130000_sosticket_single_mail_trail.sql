-- Single mail trail per ticket: stable subject + Message-ID threading.
-- First ticket email becomes the root; later assign/status/comment mails reply into that trail.
-- Power Automate should map email.messageId / inReplyTo / references onto the send action headers.

ALTER TABLE public.sosticket_tickets
  ADD COLUMN IF NOT EXISTS mail_thread_id text,
  ADD COLUMN IF NOT EXISTS mail_subject text;

CREATE OR REPLACE FUNCTION public.sosticket_prepare_ticket_mail(p_ticket_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_ticket public.sosticket_tickets;
  v_msg_id text;
  v_subject text;
  v_in_reply text := NULL;
  v_refs text := NULL;
BEGIN
  IF p_ticket_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_ticket
  FROM public.sosticket_tickets
  WHERE id = p_ticket_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_msg_id := '<'
    || replace(gen_random_uuid()::text, '-', '')
    || '.'
    || lower(regexp_replace(v_ticket.ticket_no, '[^A-Za-z0-9]+', '-', 'g'))
    || '@tickets.siyanainfo.com>';

  v_subject := coalesce(
    nullif(trim(v_ticket.mail_subject), ''),
    v_ticket.ticket_no || ' · ' || left(coalesce(nullif(trim(v_ticket.title), ''), 'Ticket'), 120)
  );

  IF nullif(trim(coalesce(v_ticket.mail_thread_id, '')), '') IS NULL THEN
    UPDATE public.sosticket_tickets
    SET
      mail_thread_id = v_msg_id,
      mail_subject = v_subject
    WHERE id = p_ticket_id;
  ELSE
    v_in_reply := trim(v_ticket.mail_thread_id);
    v_refs := trim(v_ticket.mail_thread_id);
    IF nullif(trim(coalesce(v_ticket.mail_subject, '')), '') IS NULL THEN
      UPDATE public.sosticket_tickets
      SET mail_subject = v_subject
      WHERE id = p_ticket_id;
    ELSE
      v_subject := trim(v_ticket.mail_subject);
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'subject', v_subject,
    'messageId', v_msg_id,
    'inReplyTo', coalesce(v_in_reply, ''),
    'references', coalesce(v_refs, ''),
    'ticketNo', v_ticket.ticket_no,
    'conversationId', v_ticket.ticket_no
  );
END;
$$;

DROP FUNCTION IF EXISTS public.sosticket_send_flow_email(text, text, text, text);

CREATE OR REPLACE FUNCTION public.sosticket_send_flow_email(
  p_to text,
  p_subject text,
  p_html text,
  p_cc text DEFAULT NULL,
  p_ticket_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'net', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_thread jsonb;
  v_subject text := coalesce(p_subject, 'Siyana OneServe');
  v_message_id text := '';
  v_in_reply_to text := '';
  v_references text := '';
  v_ticket_no text := '';
  v_conversation_id text := '';
BEGIN
  IF p_to IS NULL OR length(trim(p_to)) < 3 OR p_html IS NULL THEN
    RETURN;
  END IF;

  IF p_ticket_id IS NOT NULL THEN
    v_thread := public.sosticket_prepare_ticket_mail(p_ticket_id);
    IF v_thread IS NOT NULL THEN
      v_subject := coalesce(nullif(v_thread->>'subject', ''), v_subject);
      v_message_id := coalesce(v_thread->>'messageId', '');
      v_in_reply_to := coalesce(v_thread->>'inReplyTo', '');
      v_references := coalesce(v_thread->>'references', '');
      v_ticket_no := coalesce(v_thread->>'ticketNo', '');
      v_conversation_id := coalesce(v_thread->>'conversationId', '');
    END IF;
  END IF;

  PERFORM net.http_post(
    url := public.sosticket_mail_webhook_url(),
    params := jsonb_build_object(
      'api-version', '1',
      'sp', '/triggers/manual/run',
      'sv', '1.0',
      'sig', '_FpfAY_F-d0VpUpINYLRtjFMY_t4mu58TCRruIP62u4'
    ),
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'success', true,
      'email', jsonb_build_object(
        'toEmail', trim(p_to),
        'ccEmail', coalesce(trim(p_cc), ''),
        'fromEmail', 'tickets@siyanainfo.com',
        'replyTo', 'tickets@siyanainfo.com',
        'subject', v_subject,
        'bodyHtml', p_html,
        'leadTypeHtml', '',
        'submittedAtHtml', to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD"T"HH24:MI:SS'),
        'detailsTableHtml', '',
        'messageId', v_message_id,
        'inReplyTo', v_in_reply_to,
        'references', v_references,
        'ticketNo', v_ticket_no,
        'conversationId', v_conversation_id
      )
    ),
    timeout_milliseconds := 8000
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'sosticket_send_flow_email failed: %', SQLERRM;
END;
$$;

DROP FUNCTION IF EXISTS public.sosticket_email_project_manager(uuid, uuid[], text, text, text, jsonb, text, text);

CREATE OR REPLACE FUNCTION public.sosticket_email_project_manager(
  p_project_id uuid,
  p_exclude_user_ids uuid[],
  p_eyebrow text,
  p_title text,
  p_intro text,
  p_rows jsonb,
  p_note text,
  p_subject text,
  p_ticket_id uuid DEFAULT NULL
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
    public.sosticket_mail_html(p_eyebrow, p_title, p_intro, p_rows, p_note),
    NULL,
    p_ticket_id
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
      NEW.ticket_no || ' · ' || NEW.title,
      v_html,
      NULL,
      NEW.id
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
      NEW.ticket_no || ' · ' || NEW.title,
      NEW.id
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
        NEW.ticket_no || ' · ' || NEW.title,
        v_html,
        NULL,
        NEW.id
      );
    END IF;

    IF v_asg.email IS NOT NULL AND (v_req.id IS NULL OR v_asg.id IS DISTINCT FROM v_req.id) THEN
      PERFORM public.sosticket_send_flow_email(
        v_asg.email,
        NEW.ticket_no || ' · ' || NEW.title,
        v_html,
        NULL,
        NEW.id
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
      NEW.ticket_no || ' · ' || NEW.title,
      NEW.id
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
      jsonb_build_object('label', 'Assignee', 'value', public.sosticket_ticket_assignee_display(v_ticket.assignee_id, v_ticket.project_id, v_ticket.team)),
      jsonb_build_object('label', 'Requester', 'value', v_user.full_name)
    ),
    'Open the Operations Console to review and assign this request.',
    v_ticket.ticket_no || ' · ' || v_ticket.title,
    v_ticket.id
  );

  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_add_message(
  p_token text,
  p_ticket_id text,
  p_body text,
  p_visibility text DEFAULT 'client'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_ticket public.sosticket_tickets;
  v_vis text;
  v_preview text;
  v_org text;
  v_project text;
  v_client_ids uuid[];
  v_staff_ids uuid[];
  v_recipient public.sosticket_users;
  v_html text;
  v_rows jsonb;
  v_subject text;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  v_ticket := public.sosticket_require_ticket(v_user, p_ticket_id);
  IF v_ticket.status IN ('Resolved', 'Closed') THEN
    RAISE EXCEPTION 'Notes cannot be added after this ticket is resolved';
  END IF;
  IF p_body IS NULL OR length(trim(p_body)) = 0 THEN
    RAISE EXCEPTION 'Please enter a message';
  END IF;
  v_vis := CASE
    WHEN public.sosticket_is_client_role(v_user.role) THEN 'client'
    WHEN lower(coalesce(p_visibility, 'client')) = 'internal' THEN 'internal'
    ELSE 'client'
  END;

  INSERT INTO public.sosticket_ticket_messages (ticket_id, author_id, body, visibility)
  VALUES (v_ticket.id, v_user.id, trim(p_body), v_vis);

  v_preview := left(trim(p_body), 280);

  PERFORM public.sosticket_add_event(
    v_ticket.id,
    v_user.id,
    'message_added',
    CASE WHEN v_vis = 'internal' THEN 'Internal note added' ELSE 'Message added' END,
    left(v_preview, 140)
  );

  SELECT name INTO v_org FROM public.sosticket_organizations WHERE id = v_ticket.organization_id;
  SELECT name INTO v_project FROM public.sosticket_projects WHERE id = v_ticket.project_id;

  IF v_vis = 'client' THEN
    SELECT coalesce(array_agg(DISTINCT u.id), ARRAY[]::uuid[]) INTO v_client_ids
    FROM public.sosticket_users u
    WHERE u.id <> v_user.id
      AND u.status = 'active'
      AND public.sosticket_is_client_role(u.role)
      AND (
        u.id = v_ticket.requester_id
        OR EXISTS (
          SELECT 1 FROM public.sosticket_user_projects up
          WHERE up.user_id = u.id AND up.project_id = v_ticket.project_id
        )
      );

    PERFORM public.sosticket_notify_users(
      v_client_ids,
      'You have a comment on your ticket',
      v_ticket.ticket_no || ' · ' || v_user.full_name || ': ' || v_preview,
      '/client/requests/' || v_ticket.ticket_no,
      v_ticket.id
    );
  END IF;

  SELECT coalesce(array_agg(DISTINCT u.id), ARRAY[]::uuid[]) INTO v_staff_ids
  FROM public.sosticket_users u
  WHERE u.id <> v_user.id
    AND u.status = 'active'
    AND public.sosticket_is_console_role(u.role)
    AND (
      u.id = v_ticket.assignee_id
      OR EXISTS (
        SELECT 1 FROM public.sosticket_projects p
        WHERE p.id = v_ticket.project_id AND p.owner_id = u.id
      )
    );

  PERFORM public.sosticket_notify_users(
    v_staff_ids,
    'You have a comment on your ticket',
    v_ticket.ticket_no || ' · ' || v_user.full_name || ': ' || v_preview,
    '/console/tickets/' || v_ticket.ticket_no,
    v_ticket.id
  );

  v_rows := jsonb_build_array(
    jsonb_build_object('label', 'Ticket', 'value', v_ticket.ticket_no),
    jsonb_build_object('label', 'Title', 'value', v_ticket.title),
    jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
    jsonb_build_object('label', 'Organization', 'value', coalesce(v_org, '')),
    jsonb_build_object('label', 'From', 'value', coalesce(v_user.full_name, '')),
    jsonb_build_object('label', 'Comment', 'value', v_preview)
  );
  v_subject := v_ticket.ticket_no || ' · ' || v_ticket.title;
  v_html := public.sosticket_mail_html(
    'Ticket comment',
    'You have a comment on your ticket',
    coalesce(v_user.full_name, 'Someone') || ' added a comment on ' || v_ticket.ticket_no || '.',
    v_rows,
    CASE
      WHEN v_vis = 'internal' THEN 'This is an internal note visible to the Siyana team.'
      ELSE 'Open the ticket in Siyana OneServe to reply.'
    END
  );

  FOR v_recipient IN
    SELECT u.*
    FROM public.sosticket_users u
    WHERE u.id <> v_user.id
      AND u.status = 'active'
      AND coalesce(u.notify_email, true) = true
      AND coalesce(trim(u.email), '') <> ''
      AND (
        (
          v_vis = 'client'
          AND public.sosticket_is_client_role(u.role)
          AND (
            u.id = v_ticket.requester_id
            OR EXISTS (
              SELECT 1 FROM public.sosticket_user_projects up
              WHERE up.user_id = u.id AND up.project_id = v_ticket.project_id
            )
          )
        )
        OR (
          public.sosticket_is_console_role(u.role)
          AND (
            u.id = v_ticket.assignee_id
            OR EXISTS (
              SELECT 1 FROM public.sosticket_projects p
              WHERE p.id = v_ticket.project_id AND p.owner_id = u.id
            )
          )
        )
      )
  LOOP
    PERFORM public.sosticket_send_flow_email(
      v_recipient.email,
      v_subject,
      v_html,
      NULL,
      v_ticket.id
    );
  END LOOP;

  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
END;
$$;

REVOKE ALL ON FUNCTION public.sosticket_prepare_ticket_mail(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sosticket_send_flow_email(text, text, text, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sosticket_email_project_manager(uuid, uuid[], text, text, text, jsonb, text, text, uuid) FROM PUBLIC;
