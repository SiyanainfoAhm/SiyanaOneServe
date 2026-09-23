-- Attachments stay visible after resolve/reject, but new files cannot be uploaded.

CREATE OR REPLACE FUNCTION public.sosticket_register_attachment(
  p_token text,
  p_ticket_id text,
  p_file_name text,
  p_file_path text,
  p_file_size bigint DEFAULT NULL::bigint,
  p_mime_type text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_ticket public.sosticket_tickets;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  v_ticket := public.sosticket_require_ticket(v_user, p_ticket_id);
  IF v_ticket.status IN ('Resolved', 'Rejected', 'Closed') THEN
    RAISE EXCEPTION 'Files cannot be uploaded after this ticket is resolved';
  END IF;
  INSERT INTO public.sosticket_attachments (ticket_id, file_name, file_path, file_size, mime_type, uploaded_by)
  VALUES (v_ticket.id, p_file_name, p_file_path, p_file_size, p_mime_type, v_user.id);
  RETURN public.sosticket_get_ticket(p_token, v_ticket.ticket_no);
END;
$$;
