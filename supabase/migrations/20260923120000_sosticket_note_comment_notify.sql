-- Email + in-app notification when someone adds a note/comment on a ticket.
-- Client-visible notes notify requester, project government users, assignee, and project manager.
-- Internal notes notify assignee and project manager only (not government users).

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

  -- In-app: government recipients (client-visible notes only)
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

  -- In-app: staff recipients (assignee + project manager, never the author)
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

  -- Email recipients: same people, respect notify_email
  v_rows := jsonb_build_array(
    jsonb_build_object('label', 'Ticket', 'value', v_ticket.ticket_no),
    jsonb_build_object('label', 'Title', 'value', v_ticket.title),
    jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
    jsonb_build_object('label', 'Organization', 'value', coalesce(v_org, '')),
    jsonb_build_object('label', 'From', 'value', coalesce(v_user.full_name, '')),
    jsonb_build_object('label', 'Comment', 'value', v_preview)
  );
  v_subject := 'New comment · ' || v_ticket.ticket_no || ' · ' || v_ticket.title;
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
    PERFORM public.sosticket_send_flow_email(v_recipient.email, v_subject, v_html);
  END LOOP;

  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
END;
$$;
