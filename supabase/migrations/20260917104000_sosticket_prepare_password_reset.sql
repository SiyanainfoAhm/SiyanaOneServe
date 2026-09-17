-- Service-role only: reset password, return subject/html for the edge function.
-- Does not email from SQL (pg_net To-field was empty). Browser never sees the new password.

CREATE OR REPLACE FUNCTION public.sosticket_prepare_password_reset(p_email text)
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
    RETURN jsonb_build_object('found', false);
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

  RETURN jsonb_build_object(
    'found', true,
    'email', v_user.email,
    'portal', v_portal_key,
    'subject', 'Your Siyana OneServe password has been reset',
    'html', v_html
  );
END;
$$;

REVOKE ALL ON FUNCTION public.sosticket_prepare_password_reset(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sosticket_prepare_password_reset(text) TO service_role;
