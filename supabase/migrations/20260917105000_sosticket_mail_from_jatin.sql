-- Mail From / Reply-To: tickets@siyanainfo.com (replaces hr@siyanainfo.com).

CREATE OR REPLACE FUNCTION public.sosticket_mail_html(
  p_eyebrow text,
  p_title text,
  p_intro text,
  p_rows jsonb,
  p_note text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_rows text := '';
  v_item jsonb;
BEGIN
  FOR v_item IN SELECT value FROM jsonb_array_elements(coalesce(p_rows, '[]'::jsonb))
  LOOP
    v_rows := v_rows
      || '<tr>'
      || '<td style="padding:8px 0;font-size:13px;color:#64748b;width:140px;vertical-align:top;">'
      || public.sosticket_html_escape(v_item->>'label')
      || '</td>'
      || '<td style="padding:8px 0;font-size:13px;color:#0f172a;font-weight:600;">'
      || public.sosticket_html_escape(v_item->>'value')
      || '</td></tr>';
  END LOOP;

  RETURN '<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Arial,sans-serif;">'
    || '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:24px 12px;">'
    || '<tr><td align="center">'
    || '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;">'
    || '<tr><td style="background:#1e3a5f;padding:18px 24px;color:#ffffff;font-size:14px;font-weight:700;">Siyana OneServe</td></tr>'
    || '<tr><td style="padding:24px;">'
    || '<p style="margin:0 0 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">'
    || public.sosticket_html_escape(p_eyebrow) || '</p>'
    || '<h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">' || public.sosticket_html_escape(p_title) || '</h1>'
    || '<p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#334155;">' || public.sosticket_html_escape(p_intro) || '</p>'
    || '<table role="presentation" width="100%" cellpadding="0" cellspacing="0">' || v_rows || '</table>'
    || CASE WHEN p_note IS NOT NULL AND p_note <> '' THEN
        '<p style="margin:16px 0 0;font-size:12px;line-height:1.5;color:#64748b;">' || public.sosticket_html_escape(p_note) || '</p>'
      ELSE '' END
    || '</td></tr>'
    || '<tr><td style="padding:14px 24px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;">Sent by Siyana Info Solutions · tickets@siyanainfo.com</td></tr>'
    || '</table></td></tr></table></body></html>';
END;
$$;

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
      'toemail', trim(p_to),
      'ccemail', coalesce(trim(p_cc), ''),
      'fromemail', 'tickets@siyanainfo.com',
      'replyto', 'tickets@siyanainfo.com',
      'subject', coalesce(p_subject, 'Siyana OneServe'),
      'bodyhtml', p_html,
      'attachment', '',
      'submittedAt', to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD"T"HH24:MI:SS')
    ),
    timeout_milliseconds := 8000
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'sosticket_send_flow_email failed: %', SQLERRM;
END;
$$;
