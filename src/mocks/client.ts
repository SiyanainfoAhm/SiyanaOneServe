/**
 * Static option lists (catalogue, priorities) and leftover demo rows.
 * Live requests come from AppDataContext, not this file.
 */
export const clientUser = {
  name: "Dr. Meera Joshi",
  role: "Nodal Officer",
  email: "meera.joshi@mgsu.ac.in",
  initials: "MJ",
  organization: "MGSU",
  organizationFull: "Maharaja Ganga Singh University",
  designation: "Nodal Officer — IT & Web Services",
  phone: "+91 98290 44120",
  since: "Member since Mar 2023",
};

export const clientProjects = [
  { code: "MGSU-WEB", name: "MGSU Website Portal", status: "Active", requests: 74 },
  { code: "MGSU-ADM", name: "MGSU Admission Portal", status: "Active", requests: 54 },
];

export const clientSla = {
  onTrack: 80,
  dueSoon: 15,
  delayed: 5,
  total: 44,
};

export const clientSlaRows = [
  { key: "on-track", label: "On Track", value: 80, tone: "accent" },
  { key: "due-soon", label: "Due Soon", value: 15, tone: "warning" },
  { key: "delayed", label: "Delayed", value: 5, tone: "danger" },
];

export const clientRequestTrend = [
  { month: "Jan", raised: 9, resolved: 7 },
  { month: "Feb", raised: 12, resolved: 11 },
  { month: "Mar", raised: 15, resolved: 13 },
  { month: "Apr", raised: 11, resolved: 12 },
  { month: "May", raised: 18, resolved: 14 },
  { month: "Jun", raised: 16, resolved: 17 },
  { month: "Jul", raised: 22, resolved: 18 },
  { month: "Aug", raised: 19, resolved: 21 },
  { month: "Sep", raised: 14, resolved: 12 },
];

export const clientCategoryBreakdown = [
  { key: "website", name: "Website & Content", icon: "ri-global-line", tone: "primary", value: 62, resolved: 51 },
  { key: "software", name: "Software & Application", icon: "ri-apps-2-line", tone: "accent", value: 41, resolved: 33 },
  { key: "support", name: "Technical Support", icon: "ri-customer-service-2-line", tone: "secondary", value: 25, resolved: 21 },
];

export interface ClientRequest {
  id: string;
  title: string;
  category: string;
  requestType: string;
  status: string;
  priority: string;
  project: string;
  created: string;
  updated: string;
  sla: string;
  waitingOnMe: boolean;
  submittedBy?: string;
  approvedBy?: string;
  approvedByRole?: string;
  approvedAt?: string;
}

