-- Login portal lock.
-- p_portal = 'client'  → only government_nodal_officer / government_requester
-- p_portal = 'console' → every other role
-- Drops the old 3-arg sosticket_login so callers cannot skip the guard.

DROP FUNCTION IF EXISTS public.sosticket_login(text, text, boolean);

CREATE OR REPLACE FUNCTION public.sosticket_login(
  p_email text,
  p_password text,
  p_keep_signed_in boolean DEFAULT true,
  p_portal text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
DECLARE
  v_user public.sosticket_users;
  v_token text;
  v_expires timestamptz;
  v_is_client boolean;
  v_portal text;
BEGIN
  SELECT * INTO v_user
  FROM public.sosticket_users
  WHERE lower(email) = lower(trim(p_email))
  LIMIT 1;

  IF NOT FOUND OR v_user.password_hash IS NULL
     OR v_user.password_hash <> crypt(p_password, v_user.password_hash) THEN
    RAISE EXCEPTION 'Invalid email or password' USING errcode = '28000';
  END IF;

  IF v_user.status <> 'active' THEN
    RAISE EXCEPTION 'This account is inactive' USING errcode = '28000';
  END IF;

  v_is_client := public.sosticket_is_client_role(v_user.role);
  v_portal := CASE WHEN v_is_client THEN 'client' ELSE 'console' END;

  IF lower(coalesce(p_portal, '')) = 'client' AND NOT v_is_client THEN
    RAISE EXCEPTION 'This role can only sign in to the Siyana Operations Console'
      USING errcode = '28000';
  END IF;

  IF lower(coalesce(p_portal, '')) = 'console' AND v_is_client THEN
    RAISE EXCEPTION 'This role can only sign in to the Government Client Portal'
      USING errcode = '28000';
  END IF;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires := now() + CASE WHEN coalesce(p_keep_signed_in, true) THEN interval '30 days' ELSE interval '12 hours' END;

  INSERT INTO public.sosticket_sessions (user_id, token_hash, expires_at)
  VALUES (v_user.id, public.sosticket_hash_token(v_token), v_expires);

  UPDATE public.sosticket_users SET last_login_at = now() WHERE id = v_user.id;
  v_user.last_login_at := now();

  RETURN jsonb_build_object(
    'token', v_token,
    'expires_at', v_expires,
    'portal', v_portal,
    'user', public.sosticket_user_json(v_user)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.sosticket_login(text, text, boolean, text) TO anon, authenticated;
