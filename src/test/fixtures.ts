/**
 * Shared sample records for unit tests. Not live data.
 */
import type { ProjectRecord, SessionUser, TicketRecord } from "@/types/oneserve";

export function makeTicket(overrides: Partial<TicketRecord> = {}): TicketRecord {
  return {
    id: "ticket-1",
    ticket_id: "CCSHAU-2026-00001",
    ticket_no: "CCSHAU-2026-00001",
    title: "Portal login delay",
    description: "Staff cannot sign in after 9am.",
    organization: "CCSHAU",
    organization_id: "org-1",
    project: "OneServe",
    project_id: "proj-1",
    project_code: "CCS-001",
    category: "Access",
    request_type: "Access",
    status: "New",
    priority: "High",
    assignee: "Arjun Mehta",
    assignee_initials: "AM",
    team: "Operations",
    requester: "Meera Joshi",
    requester_email: "meera.joshi@mgsu.ac.in",
    created: "2026-09-16",
    created_at: "2026-09-16T04:00:00Z",
    updated_at: "2026-09-16T06:00:00Z",
    updated: "2026-09-16",
    sla: "On Track",
    due_in_seconds: 3600,
    window_seconds: 86400,
    waiting_on_me: false,
    messages: [],
    events: [],
    attachments: [],
    ...overrides,
  };
}

export function makeUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: "user-1",
    full_name: "Arjun Mehta",
    name: "Arjun Mehta",
    initials: "AM",
    email: "arjun.mehta@siyana.in",
    role: "Operations Admin",
    role_key: "operations_admin",
    organization_id: "org-siyana",
    organization: "Siyana",
    organization_full: "Siyana Infosolutions",
    team: "Operations",
    status: "Active",
    status_key: "active",
    designation: "Operations Admin",
    notify_email: true,
    notify_in_app: true,
    created_at: "2026-01-01T00:00:00Z",
    since: "Jan 2026",
    type: "staff",
    portal: "console",
    is_client: false,
    is_console: true,
    projects: [],
    ...overrides,
  };
}

export function makeProject(overrides: Partial<ProjectRecord> = {}): ProjectRecord {
  return {
    id: "proj-1",
    name: "OneServe",
    code: "CCS-001",
    organization: "CCSHAU",
    organization_id: "org-1",
    status: "Active",
    manager: "Arjun Mehta",
    managerInitials: "AM",
    category: "Portal",
    started: "2026-01-01",
    deadline: "2026-12-31",
    openTickets: 4,
    totalTickets: 12,
    slaHealth: 92,
    progress: 40,
    ...overrides,
  };
}

export const clientUser = makeUser({
  id: "user-client",
  full_name: "Meera Joshi",
  name: "Meera Joshi",
  initials: "MJ",
  email: "meera.joshi@mgsu.ac.in",
  role: "Government Nodal Officer",
  role_key: "government_nodal_officer",
  organization: "MGSU",
  type: "government",
  portal: "client",
  is_client: true,
  is_console: false,
});