export const clientRequests: ClientRequest[] = [
  {
    id: "MGSU-2026-00132",
    title: "Admission Portal — Merit List Upload",
    category: "Website & Content",
    requestType: "Document Upload",
    status: "In Progress",
    priority: "High",
    project: "MGSU Admission Portal",
    created: "2026-09-15",
    updated: "Today, 10:12",
    sla: "On Track",
    waitingOnMe: true,
    approvedBy: "Dr. Meera Joshi",
    approvedByRole: "Nodal Officer · MGSU",
    approvedAt: "15 Sep 2026, 08:20",
  },
  {
    id: "MGSU-2026-00128",
    title: "Student Corner Menu Restructure",
    category: "Website & Content",
    requestType: "Menu Change",
    status: "New",
    priority: "Normal",
    project: "MGSU Website Portal",
    created: "2026-09-14",
    updated: "Yesterday, 16:40",
    sla: "Due Soon",
    waitingOnMe: false,
    approvedBy: "Dr. Meera Joshi",
    approvedByRole: "Nodal Officer · MGSU",
    approvedAt: "14 Sep 2026, 16:50",
  },
  {
    id: "MGSU-2026-00125",
    title: "Homepage Banner Update — Convocation",
    category: "Website & Content",
    requestType: "Banner / Image Update",
    status: "In Progress",
    priority: "Normal",
    project: "MGSU Website Portal",
    created: "2026-09-15",
    updated: "Today, 12:30",
    sla: "On Track",
    waitingOnMe: false,
  },
  {
    id: "MGSU-2026-00124",
    title: "Alumni Registration — Form Bug",
    category: "Software & Application",
    requestType: "Report Bug",
    status: "Resolved",
    priority: "High",
    project: "MGSU Website Portal",
    created: "2026-09-13",
    updated: "Today, 09:05",
    sla: "Met",
    waitingOnMe: true,
  },
  {
    id: "MGSU-2026-00121",
    title: "Event Gallery Upload — Annual Day",
    category: "Website & Content",
    requestType: "Document Upload",
    status: "In Progress",
    priority: "Normal",
    project: "MGSU Website Portal",
    created: "2026-09-12",
    updated: "Yesterday, 14:20",
    sla: "On Track",
    waitingOnMe: false,
  },
  {
    id: "MGSU-2026-00120",
    title: "Scholarship PDF — Broken Link",
    category: "Website & Content",
    requestType: "Link Update",
    status: "In Progress",
    priority: "High",
    project: "MGSU Website Portal",
    created: "2026-09-11",
    updated: "Yesterday, 11:05",
    sla: "At Risk",
    waitingOnMe: false,
  },
  {
    id: "MGSU-2026-00118",
    title: "Hostel Allotment — Data Update",
    category: "Software & Application",
    requestType: "Data Update",
    status: "In Progress",
    priority: "Normal",
    project: "MGSU Admission Portal",
    created: "2026-09-10",
    updated: "Today, 08:40",
    sla: "On Track",
    waitingOnMe: true,
  },
  {
    id: "MGSU-2026-00114",
    title: "Fee Structure Table Update",
    category: "Website & Content",
    requestType: "Content Update",
    status: "Resolved",
    priority: "Normal",
    project: "MGSU Admission Portal",
    created: "2026-09-08",
    updated: "10 Sep, 17:00",
    sla: "Met",
    waitingOnMe: false,
  },
  {
    id: "MGSU-2026-00108",
    title: "Notice Board — New Circular Upload",
    category: "Website & Content",
    requestType: "Document Upload",
    status: "In Progress",
    priority: "Normal",
    project: "MGSU Website Portal",
    created: "2026-09-10",
    updated: "Today, 09:50",
    sla: "On Track",
    waitingOnMe: true,
  },
  {
    id: "MGSU-2026-00103",
    title: "Tender Document Publish — Batch 3",
    category: "Website & Content",
    requestType: "Publish Content",
    status: "Assigned",
    priority: "Normal",
    project: "MGSU Website Portal",
    created: "2026-09-08",
    updated: "Yesterday, 15:30",
    sla: "Due Soon",
    waitingOnMe: true,
  },
];

// Drafts submitted by department staff that are waiting on the nodal officer.
// They live in the same request list as every other request, tagged with the
// "Need Approval" status, so both portals read from one single source of truth.
export const clientDraftRequests: ClientRequest[] = [
  {
    id: "MGSU-2026-00136",
    title: "Grievance Escalation Matrix Update",
    category: "Software & Application",
    requestType: "Request Modification",
    status: "Need Approval",
    priority: "Critical",
    project: "MGSU Website Portal",
    created: "2026-09-13",
    updated: "2 hours ago",
    sla: "On Track",
    waitingOnMe: true,
    submittedBy: "Rakesh Sharma",
  },
  {
    id: "MGSU-2026-00135",
    title: "Fee Circular 2026-27 — Publish",
    category: "Website & Content",
    requestType: "Publish Content",
    status: "Need Approval",
    priority: "High",
    project: "MGSU Admission Portal",
    created: "2026-09-13",
    updated: "5 hours ago",
    sla: "Due Soon",
    waitingOnMe: true,
    submittedBy: "Anita Bhati",
  },
];

export interface CatalogueOption {
  label: string;
  slug: string;
  icon: string;
  hint: string;
}

export interface CatalogueCategory {
  key: string;
  title: string;
  description: string;
  icon: string;
  tone: "primary" | "accent" | "secondary";
  options: CatalogueOption[];
}

