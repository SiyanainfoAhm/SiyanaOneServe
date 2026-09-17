/**
 * Workbench dropdown options (teams, assignees, statuses).
 * Live assignees come from listUsers.
 */
export interface TicketMessage {
  id: string;
  author: string;
  initials: string;
  kind: "client" | "agent" | "internal";
  role: string;
  body: string;
  time: string;
}

export interface TicketEvent {
  id: string;
  time: string;
  date: string;
  type: string;
  title: string;
  note: string;
  actor: string;
  tone: "primary" | "accent" | "warning" | "danger" | "neutral";
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  kind: string;
}

export interface TicketDetail {
  description: string;
  requester: { name: string; role: string; email: string; organization: string };
  assignee: { name: string; initials: string; role: string };
  slaDue: string;
  messages: TicketMessage[];
  events: TicketEvent[];
  attachments: TicketAttachment[];
}

export const ticketDetails: Record<string, TicketDetail> = {
  "MGSU-2026-00125": {
    description:
      "The university wishes to replace the homepage hero banner ahead of the convocation ceremony on 22 September. Please use the attached artwork and ensure the banner links to the convocation microsite. Content must go live by 18 September before the announcement circular is issued.",
    requester: {
      name: "Dr. Meera Joshi",
      role: "Nodal Officer",
      email: "meera.joshi@mgsu.ac.in",
      organization: "MGSU",
    },
    assignee: { name: "Rahul Verma", initials: "RV", role: "Senior Developer" },
    slaDue: "18 Sep 2026, 18:00 IST",
    messages: [
      {
        id: "m1",
        author: "Dr. Meera Joshi",
        initials: "MJ",
        kind: "client",
        role: "Nodal Officer · MGSU",
        body: "Please update the homepage banner to the convocation artwork. It should link to the convocation microsite. We need this live by 18 September.",
        time: "15 Sep, 09:20",
      },
      {
        id: "m2",
        author: "Arjun Mehta",
        initials: "AM",
        kind: "agent",
        role: "Operations Admin",
        body: "Noted. We have scheduled this with the Content Team. Banner will go live on staging for your review first.",
        time: "15 Sep, 09:48",
      },
      {
        id: "m3",
        author: "Rahul Verma",
        initials: "RV",
        kind: "internal",
        role: "Senior Developer",
        body: "Artwork resolution is lower than the hero slot requirement. I have upscaled it locally — need design sign-off before publishing.",
        time: "15 Sep, 11:05",
      },
      {
        id: "m4",
        author: "Rahul Verma",
        initials: "RV",
        kind: "agent",
        role: "Senior Developer",
        body: "Banner has been placed on the staging server and is ready for your review. Please confirm so we can publish to production.",
        time: "15 Sep, 12:30",
      },
    ],
    events: [
      { id: "e1", time: "09:20", date: "15 Sep 2026", type: "created", title: "Request Created", note: "Raised by Dr. Meera Joshi (MGSU)", actor: "Dr. Meera Joshi", tone: "primary" },
      { id: "e2", time: "09:48", date: "15 Sep 2026", type: "assigned", title: "Assigned", note: "Assigned to Content Team · Rahul Verma", actor: "Arjun Mehta", tone: "primary" },
      { id: "e3", time: "10:15", date: "15 Sep 2026", type: "status", title: "Work Started", note: "Status moved to In Progress", actor: "Rahul Verma", tone: "accent" },
      { id: "e4", time: "11:05", date: "15 Sep 2026", type: "note", title: "Internal Note Added", note: "Artwork resolution concern raised", actor: "Rahul Verma", tone: "warning" },
      { id: "e5", time: "12:30", date: "15 Sep 2026", type: "status", title: "Staging Ready", note: "Banner deployed to staging environment", actor: "Rahul Verma", tone: "accent" },
    ],
    attachments: [
      { id: "a1", name: "convocation-banner-2026.png", size: "2.4 MB", kind: "Image" },
      { id: "a2", name: "banner-brief.pdf", size: "184 KB", kind: "PDF" },
    ],
  },
  "MGSU-2026-00132": {
    description:
      "Upload the final merit list for the 2026 admission cycle to the admission portal. The list must be published only after nodal officer approval. Two attachments provided: the merit list PDF and the category-wise summary sheet.",
    requester: {
      name: "Sanjay Kulkarni",
      role: "Admissions Officer",
      email: "sanjay.k@mgsu.ac.in",
      organization: "MGSU",
    },
    assignee: { name: "Priya Nair", initials: "PN", role: "Content Analyst" },
    slaDue: "17 Sep 2026, 12:00 IST",
    messages: [
      {
        id: "m1",
        author: "Sanjay Kulkarni",
        initials: "SK",
        kind: "client",
        role: "Admissions Officer · MGSU",
        body: "Attaching the final merit list. Please publish it to the admission portal once verified. This is time-sensitive.",
        time: "15 Sep, 08:05",
      },
      {
        id: "m2",
        author: "Priya Nair",
        initials: "PN",
        kind: "agent",
        role: "Content Analyst",
        body: "Uploaded to staging and cross-checked against the category summary. Awaiting your go-ahead before we publish live.",
        time: "15 Sep, 10:12",
      },
    ],
    events: [
      { id: "e1", time: "08:05", date: "15 Sep 2026", type: "created", title: "Request Created", note: "Raised by Sanjay Kulkarni (MGSU)", actor: "Sanjay Kulkarni", tone: "primary" },
      { id: "e2", time: "08:30", date: "15 Sep 2026", type: "assigned", title: "Assigned", note: "Assigned to Content Team · Priya Nair", actor: "Arjun Mehta", tone: "primary" },
      { id: "e3", time: "10:12", date: "15 Sep 2026", type: "status", title: "Staging Ready", note: "Merit list uploaded to staging for approval", actor: "Priya Nair", tone: "accent" },
    ],
    attachments: [
      { id: "a1", name: "merit-list-2026-final.pdf", size: "3.1 MB", kind: "PDF" },
      { id: "a2", name: "category-summary.xlsx", size: "620 KB", kind: "XLSX" },
    ],
  },
  "HAU-2026-00104": {
    description:
      "Faculty members are unable to log in through the single sign-on (SSO) integration on the HAU university website. Issue began after the identity provider certificate was rotated. Urgent — approximately 240 faculty accounts affected.",
    requester: {
      name: "Prof. Anil Deshmukh",
      role: "Registrar",
      email: "registrar@hau.ac.in",
      organization: "HAU",
    },
    assignee: { name: "Sneha Kulkarni", initials: "SK", role: "Developer" },
    slaDue: "15 Sep 2026, 16:00 IST",
    messages: [
      {
        id: "m1",
        author: "Prof. Anil Deshmukh",
        initials: "AD",
        kind: "client",
        role: "Registrar · HAU",
        body: "Faculty cannot log in since this morning. This is blocking access to internal portals for the entire department.",
        time: "15 Sep, 07:40",
      },
      {
        id: "m2",
        author: "Sneha Kulkarni",
        initials: "SK",
        kind: "agent",
        role: "Developer",
        body: "Identified the cause — the IdP signing certificate rotated overnight and needs to be re-imported. We are applying the fix now and will confirm once live.",
        time: "15 Sep, 09:15",
      },
      {
        id: "m3",
        author: "Sneha Kulkarni",
        initials: "SK",
        kind: "internal",
        role: "Developer",
        body: "Need the updated certificate metadata from HAU IT to complete the re-import. Followed up with the registrar.",
        time: "15 Sep, 10:02",
      },
    ],
    events: [
      { id: "e1", time: "07:40", date: "15 Sep 2026", type: "created", title: "Request Created", note: "Raised by Prof. Anil Deshmukh (HAU)", actor: "Prof. Anil Deshmukh", tone: "primary" },
      { id: "e2", time: "08:00", date: "15 Sep 2026", type: "assigned", title: "Assigned", note: "Assigned to Development Team · Sneha Kulkarni", actor: "Arjun Mehta", tone: "primary" },
      { id: "e3", time: "09:15", date: "15 Sep 2026", type: "status", title: "Root Cause Identified", note: "IdP certificate rotation detected", actor: "Sneha Kulkarni", tone: "warning" },
      { id: "e4", time: "10:02", date: "15 Sep 2026", type: "status", title: "Awaiting Client", note: "Waiting on updated certificate metadata", actor: "Sneha Kulkarni", tone: "danger" },
    ],
    attachments: [{ id: "a1", name: "sso-error-screenshot.png", size: "740 KB", kind: "Image" }],
  },
  "SHM-2026-00058": {
    description:
      "The Health Mission MIS dashboard has become significantly slow during peak hours (09:00–12:00). Query response time has increased from under 2 seconds to over 14 seconds. District health officers are unable to load reports on time.",
    requester: {
      name: "Dr. Kavita Rao",
      role: "Mission Director",
      email: "kavita.rao@shm.gov.in",
      organization: "State Health Mission",
    },
    assignee: { name: "Rahul Verma", initials: "RV", role: "Senior Developer" },
    slaDue: "15 Sep 2026, 12:00 IST",
    messages: [
      {
        id: "m1",
        author: "Dr. Kavita Rao",
        initials: "KR",
        kind: "client",
        role: "Mission Director · SHM",
        body: "Dashboard is unusable in the mornings. Reports that used to load instantly now take 15 minutes. Please prioritise this urgently.",
        time: "15 Sep, 06:55",
      },
      {
        id: "m2",
        author: "Rahul Verma",
        initials: "RV",
        kind: "agent",
        role: "Senior Developer",
        body: "Profiled the dashboard queries — the vaccination coverage aggregate is doing a full table scan. Adding a composite index and caching layer. ETA 3 hours.",
        time: "15 Sep, 08:45",
      },
    ],
    events: [
      { id: "e1", time: "06:55", date: "15 Sep 2026", type: "created", title: "Request Created", note: "Raised by Dr. Kavita Rao (SHM)", actor: "Dr. Kavita Rao", tone: "primary" },
      { id: "e2", time: "07:10", date: "15 Sep 2026", type: "assigned", title: "Assigned", note: "Assigned to Development Team · Rahul Verma", actor: "Arjun Mehta", tone: "danger" },
      { id: "e3", time: "08:45", date: "15 Sep 2026", type: "status", title: "Work Started", note: "Database profiling complete, fix in progress", actor: "Rahul Verma", tone: "warning" },
    ],
    attachments: [{ id: "a1", name: "performance-trace.log", size: "1.2 MB", kind: "Log" }],
  },
  "REV-2026-00081": {
    description:
      "Add a mandatory 'District' dropdown field to the grievance submission form so grievances can be routed to the correct district office automatically. Field must appear before the grievance description and feed into the routing rule engine.",
    requester: {
      name: "Ramesh Patil",
      role: "Under Secretary",
      email: "ramesh.patil@revenue.gov.in",
      organization: "Department of Revenue",
    },
    assignee: { name: "Imran Sheikh", initials: "IS", role: "QA Engineer" },
    slaDue: "18 Sep 2026, 18:00 IST",
    messages: [
      {
        id: "m1",
        author: "Ramesh Patil",
        initials: "RP",
        kind: "client",
        role: "Under Secretary · Dept. of Revenue",
        body: "Please add a mandatory District field to the grievance form. Grievances must route to the correct district office automatically.",
        time: "15 Sep, 09:00",
      },
      {
        id: "m2",
        author: "Imran Sheikh",
        initials: "IS",
        kind: "agent",
        role: "QA Engineer",
        body: "Development is complete. Running regression on the routing rules now — will report test results shortly.",
        time: "15 Sep, 11:20",
      },
    ],
    events: [
      { id: "e1", time: "09:00", date: "15 Sep 2026", type: "created", title: "Request Created", note: "Raised by Ramesh Patil (Dept. of Revenue)", actor: "Ramesh Patil", tone: "primary" },
      { id: "e2", time: "09:25", date: "15 Sep 2026", type: "assigned", title: "Assigned", note: "Assigned to QA Team · Imran Sheikh", actor: "Arjun Mehta", tone: "primary" },
      { id: "e3", time: "10:40", date: "15 Sep 2026", type: "status", title: "Sent for QA", note: "Build moved to QA Review", actor: "Rahul Verma", tone: "accent" },
      { id: "e4", time: "11:20", date: "15 Sep 2026", type: "status", title: "Regression Running", note: "Routing rules under test", actor: "Imran Sheikh", tone: "accent" },
    ],
    attachments: [{ id: "a1", name: "grievance-form-spec.docx", size: "96 KB", kind: "DOCX" }],
  },
};

export const workbenchStatuses = [
  "Draft",
  "Need Approval",
  "New",
  "Assigned",
  "In Progress",
  "Resolved",
  "Rejected",
  "Closed",
];

export const workbenchTeams = ["Content Team", "Development Team", "QA Team"];

export const workbenchAssigneesByTeam: Record<string, string[]> = {
  "Content Team": ["Priya Nair", "Divya Menon"],
  "Development Team": ["Rahul Verma", "Sneha Kulkarni"],
  "QA Team": ["Imran Sheikh"],
};