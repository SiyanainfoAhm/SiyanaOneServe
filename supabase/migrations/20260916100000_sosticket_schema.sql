-- Siyana OneServe custom schema. Prefix: sosticket_
-- Does not use auth.users. Isolated from other VBDC tables.

CREATE OR REPLACE FUNCTION public.sosticket_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.sosticket_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text NOT NULL DEFAULT 'government',
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sosticket_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  initials text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL,
  organization_id uuid NOT NULL REFERENCES public.sosticket_organizations(id),
  team text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  designation text,
  phone text,
  password_hash text NOT NULL,
  notify_email boolean NOT NULL DEFAULT true,
  notify_in_app boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sosticket_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.sosticket_organizations(id),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'Active',
  owner_id uuid REFERENCES public.sosticket_users(id),
  category text,
  started_on date,
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sosticket_project_sla (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.sosticket_projects(id) ON DELETE CASCADE,
  priority text NOT NULL,
  resolution_hours integer NOT NULL,
  UNIQUE (project_id, priority)
);

CREATE TABLE IF NOT EXISTS public.sosticket_user_projects (
  user_id uuid NOT NULL REFERENCES public.sosticket_users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.sosticket_projects(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, project_id)
);

CREATE TABLE IF NOT EXISTS public.sosticket_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.sosticket_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sosticket_ticket_counters (
  project_id uuid NOT NULL REFERENCES public.sosticket_projects(id) ON DELETE CASCADE,
  year integer NOT NULL,
  last_n integer NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, year)
);

CREATE TABLE IF NOT EXISTS public.sosticket_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no text NOT NULL UNIQUE,
  organization_id uuid NOT NULL REFERENCES public.sosticket_organizations(id),
  project_id uuid NOT NULL REFERENCES public.sosticket_projects(id),
  category text NOT NULL,
  request_type text,
  title text NOT NULL,
  description text,
  reference_url text,
  status text NOT NULL DEFAULT 'New',
  priority text NOT NULL DEFAULT 'Normal',
  requester_id uuid REFERENCES public.sosticket_users(id),
  assignee_id uuid REFERENCES public.sosticket_users(id),
  team text,
  sla_due_at timestamptz,
  approved_by uuid REFERENCES public.sosticket_users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sosticket_ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.sosticket_tickets(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.sosticket_users(id),
  body text NOT NULL,
  visibility text NOT NULL DEFAULT 'client' CHECK (visibility IN ('client', 'internal')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sosticket_ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.sosticket_tickets(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.sosticket_users(id),
  event_type text NOT NULL,
  title text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sosticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.sosticket_tickets(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid REFERENCES public.sosticket_users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sosticket_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.sosticket_users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  href text,
  ticket_id uuid REFERENCES public.sosticket_tickets(id) ON DELETE SET NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sosticket_users_org_idx ON public.sosticket_users (organization_id);
CREATE INDEX IF NOT EXISTS sosticket_users_role_idx ON public.sosticket_users (role);
CREATE INDEX IF NOT EXISTS sosticket_projects_org_idx ON public.sosticket_projects (organization_id);
CREATE INDEX IF NOT EXISTS sosticket_sessions_user_idx ON public.sosticket_sessions (user_id);
CREATE INDEX IF NOT EXISTS sosticket_tickets_project_idx ON public.sosticket_tickets (project_id);
CREATE INDEX IF NOT EXISTS sosticket_tickets_status_idx ON public.sosticket_tickets (status);
CREATE INDEX IF NOT EXISTS sosticket_tickets_assignee_idx ON public.sosticket_tickets (assignee_id);
CREATE INDEX IF NOT EXISTS sosticket_tickets_requester_idx ON public.sosticket_tickets (requester_id);
CREATE INDEX IF NOT EXISTS sosticket_messages_ticket_idx ON public.sosticket_ticket_messages (ticket_id);
CREATE INDEX IF NOT EXISTS sosticket_events_ticket_idx ON public.sosticket_ticket_events (ticket_id);
CREATE INDEX IF NOT EXISTS sosticket_notifications_user_idx ON public.sosticket_notifications (user_id, created_at DESC);

DROP TRIGGER IF EXISTS sosticket_tickets_set_updated_at ON public.sosticket_tickets;
CREATE TRIGGER sosticket_tickets_set_updated_at
BEFORE UPDATE ON public.sosticket_tickets
FOR EACH ROW EXECUTE FUNCTION public.sosticket_set_updated_at();