export const serviceCatalogue: CatalogueCategory[] = [
  {
    key: "website-content",
    title: "Website & Content",
    description: "Update pages, upload documents, manage banners, menus and links.",
    icon: "ri-global-line",
    tone: "primary",
    options: [
      { label: "Content Update", slug: "content-update", icon: "ri-edit-2-line", hint: "Change text or content on a live page" },
      { label: "Document Upload", slug: "document-upload", icon: "ri-upload-cloud-2-line", hint: "Publish a PDF, circular or notice" },
      { label: "Banner / Image Update", slug: "banner-update", icon: "ri-image-line", hint: "Replace or add a banner or image" },
      { label: "Menu Change", slug: "menu-change", icon: "ri-menu-line", hint: "Add or reorder navigation items" },
      { label: "Link Update", slug: "link-update", icon: "ri-link", hint: "Fix or point a hyperlink" },
      { label: "Publish Content", slug: "publish-content", icon: "ri-send-plane-line", hint: "Take approved content live" },
      { label: "Remove Content", slug: "remove-content", icon: "ri-delete-bin-6-line", hint: "Take content offline or archive it" },
    ],
  },
  {
    key: "software-application",
    title: "Software & Application",
    description: "Report issues, request changes or ask for a new feature in your portals.",
    icon: "ri-apps-2-line",
    tone: "accent",
    options: [
      { label: "Report Bug", slug: "report-bug", icon: "ri-bug-2-line", hint: "Something is not working correctly" },
      { label: "Request Modification", slug: "request-modification", icon: "ri-tools-line", hint: "Change existing behaviour or layout" },
      { label: "Request New Feature", slug: "request-new-feature", icon: "ri-add-circle-line", hint: "Add a brand-new capability" },
      { label: "Data Update", slug: "data-update", icon: "ri-database-2-line", hint: "Correct or refresh records" },
    ],
  },
  {
    key: "technical-support",
    title: "Technical Support",
    description: "Login problems, access, performance and general help for your teams.",
    icon: "ri-customer-service-2-line",
    tone: "secondary",
    options: [
      { label: "Login Issue", slug: "login-issue", icon: "ri-lock-unlock-line", hint: "Cannot sign in to a portal" },
      { label: "Access Request", slug: "access-request", icon: "ri-shield-user-line", hint: "Need a role or permission" },
      { label: "Performance Issue", slug: "performance-issue", icon: "ri-speed-up-line", hint: "Slow or unresponsive pages" },
      { label: "General Support", slug: "general-support", icon: "ri-question-line", hint: "Any other help you need" },
    ],
  },
];

export const contentTypes = [
  "Circular",
  "Notice",
  "PDF Document",
  "News",
  "Event",
  "Result",
  "Research",
  "Tender",
  "Image",
  "Video",
  "Page Content",
];

export const languageOptions = ["English", "Hindi", "Bilingual"];

export const actionRequiredCards = [
  { key: "add", label: "Add", icon: "ri-add-line", hint: "Create new content" },
  { key: "edit", label: "Edit", icon: "ri-edit-2-line", hint: "Modify existing content" },
  { key: "replace", label: "Replace", icon: "ri-swap-box-line", hint: "Swap content or file" },
  { key: "delete", label: "Delete", icon: "ri-delete-bin-6-line", hint: "Remove permanently" },
  { key: "archive", label: "Archive", icon: "ri-archive-2-line", hint: "Move to archive" },
  { key: "publish", label: "Publish", icon: "ri-send-plane-line", hint: "Take it live" },
  { key: "unpublish", label: "Unpublish", icon: "ri-eye-off-line", hint: "Take it offline" },
];

export const requestPriorityOptions = ["Critical", "High", "Normal", "Low"];

export interface ClientMessage {
  id: string;
  author: string;
  initials: string;
  kind: "client" | "agent";
  role: string;
  body: string;
  time: string;
}

export interface ClientEvent {
  id: string;
  time: string;
  date: string;
  title: string;
  note: string;
  actor: string;
  tone: "primary" | "accent" | "warning" | "danger" | "neutral";
}

