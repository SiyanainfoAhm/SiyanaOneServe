-- Resend invitation mail for an existing user. Issues a new password and
-- emails the same login-details template used by Invite User.

CREATE OR REPLACE FUNCTION public.sosticket_resend_invite(
  p_token text,
  p_user_id text,
  p_password text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_target public.sosticket_users;
  v_org_name text;
  v_password text;
  v_html text;
  v_portal text;
  v_org_part text;
  v_name_part text;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  IF public.sosticket_is_client_role(v_user.role) THEN
    RAISE EXCEPTION 'Only Siyana staff can resend invitations';
  END IF;

  SELECT * INTO v_target
  FROM public.sosticket_users
  WHERE id::text = trim(coalesce(p_user_id, ''))
  LIMIT 1;
  IF v_target.id IS NULL THEN
    RAISE EXCEPTION 'User was not found';
  END IF;
  IF coalesce(trim(v_target.email), '') = '' THEN
    RAISE EXCEPTION 'This user does not have an email address';
  END IF;

  SELECT name INTO v_org_name FROM public.sosticket_organizations WHERE id = v_target.organization_id;
  v_org_part := initcap(substr(regexp_replace(coalesce(v_org_name, 'Org'), '[^A-Za-z]', '', 'g'), 1, 3));
  v_name_part := initcap(substr(regexp_replace(split_part(v_target.full_name, ' ', 1), '[^A-Za-z]', '', 'g'), 1, 3));
  IF v_org_part IS NULL OR v_org_part = '' THEN v_org_part := 'Org'; END IF;
  IF v_name_part IS NULL OR v_name_part = '' THEN v_name_part := 'Usr'; END IF;

  v_password := coalesce(nullif(trim(p_password), ''), v_org_part || v_name_part || '@'
    || extract(day FROM (now() AT TIME ZONE 'Asia/Kolkata'))::int::text);

  UPDATE public.sosticket_users
  SET password_hash = crypt(v_password, gen_salt('bf'))
  WHERE id = v_target.id;

  DELETE FROM public.sosticket_sessions WHERE user_id = v_target.id;

  v_portal := CASE WHEN public.sosticket_is_client_role(v_target.role)
    THEN 'Government Client Portal'
    ELSE 'Operations Console'
  END;

  v_html := public.sosticket_mail_html(
    'Portal invitation',
    'Your Siyana OneServe invitation was resent',
    'Your login details were resent. Sign in with the password below and change it after you log in.',
    jsonb_build_array(
      jsonb_build_object('label', 'Name', 'value', v_target.full_name),
      jsonb_build_object('label', 'Email', 'value', v_target.email),
      jsonb_build_object('label', 'Organization', 'value', coalesce(v_org_name, '')),
      jsonb_build_object('label', 'Portal', 'value', v_portal),
      jsonb_build_object('label', 'Password', 'value', v_password)
    ),
    'This message was sent from tickets@siyanainfo.com on behalf of Siyana Info Solutions.'
  );
  PERFORM public.sosticket_send_flow_email(
    v_target.email,
    'Your Siyana OneServe login details',
    v_html
  );

  RETURN public.sosticket_user_json(v_target) || jsonb_build_object('password', v_password);
END;
$$;

GRANT EXECUTE ON FUNCTION public.sosticket_resend_invite(text, text, text) TO anon, authenticated;
