-- Add a Siyana OneServe button on every outbound mail template.

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
    || '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 0;">'
    || '<tr><td>'
    || '<a href="https://siyana-oneserve.vercel.app/" target="_blank" style="display:inline-block;background:#1e3a5f;color:#ffffff;font-size:14px;font-weight:700;line-height:1;text-decoration:none;padding:12px 20px;border-radius:6px;">Siyana OneServe</a>'
    || '</td></tr></table>'
    || '</td></tr>'
    || '<tr><td style="padding:14px 24px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;">Sent by Siyana Info Solutions · jatin.saksena@siyanainfo.com</td></tr>'
    || '</table></td></tr></table></body></html>';
END;
$$;
