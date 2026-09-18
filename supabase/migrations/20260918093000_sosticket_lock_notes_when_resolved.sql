-- Notes stay visible after resolve/reject, but new messages cannot be added.

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
BEGIN
  v_user := public.sosticket_require_user(p_token);
  v_ticket := public.sosticket_require_ticket(v_user, p_ticket_id);
  IF v_ticket.status IN ('Resolved', 'Rejected', 'Closed') THEN
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
  PERFORM public.sosticket_add_event(
    v_ticket.id,
    v_user.id,
    'message_added',
    CASE WHEN v_vis = 'internal' THEN 'Internal note added' ELSE 'Message added' END,
    left(trim(p_body), 140)
  );
  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
END;
$$;
