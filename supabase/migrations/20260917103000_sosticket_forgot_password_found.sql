-- Unknown emails now error (UI shows "email not found"). Later forgot-password
-- mail moved to the edge function; this RPC is superseded by sosticket_prepare_password_reset.

CREATE OR REPLACE FUNCTION public.sosticket_mail_webhook_url()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 'https://default25ff3e19eb6b4343af6d1f96004e62.ab.environment.api.powerplatform.com/powerautomate/automations/direct/cu/18/workflows/4f70bd1565c140a78621b2ad2a3d618f/triggers/manual/paths/invoke'::text;
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
      'replyto', 'hr@siyanainfo.com',
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

CREATE OR REPLACE FUNCTION public.sosticket_forgot_password(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_org text;
  v_org_part text;
  v_name_part text;
  v_password text;
  v_html text;
  v_portal text;
  v_portal_key text;
BEGIN
  SELECT * INTO v_user
  FROM public.sosticket_users
  WHERE lower(email) = lower(trim(p_email))
    AND status = 'active'
  LIMIT 1;

  IF v_user.id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'No OneServe account uses this email');
  END IF;

  SELECT name INTO v_org FROM public.sosticket_organizations WHERE id = v_user.organization_id;
  v_org_part := initcap(substr(regexp_replace(coalesce(v_org, 'Org'), '[^A-Za-z]', '', 'g'), 1, 3));
  v_name_part := initcap(substr(regexp_replace(split_part(v_user.full_name, ' ', 1), '[^A-Za-z]', '', 'g'), 1, 3));
  IF v_org_part IS NULL OR v_org_part = '' THEN v_org_part := 'Org'; END IF;
  IF v_name_part IS NULL OR v_name_part = '' THEN v_name_part := 'Usr'; END IF;
  v_password := v_org_part || v_name_part || '@'
    || extract(day FROM (now() AT TIME ZONE 'Asia/Kolkata'))::int::text
    || lpad((10 + floor(random() * 90))::int::text, 2, '0');

  UPDATE public.sosticket_users
  SET password_hash = crypt(v_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = v_user.id;

  DELETE FROM public.sosticket_sessions WHERE user_id = v_user.id;

  v_portal := CASE WHEN public.sosticket_is_client_role(v_user.role)
    THEN 'Government Client Portal'
    ELSE 'Operations Console'
  END;
  v_portal_key := CASE WHEN public.sosticket_is_client_role(v_user.role) THEN 'client' ELSE 'console' END;

  v_html := public.sosticket_mail_html(
    'Password reset',
    'Your new Siyana OneServe password',
    'A password reset was requested for your ' || v_portal || ' account. Use the new password below to sign in, then change it from Settings.',
    jsonb_build_array(
      jsonb_build_object('label', 'Name', 'value', v_user.full_name),
      jsonb_build_object('label', 'Email', 'value', v_user.email),
      jsonb_build_object('label', 'Portal', 'value', v_portal),
      jsonb_build_object('label', 'New password', 'value', v_password)
    ),
    'If you did not request this reset, contact Siyana operations immediately.'
  );

  PERFORM public.sosticket_send_flow_email(
    v_user.email,
    'Your Siyana OneServe password has been reset',
    v_html
  );

  RETURN jsonb_build_object(
    'ok', true,
    'sent', true,
    'portal', v_portal_key,
    'email', v_user.email
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sosticket_forgot_password(text) TO anon, authenticated;
