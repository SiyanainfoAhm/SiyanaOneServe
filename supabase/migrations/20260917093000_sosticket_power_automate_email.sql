-- Power Automate email for forgot password, assignment, and status changes.
-- From address later moved to jatin.saksena@siyanainfo.com; payload later nested (see later migrations).

CREATE OR REPLACE FUNCTION public.sosticket_mail_webhook_url()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT 'https://default25ff3e19eb6b4343af6d1f96004e62.ab.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/18/workflows/4f70bd1565c140a78621b2ad2a3d618f/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_FpfAY_F-d0VpUpINYLRtjFMY_t4mu58TCRruIP62u4'::text;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_html_escape(p_text text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT replace(replace(replace(coalesce(p_text, ''), '&', '&amp;'), '<', '&lt;'), '>', '&gt;');
$$;

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
    || '<tr><td style="padding:14px 24px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8;">Sent by Siyana Info Solutions · hr@siyanainfo.com</td></tr>'
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
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'toemail', trim(p_to),
      'ccemail', coalesce(trim(p_cc), ''),
      'replyto', 'hr@siyanainfo.com',
      'subject', coalesce(p_subject, 'Siyana OneServe'),
      'bodyhtml', p_html,
      'attachment', '',
      'submittedAt', to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD"T"HH24:MI:SS')
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'sosticket_send_flow_email failed: %', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_email_ticket_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_req public.sosticket_users;
  v_asg public.sosticket_users;
  v_org text;
  v_project text;
  v_html text;
  v_assigned boolean := false;
BEGIN
  SELECT name INTO v_org FROM public.sosticket_organizations WHERE id = NEW.organization_id;
  SELECT name INTO v_project FROM public.sosticket_projects WHERE id = NEW.project_id;
  SELECT * INTO v_req FROM public.sosticket_users WHERE id = NEW.requester_id;
  SELECT * INTO v_asg FROM public.sosticket_users WHERE id = NEW.assignee_id;

  v_assigned := NEW.assignee_id IS NOT NULL AND NEW.assignee_id IS DISTINCT FROM OLD.assignee_id;

  IF v_assigned AND v_asg.email IS NOT NULL THEN
    v_html := public.sosticket_mail_html(
      'Ticket assigned',
      'A ticket has been assigned to you',
      'You have been assigned a service request in Siyana OneServe. Please review it in the Operations Console.',
      jsonb_build_array(
        jsonb_build_object('label', 'Ticket', 'value', NEW.ticket_no),
        jsonb_build_object('label', 'Title', 'value', NEW.title),
        jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
        jsonb_build_object('label', 'Organization', 'value', coalesce(v_org, '')),
        jsonb_build_object('label', 'Priority', 'value', NEW.priority),
        jsonb_build_object('label', 'Status', 'value', NEW.status),
        jsonb_build_object('label', 'Requester', 'value', coalesce(v_req.full_name, ''))
      ),
      'Sign in to the Operations Console to pick up this ticket.'
    );
    PERFORM public.sosticket_send_flow_email(
      v_asg.email,
      'Assigned to you · ' || NEW.ticket_no || ' · ' || NEW.title,
      v_html
    );
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT (v_assigned AND NEW.status = 'Assigned') THEN
    v_html := public.sosticket_mail_html(
      'Ticket status updated',
      'Status changed to ' || NEW.status,
      'A Siyana OneServe request you are connected to has a new status.',
      jsonb_build_array(
        jsonb_build_object('label', 'Ticket', 'value', NEW.ticket_no),
        jsonb_build_object('label', 'Title', 'value', NEW.title),
        jsonb_build_object('label', 'Previous status', 'value', OLD.status),
        jsonb_build_object('label', 'New status', 'value', NEW.status),
        jsonb_build_object('label', 'Project', 'value', coalesce(v_project, '')),
        jsonb_build_object('label', 'Assignee', 'value', coalesce(v_asg.full_name, 'Unassigned'))
      ),
      'Open the ticket in Siyana OneServe for the latest conversation and timeline.'
    );

    IF v_req.email IS NOT NULL THEN
      PERFORM public.sosticket_send_flow_email(
        v_req.email,
        NEW.ticket_no || ' is now ' || NEW.status || ' · ' || NEW.title,
        v_html
      );
    END IF;

    IF v_asg.email IS NOT NULL AND (v_req.id IS NULL OR v_asg.id IS DISTINCT FROM v_req.id) THEN
      PERFORM public.sosticket_send_flow_email(
        v_asg.email,
        NEW.ticket_no || ' is now ' || NEW.status || ' · ' || NEW.title,
        v_html
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sosticket_tickets_email_update ON public.sosticket_tickets;
CREATE TRIGGER sosticket_tickets_email_update
AFTER UPDATE OF status, assignee_id ON public.sosticket_tickets
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.assignee_id IS DISTINCT FROM NEW.assignee_id)
EXECUTE FUNCTION public.sosticket_email_ticket_update();

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
BEGIN
  SELECT * INTO v_user
  FROM public.sosticket_users
  WHERE lower(email) = lower(trim(p_email))
    AND status = 'active'
  LIMIT 1;

  IF v_user.id IS NULL THEN
    RETURN jsonb_build_object('ok', true);
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
  SET password_hash = crypt(v_password, gen_salt('bf'))
  WHERE id = v_user.id;

  DELETE FROM public.sosticket_sessions WHERE user_id = v_user.id;

  v_portal := CASE WHEN public.sosticket_is_client_role(v_user.role)
    THEN 'Government Client Portal'
    ELSE 'Operations Console'
  END;

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

  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_invite_user(p_token text, p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
DECLARE
  v_user public.sosticket_users;
  v_new public.sosticket_users;
  v_org uuid;
  v_org_name text;
  v_role text;
  v_team text;
  v_password text;
  v_html text;
  v_portal text;
BEGIN
  v_user := public.sosticket_require_user(p_token);
  IF public.sosticket_is_client_role(v_user.role) THEN
    RAISE EXCEPTION 'Only Siyana staff can invite users';
  END IF;
  v_role := public.sosticket_role_key(p_payload->>'role');
  SELECT id, name INTO v_org, v_org_name FROM public.sosticket_organizations
  WHERE id::text = coalesce(p_payload->>'organization_id', '') OR name = p_payload->>'organization' LIMIT 1;
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Please choose a valid organization';
  END IF;
  IF EXISTS (SELECT 1 FROM public.sosticket_users WHERE lower(email) = lower(trim(p_payload->>'email'))) THEN
    RAISE EXCEPTION 'A user with this email already exists';
  END IF;
  v_team := CASE WHEN public.sosticket_is_client_role(v_role) THEN NULL ELSE nullif(p_payload->>'team', '') END;
  v_password := coalesce(nullif(p_payload->>'password', ''), 'Temp@1234');

  INSERT INTO public.sosticket_users (
    full_name, initials, email, role, organization_id, team, status, designation, password_hash
  ) VALUES (
    trim(p_payload->>'full_name'),
    public.sosticket_initials(p_payload->>'full_name'),
    lower(trim(p_payload->>'email')),
    v_role,
    v_org,
    v_team,
    'active',
    public.sosticket_role_label(v_role),
    crypt(v_password, gen_salt('bf'))
  ) RETURNING * INTO v_new;

  IF p_payload ? 'project_ids' THEN
    INSERT INTO public.sosticket_user_projects (user_id, project_id)
    SELECT v_new.id, (value#>>'{}')::uuid FROM jsonb_array_elements(p_payload->'project_ids') WHERE value#>>'{}' IS NOT NULL;
  ELSIF p_payload ? 'projects' THEN
    INSERT INTO public.sosticket_user_projects (user_id, project_id)
    SELECT v_new.id, p.id
    FROM public.sosticket_projects p
    WHERE p.name IN (SELECT jsonb_array_elements_text(p_payload->'projects'));
  END IF;

  v_portal := CASE WHEN public.sosticket_is_client_role(v_role)
    THEN 'Government Client Portal'
    ELSE 'Operations Console'
  END;

  v_html := public.sosticket_mail_html(
    'Portal invitation',
    'You have been invited to Siyana OneServe',
    'An account has been created for you. Sign in with the password below and change it after your first login.',
    jsonb_build_array(
      jsonb_build_object('label', 'Name', 'value', v_new.full_name),
      jsonb_build_object('label', 'Email', 'value', v_new.email),
      jsonb_build_object('label', 'Organization', 'value', coalesce(v_org_name, '')),
      jsonb_build_object('label', 'Portal', 'value', v_portal),
      jsonb_build_object('label', 'Password', 'value', v_password)
    ),
    'This message was sent from hr@siyanainfo.com on behalf of Siyana Info Solutions.'
  );
  PERFORM public.sosticket_send_flow_email(
    v_new.email,
    'Your Siyana OneServe login details',
    v_html
  );

  RETURN public.sosticket_user_json(v_new) || jsonb_build_object('password', v_password);
END;
$function$;

REVOKE ALL ON FUNCTION public.sosticket_mail_webhook_url() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sosticket_send_flow_email(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sosticket_forgot_password(text) TO anon, authenticated;