export interface ClientAttachment {
  id: string;
  name: string;
  size: string;
  kind: string;
  filePath?: string;
}

export interface ClientRequestDetail {
  description: string;
  assignedTeam: string;
  assignee: string;
  assigneeInitials: string;
  slaDue: string;
  messages: ClientMessage[];
  events: ClientEvent[];
  attachments: ClientAttachment[];
}

export const clientRequestDetails: Record<string, ClientRequestDetail> = {
  "MGSU-2026-00125": {
    description:
      "Replace the homepage hero banner with the attached convocation artwork ahead of the ceremony on 22 September. The banner must link to the convocation microsite and go live before the announcement circular is issued on 18 September.",
    assignedTeam: "Content Team",
    assignee: "Rahul Verma",
    assigneeInitials: "RV",
    slaDue: "18 Sep 2026, 18:00 IST",
    messages: [
      {
        id: "m1",
        author: "Dr. Meera Joshi",
        initials: "MJ",
        kind: "client",
        role: "Nodal Officer · MGSU",
        body: "Please update the homepage banner to the convocation artwork and link it to the convocation microsite. We need it live by 18 September.",
        time: "15 Sep, 09:20",
      },
      {
        id: "m2",
        author: "Arjun Mehta",
        initials: "AM",
        kind: "agent",
        role: "Siyana Operations",
        body: "Noted. We have scheduled this with the Content Team. The banner will first appear on our staging site for your review.",
        time: "15 Sep, 09:48",
      },
      {
        id: "m3",
        author: "Rahul Verma",
        initials: "RV",
        kind: "agent",
        role: "Content Team · Siyana",
        body: "The banner has been placed on the staging server and is ready for your review. Please confirm so we can publish it to the live site.",
        time: "15 Sep, 12:30",
      },
    ],
    events: [
      { id: "e1", time: "09:20", date: "15 Sep 2026", title: "Request Created", note: "Raised by Dr. Meera Joshi (MGSU)", actor: "Dr. Meera Joshi", tone: "primary" },
      { id: "e2", time: "09:48", date: "15 Sep 2026", title: "Assigned", note: "Assigned to Content Team · Rahul Verma", actor: "Siyana Operations", tone: "primary" },
      { id: "e3", time: "10:15", date: "15 Sep 2026", title: "Work Started", note: "Status moved to In Progress", actor: "Rahul Verma", tone: "accent" },
      { id: "e4", time: "12:30", date: "15 Sep 2026", title: "Staging Ready", note: "Banner deployed to staging for review", actor: "Rahul Verma", tone: "accent" },
    ],
    attachments: [
      { id: "a1", name: "convocation-banner-2026.png", size: "2.4 MB", kind: "Image" },
      { id: "a2", name: "banner-brief.pdf", size: "184 KB", kind: "PDF" },
    ],
  },
  "MGSU-2026-00132": {
    description:
      "Upload the final merit list for the 2026 admission cycle to the admission portal. The list must be published only after nodal officer approval. Two attachments are provided: the merit list PDF and the category-wise summary sheet.",
    assignedTeam: "Content Team",
    assignee: "Priya Nair",
    assigneeInitials: "PN",
    slaDue: "17 Sep 2026, 12:00 IST",
    messages: [
      {
        id: "m1",
        author: "Dr. Meera Joshi",
        initials: "MJ",
        kind: "client",
        role: "Nodal Officer · MGSU",
        body: "Attaching the final merit list. Please publish it to the admission portal once approved — this is time sensitive.",
        time: "15 Sep, 08:05",
      },
      {
        id: "m2",
        author: "Priya Nair",
        initials: "PN",
        kind: "agent",
        role: "Content Team · Siyana",
        body: "Uploaded to staging and cross-checked against the category summary. Awaiting your go-ahead before we publish live.",
        time: "15 Sep, 10:12",
      },
    ],
    events: [
      { id: "e1", time: "08:05", date: "15 Sep 2026", title: "Request Created", note: "Raised by Dr. Meera Joshi (MGSU)", actor: "Dr. Meera Joshi", tone: "primary" },
      { id: "e1a", time: "08:20", date: "15 Sep 2026", title: "Approved", note: "Approved by Dr. Meera Joshi · Nodal Officer · MGSU", actor: "Dr. Meera Joshi", tone: "accent" },
      { id: "e2", time: "08:30", date: "15 Sep 2026", title: "Assigned", note: "Assigned to Content Team · Priya Nair", actor: "Siyana Operations", tone: "primary" },
      { id: "e3", time: "10:12", date: "15 Sep 2026", title: "Staging Ready", note: "Merit list uploaded to staging for approval", actor: "Priya Nair", tone: "accent" },
    ],
    attachments: [
      { id: "a1", name: "merit-list-2026-final.pdf", size: "3.1 MB", kind: "PDF" },
      { id: "a2", name: "category-summary.xlsx", size: "620 KB", kind: "XLSX" },
    ],
  },
  "MGSU-2026-00128": {
    description:
      "Restructure the 'Student Corner' menu so that admissions, results, scholarships and hostel sections sit at the top level. Existing links must be preserved and no page should become unreachable.",
    assignedTeam: "Content Team",
    assignee: "Divya Menon",
    assigneeInitials: "DM",
    slaDue: "19 Sep 2026, 18:00 IST",
    messages: [
      {
        id: "m1",
        author: "Dr. Meera Joshi",
        initials: "MJ",
        kind: "client",
        role: "Nodal Officer · MGSU",
        body: "The Student Corner menu has grown too deep. Please bring admissions, results, scholarships and hostel to the top level without breaking any existing links.",
        time: "14 Sep, 16:40",
      },
      {
        id: "m2",
        author: "Arjun Mehta",
        initials: "AM",
        kind: "agent",
        role: "Siyana Operations",
        body: "Understood. We are preparing a revised structure and will share a preview before making the change live.",
        time: "14 Sep, 17:05",
      },
    ],
    events: [
      { id: "e1", time: "16:40", date: "14 Sep 2026", title: "Request Created", note: "Raised by Dr. Meera Joshi (MGSU)", actor: "Dr. Meera Joshi", tone: "primary" },
      { id: "e1a", time: "16:50", date: "14 Sep 2026", title: "Approved", note: "Approved by Dr. Meera Joshi · Nodal Officer · MGSU", actor: "Dr. Meera Joshi", tone: "accent" },
      { id: "e2", time: "17:05", date: "14 Sep 2026", title: "Awaiting Assignment", note: "Pending triage by operations team", actor: "Siyana Operations", tone: "neutral" },
    ],
    attachments: [],
  },
  "MGSU-2026-00118": {
    description:
      "Correct the hostel allotment record for the 2026 batch — room numbers for the Girls Hostel Block C were mapped to the wrong students. Updated sheet attached for reference.",
    assignedTeam: "Content Team",
    assignee: "Priya Nair",
    assigneeInitials: "PN",
    slaDue: "18 Sep 2026, 12:00 IST",
    messages: [
      {
        id: "m1",
        author: "Dr. Meera Joshi",
        initials: "MJ",
        kind: "client",
        role: "Nodal Officer · MGSU",
        body: "Room numbers in Girls Hostel Block C are mapped to the wrong students. Attaching the corrected sheet — please update.",
        time: "10 Sep, 11:20",
      },
      {
        id: "m2",
        author: "Priya Nair",
        initials: "PN",
        kind: "agent",
        role: "Content Team · Siyana",
        body: "Records corrected on staging. Please check the Block C mapping so we can save it to the live portal.",
        time: "15 Sep, 08:40",
      },
    ],
    events: [
      { id: "e1", time: "11:20", date: "10 Sep 2026", title: "Request Created", note: "Raised by Dr. Meera Joshi (MGSU)", actor: "Dr. Meera Joshi", tone: "primary" },
      { id: "e2", time: "11:55", date: "10 Sep 2026", title: "Assigned", note: "Assigned to Content Team · Priya Nair", actor: "Siyana Operations", tone: "primary" },
      { id: "e3", time: "08:40", date: "15 Sep 2026", title: "Records Updated", note: "Block C records corrected on staging", actor: "Priya Nair", tone: "accent" },
    ],
    attachments: [{ id: "a1", name: "hostel-allotment-blockC.xlsx", size: "412 KB", kind: "XLSX" }],
  },
  "MGSU-2026-00136": {
    description:
      "The escalation matrix on the grievance page still lists the old nodal officer contacts and must be replaced before the department review meeting on 18 September. Please update all three escalation levels.",
    assignedTeam: "Siyana Support Team",
    assignee: "Unassigned",
    assigneeInitials: "—",
    slaDue: "16 Sep 2026, 12:00 IST",
    messages: [
      {
        id: "m1",
        author: "Rakesh Sharma",
        initials: "RS",
        kind: "client",
        role: "Section Officer · MGSU",
        body: "Escalation contacts on the grievance page are outdated. Requesting an update before the review meeting on 18 September.",
        time: "13 Sep, 14:20",
      },
    ],
    events: [
      { id: "e1", time: "14:20", date: "13 Sep 2026", title: "Draft Submitted", note: "Raised by Rakesh Sharma (MGSU)", actor: "Rakesh Sharma", tone: "primary" },
      { id: "e2", time: "14:20", date: "13 Sep 2026", title: "Awaiting Department Approval", note: "Pending nod from the nodal officer", actor: "Rakesh Sharma", tone: "warning" },
    ],
    attachments: [],
  },
  "MGSU-2026-00135": {
    description:
      "Publish the approved fee circular for the 2026-27 session on the admission portal homepage and in the notices section once the nodal officer signs off.",
    assignedTeam: "Siyana Support Team",
    assignee: "Unassigned",
    assigneeInitials: "—",
    slaDue: "17 Sep 2026, 18:00 IST",
    messages: [
      {
        id: "m1",
        author: "Anita Bhati",
        initials: "AB",
        kind: "client",
        role: "Accounts Officer · MGSU",
        body: "The fee circular for 2026-27 is approved. Requesting permission to publish it on the admission portal.",
        time: "13 Sep, 09:40",
      },
    ],
    events: [
      { id: "e1", time: "09:40", date: "13 Sep 2026", title: "Draft Submitted", note: "Raised by Anita Bhati (MGSU)", actor: "Anita Bhati", tone: "primary" },
      { id: "e2", time: "09:40", date: "13 Sep 2026", title: "Awaiting Department Approval", note: "Pending nod from the nodal officer", actor: "Anita Bhati", tone: "warning" },
    ],
    attachments: [],
  },
};

