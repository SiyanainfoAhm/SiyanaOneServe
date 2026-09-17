-- Helpers, session context, and custom login. No auth.users.

CREATE OR REPLACE FUNCTION public.sosticket_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- Single source of truth for portal routing (must match src/lib/roles.ts).
CREATE OR REPLACE FUNCTION public.sosticket_is_client_role(p_role text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT p_role IN ('government_nodal_officer', 'government_requester');
$$;

CREATE OR REPLACE FUNCTION public.sosticket_is_console_role(p_role text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT p_role IS NOT NULL AND p_role NOT IN ('government_nodal_officer', 'government_requester');
$$;

CREATE OR REPLACE FUNCTION public.sosticket_role_label(p_role text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT CASE p_role
    WHEN 'super_admin' THEN 'Super Admin'
    WHEN 'ops_admin' THEN 'Operations Admin'
    WHEN 'project_manager' THEN 'Project Manager'
    WHEN 'ba' THEN 'Business Analyst'
    WHEN 'developer' THEN 'Developer'
    WHEN 'senior_developer' THEN 'Senior Developer'
    WHEN 'tester' THEN 'QA Engineer'
    WHEN 'content_analyst' THEN 'Content Analyst'
    WHEN 'government_nodal_officer' THEN 'Government Nodal Officer'
    WHEN 'government_requester' THEN 'Government Requester'
    ELSE coalesce(p_role, '')
  END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_role_key(p_value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT CASE lower(trim(coalesce(p_value, '')))
    WHEN 'super admin' THEN 'super_admin'
    WHEN 'super_admin' THEN 'super_admin'
    WHEN 'operations admin' THEN 'ops_admin'
    WHEN 'ops_admin' THEN 'ops_admin'
    WHEN 'project manager' THEN 'project_manager'
    WHEN 'project_manager' THEN 'project_manager'
    WHEN 'business analyst' THEN 'ba'
    WHEN 'ba' THEN 'ba'
    WHEN 'developer' THEN 'developer'
    WHEN 'senior developer' THEN 'senior_developer'
    WHEN 'senior_developer' THEN 'senior_developer'
    WHEN 'qa engineer' THEN 'tester'
    WHEN 'tester' THEN 'tester'
    WHEN 'content analyst' THEN 'content_analyst'
    WHEN 'content_analyst' THEN 'content_analyst'
    WHEN 'government nodal officer' THEN 'government_nodal_officer'
    WHEN 'government_nodal_officer' THEN 'government_nodal_officer'
    WHEN 'nodal officer' THEN 'government_nodal_officer'
    WHEN 'government requester' THEN 'government_requester'
    WHEN 'government_requester' THEN 'government_requester'
    ELSE lower(replace(trim(coalesce(p_value, '')), ' ', '_'))
  END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_hash_token(p_token text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'extensions', 'pg_temp'
AS $$
  SELECT encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

CREATE OR REPLACE FUNCTION public.sosticket_sla_label(
  p_status text,
  p_sla_due_at timestamptz,
  p_created_at timestamptz,
  p_updated_at timestamptz
)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_window interval;
  v_remaining interval;
  v_stamp timestamptz;
BEGIN
  IF p_sla_due_at IS NULL OR p_created_at IS NULL THEN
    RETURN 'On Track';
  END IF;

  v_window := p_sla_due_at - p_created_at;
  IF extract(epoch FROM v_window) <= 0 THEN
    v_window := interval '48 hours';
  END IF;

  IF p_status IN ('Closed', 'Resolved', 'Rejected') THEN
    v_stamp := coalesce(p_updated_at, now());
    IF v_stamp <= p_sla_due_at THEN
      RETURN 'Met';
    END IF;
    RETURN 'Breached';
  END IF;

  v_remaining := p_sla_due_at - now();
  IF v_remaining <= interval '0' THEN
    RETURN 'Breached';
  END IF;
  IF v_remaining < (v_window * 0.25) THEN
    RETURN 'At Risk';
  END IF;
  IF v_remaining < (v_window * 0.50) THEN
    RETURN 'Due Soon';
  END IF;
  RETURN 'On Track';
END;
$$;

CREATE OR REPLACE FUNCTION public.sosticket_initials(p_name text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT upper(left(coalesce(
    (
      SELECT string_agg(left(part, 1), '' ORDER BY ordinality)
      FROM unnest(regexp_split_to_array(trim(coalesce(p_name, '')), '\s+')) WITH ORDINALITY AS t(part, ordinality)
      WHERE part <> ''
    ),
    'NA'
  ), 2));
$$;

CREATE OR REPLACE FUNCTION public.sosticket_relative_time(p_ts timestamptz)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_sec numeric;
BEGIN
  IF p_ts IS NULL THEN
    RETURN 'Never';
  END IF;
  v_sec := extract(epoch FROM (now() - p_ts));
  IF v_sec < 90 THEN
    RETURN 'Active now';
  ELSIF v_sec < 3600 THEN
    RETURN (floor(v_sec / 60)::int)::text || ' min ago';
  ELSIF v_sec < 86400 THEN
    RETURN (floor(v_sec / 3600)::int)::text || 'h ago';
  ELSIF v_sec < 172800 THEN
    RETURN 'Yesterday';
  ELSE
    RETURN to_char(p_ts AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY');
  END IF;
END;
$$;
