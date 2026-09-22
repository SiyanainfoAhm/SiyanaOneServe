-- Nested Power Automate body: { success, email: { toEmail, bodyHtml, … } }.
-- Flat toemail left Send Email V2 To empty (Bad Request).

CREATE OR REPLACE FUNCTION public.sosticket_send_flow_email(
  p_to text,
  p_subject text,
  p_html text,
  p_cc text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'net', 'extensions', 'pg_temp'
AS $$
BEGIN
  IF p_to IS NULL OR length(trim(p_to)) < 3 OR p_html IS NULL THEN
    RETURN;
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
        'replyTo', 'tickets@siyanainfo.com',
        'subject', coalesce(p_subject, 'Siyana OneServe'),
        'bodyHtml', p_html,
        'leadTypeHtml', '',
        'submittedAtHtml', to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD"T"HH24:MI:SS'),
        'detailsTableHtml', ''
      )
    ),
    timeout_milliseconds := 8000
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'sosticket_send_flow_email failed: %', SQLERRM;
END;
$$;