export const clientNotifications = [
  {
    id: "n1",
    title: "Approval requested",
    detail: "MGSU-2026-00132 (Merit List Upload) is awaiting your approval.",
    time: "42 min ago",
    tone: "warning",
    icon: "ri-checkbox-circle-line",
    requestId: "MGSU-2026-00132",
  },
  {
    id: "n2",
    title: "Staging ready for review",
    detail: "Homepage banner for MGSU-2026-00125 is ready on staging.",
    time: "3 hours ago",
    tone: "primary",
    icon: "ri-eye-line",
    requestId: "MGSU-2026-00125",
  },
  {
    id: "n3",
    title: "Clarification needed",
    detail: "The team has a question on MGSU-2026-00108 (Circular Upload).",
    time: "Today, 09:50",
    tone: "danger",
    icon: "ri-question-line",
    requestId: "MGSU-2026-00108",
  },
  {
    id: "n4",
    title: "Request resolved",
    detail: "MGSU-2026-00124 (Alumni Registration Bug) is resolved and closed.",
    time: "Today, 09:05",
    tone: "accent",
    icon: "ri-check-double-line",
    requestId: "MGSU-2026-00124",
  },
  {
    id: "n5",
    title: "Document published",
    detail: "Tender documents Batch 3 are now live on the portal.",
    time: "Yesterday, 15:30",
    tone: "primary",
    icon: "ri-send-plane-line",
    requestId: "MGSU-2026-00103",
  },
];

export interface DraftDecision {
  action: "Approved" | "Rejected";
  by: string;
  role: string;
  reason?: string;
  at: string;
}

