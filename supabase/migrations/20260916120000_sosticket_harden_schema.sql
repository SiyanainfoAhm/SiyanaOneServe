-- Siyana OneServe: harden schema, constraints, indexes. Prefix: sosticket_
-- Custom login only. Never uses auth.users.

ALTER TABLE public.sosticket_users
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS sosticket_users_set_updated_at ON public.sosticket_users;
CREATE TRIGGER sosticket_users_set_updated_at
BEFORE UPDATE ON public.sosticket_users
FOR EACH ROW EXECUTE FUNCTION public.sosticket_set_updated_at();

ALTER TABLE public.sosticket_users DROP CONSTRAINT IF EXISTS sosticket_users_role_check;
ALTER TABLE public.sosticket_users
  ADD CONSTRAINT sosticket_users_role_check CHECK (role IN (
    'super_admin', 'ops_admin', 'project_manager', 'ba', 'developer',
    'senior_developer', 'tester', 'content_analyst',
    'government_nodal_officer', 'government_requester'
  ));

ALTER TABLE public.sosticket_tickets DROP CONSTRAINT IF EXISTS sosticket_tickets_status_check;
ALTER TABLE public.sosticket_tickets
  ADD CONSTRAINT sosticket_tickets_status_check CHECK (status IN (
    'Draft', 'Need Approval', 'New', 'Assigned', 'In Progress',
    'Resolved', 'Rejected', 'Closed'
  ));

ALTER TABLE public.sosticket_tickets DROP CONSTRAINT IF EXISTS sosticket_tickets_priority_check;
ALTER TABLE public.sosticket_tickets
  ADD CONSTRAINT sosticket_tickets_priority_check CHECK (priority IN (
    'Critical', 'High', 'Normal', 'Low'
  ));

ALTER TABLE public.sosticket_project_sla DROP CONSTRAINT IF EXISTS sosticket_project_sla_priority_check;
ALTER TABLE public.sosticket_project_sla
  ADD CONSTRAINT sosticket_project_sla_priority_check CHECK (priority IN (
    'Critical', 'High', 'Normal', 'Low'
  ));

ALTER TABLE public.sosticket_projects DROP CONSTRAINT IF EXISTS sosticket_projects_status_check;
ALTER TABLE public.sosticket_projects
  ADD CONSTRAINT sosticket_projects_status_check CHECK (status IN (
    'Active', 'On Hold', 'Inactive', 'Closing', 'Completed'
  ));

ALTER TABLE public.sosticket_ticket_events DROP CONSTRAINT IF EXISTS sosticket_ticket_events_type_check;
ALTER TABLE public.sosticket_ticket_events
  ADD CONSTRAINT sosticket_ticket_events_type_check CHECK (event_type IN (
    'created', 'approved', 'rejected', 'assigned', 'status_changed',
    'message_added', 'verification_requested', 'changes_requested', 'closed'
  ));

CREATE INDEX IF NOT EXISTS sosticket_tickets_project_created_idx
  ON public.sosticket_tickets (project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS sosticket_sessions_expires_idx
  ON public.sosticket_sessions (expires_at);

CREATE INDEX IF NOT EXISTS sosticket_user_projects_project_idx
  ON public.sosticket_user_projects (project_id);
