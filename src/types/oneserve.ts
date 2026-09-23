/**
 * Shared TypeScript shapes for RPC JSON.
 * `portal` on SessionUser is `client` only for nodal officer / requester.
 */
export type Portal = "console" | "client";

export interface SessionProject {
  id: string;
  name: string;
  code: string;
  status: string;
  organization?: string;
  requests?: number;
}

export interface SessionUser {
  id: string;
  full_name: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  role_key: string;
  organization_id: string;
  organization: string;
  organization_full: string;
  team: string;
  status: string;
  status_key: string;
  designation: string;
  phone?: string | null;
  notify_email: boolean;
  notify_in_app: boolean;
  last_login_at?: string | null;
  last_active?: string;
  created_at: string;
  since: string;
  type: "staff" | "government";
  portal: Portal;
  is_client: boolean;
  is_console: boolean;
  projects: SessionProject[] | string[];
  openTickets?: number;
  password?: string;
}

export interface LoginResult {
  token: string;
  expires_at: string;
  portal: Portal;
  user: SessionUser;
}

export interface SessionResult {
  user: SessionUser;
  portal: Portal;
  queue_open: number;
}

export interface TicketRecord {
  id: string;
  ticket_id: string;
  ticket_no: string;
  title: string;
  description: string;
  reference_url?: string | null;
  organization: string;
  organization_id: string;
  project: string;
  project_id: string;
  project_code: string;
  notes?: string | null;
  status: string;
  priority: string;
  assignee: string;
  assignee_id?: string | null;
  assignee_initials?: string;
  team: string;
  requester: string;
  requester_id?: string | null;
  requester_email?: string;
  requester_role?: string;
  requester_initials?: string;
  created: string;
  created_at: string;
  updated_at: string;
  updated: string;
  resolved_at?: string | null;
  submitted_by?: string | null;
  waiting_on_me?: boolean;
  category?: string;
  request_type?: string;
  sla?: string;
  sla_due_at?: string | null;
  sla_due?: string | null;
  due_in_seconds?: number | null;
  window_seconds?: number | null;
  messages?: TicketMessageRecord[];
  events?: TicketEventRecord[];
  attachments?: TicketAttachmentRecord[];
}

export interface TicketMessageRecord {
  id: string;
  author: string;
  initials: string;
  kind: "client" | "agent" | "internal";
  role: string;
  visibility: "client" | "internal";
  body: string;
  time: string;
  created_at: string;
}

export interface TicketEventRecord {
  id: string;
  time: string;
  date: string;
  type: string;
  title: string;
  note?: string | null;
  actor: string;
  tone: string;
}

export interface TicketAttachmentRecord {
  id: string;
  name: string;
  file_path: string;
  size: string;
  kind: string;
  uploaded_by?: string | null;
  created_at: string;
}

export interface OrgRecord {
  id: string;
  name: string;
  type: string;
  full_name: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  code: string;
  organization: string;
  organization_id: string;
  status: string;
  manager: string;
  managerInitials: string;
  owner_id?: string | null;
  started: string;
  deadline: string;
  started_on?: string | null;
  deadline_date?: string | null;
  openTickets: number;
  totalTickets: number;
  progress: number;
  category?: string;
  slaHealth?: number;
  slaHours?: Record<string, number>;
  requests?: number;
  tickets?: TicketRecord[];
  members?: { id: string; name: string; initials: string; role: string }[];
}

export interface NotificationRecord {
  id: string;
  title: string;
  detail: string;
  body?: string;
  href?: string | null;
  requestId?: string | null;
  ticket_id?: string | null;
  time: string;
  created_at: string;
  read: boolean;
  tone: string;
  icon?: string;
}

export interface DashboardStats {
  projects: number;
  active_tickets: number;
  unassigned: number;
  resolved_today: number;
  trend: { day: string; created: number; closed: number }[];
  priorities: { name: string; value: number }[];
  workload: { team: string; open: number }[];
  recent: TicketRecord[];
}
