/**
 * Leftover console dashboard demo. Live stats come from sosticket_dashboard_stats / liveStats.
 */
export const consoleUser = {
  name: "Arjun Mehta",
  role: "Operations Admin",
  email: "arjun.mehta@siyana.in",
  initials: "AM",
  team: "Operations",
};

export const organizationOptions = [
  "All Organizations",
  "MGSU",
  "HAU",
  "Department of Revenue",
  "State Health Mission",
];

export const dashboardStats = [
  {
    key: "projects",
    label: "Total Projects",
    value: "12",
    delta: "+2 this quarter",
    tone: "primary",
    icon: "ri-folders-line",
  },
  {
    key: "active",
    label: "Active Tickets",
    value: "64",
    delta: "+8 since yesterday",
    tone: "info",
    icon: "ri-ticket-2-line",
  },
  {
    key: "unassigned",
    label: "Unassigned Tickets",
    value: "9",
    delta: "Needs triage",
    tone: "warning",
    icon: "ri-user-received-line",
  },
  {
    key: "risk",
    label: "SLA Risk",
    value: "7",
    delta: "2 breaching within 4h",
    tone: "danger",
    icon: "ri-timer-flash-line",
  },
  {
    key: "resolved",
    label: "Resolved Today",
    value: "11",
    delta: "Closed within SLA",
    tone: "accent",
    icon: "ri-checkbox-circle-line",
  },
];

export const ticketTrend = [
  { day: "02 Sep", created: 14, closed: 11 },
  { day: "03 Sep", created: 18, closed: 15 },
  { day: "04 Sep", created: 12, closed: 14 },
  { day: "05 Sep", created: 21, closed: 16 },
  { day: "06 Sep", created: 9, closed: 10 },
  { day: "07 Sep", created: 4, closed: 3 },
  { day: "08 Sep", created: 16, closed: 13 },
  { day: "09 Sep", created: 22, closed: 19 },
  { day: "10 Sep", created: 19, closed: 21 },
  { day: "11 Sep", created: 25, closed: 18 },
  { day: "12 Sep", created: 17, closed: 20 },
  { day: "13 Sep", created: 8, closed: 7 },
  { day: "14 Sep", created: 13, closed: 12 },
  { day: "15 Sep", created: 20, closed: 16 },
];

export const categoryDistribution = [
  { name: "Website & Content", value: 24, tone: "primary" },
  { name: "Software & Application", value: 17, tone: "accent" },
  { name: "Technical Support", value: 14, tone: "secondary" },
  { name: "Access & Security", value: 9, tone: "warning" },
];

export const organizationDistribution = [
  { name: "MGSU", value: 22 },
  { name: "HAU", value: 16 },
  { name: "Dept. of Revenue", value: 15 },
  { name: "State Health Mission", value: 11 },
];

export const priorityDistribution = [
  { name: "Critical", value: 6 },
  { name: "High", value: 18 },
  { name: "Normal", value: 32 },
  { name: "Low", value: 8 },
];

export const slaBreakdown = [
  { key: "on-track", label: "On Track", value: 80, tone: "accent" },
  { key: "due-soon", label: "Due Soon", value: 15, tone: "warning" },
  { key: "delayed", label: "Delayed", value: 5, tone: "danger" },
];

export const slaRadial = {
  onTrack: 80,
  dueSoon: 15,
  delayed: 5,
  total: 64,
};

export const consoleTickets = [
  {
    id: "MGSU-2026-00132",
    title: "Admission Portal — Merit List Upload",
    organization: "MGSU",
    project: "MGSU Admission Portal",
    category: "Website & Content",
    status: "In Progress",
    priority: "High",
    assignee: "Priya Nair",
    team: "Content Team",
    created: "15 Sep 2026",
    sla: "On Track",
  },
  {
    id: "MGSU-2026-00125",
    title: "Homepage Banner Update",
    organization: "MGSU",
    project: "MGSU Website Portal",
    category: "Website & Content",
    status: "In Progress",
    priority: "Normal",
    assignee: "Rahul Verma",
    team: "Content Team",
    created: "15 Sep 2026",
    sla: "On Track",
  },
  {
    id: "HAU-2026-00098",
    title: "Login Issue — Faculty Single Sign-On",
    organization: "HAU",
    project: "HAU University Website",
    category: "Technical Support",
    status: "Assigned",
    priority: "Critical",
    assignee: "Sneha Kulkarni",
    team: "Development Team",
    created: "14 Sep 2026",
    sla: "At Risk",
  },
  {
    id: "REV-2026-00074",
    title: "Grievance Form — Field Modification",
    organization: "Department of Revenue",
    project: "Revenue Grievance System",
    category: "Software & Application",
    status: "In Progress",
    priority: "High",
    assignee: "Imran Sheikh",
    team: "QA Team",
    created: "14 Sep 2026",
    sla: "On Track",
  },
  {
    id: "MGSU-2026-00119",
    title: "Tender Document Publish — Batch 3",
    organization: "MGSU",
    project: "MGSU Website Portal",
    category: "Website & Content",
    status: "Assigned",
    priority: "Normal",
    assignee: "Divya Menon",
    team: "Content Team",
    created: "13 Sep 2026",
    sla: "On Track",
  },
  {
    id: "SHM-2026-00051",
    title: "Dashboard Performance Degradation",
    organization: "State Health Mission",
    project: "Health Mission MIS",
    category: "Technical Support",
    status: "In Progress",
    priority: "Critical",
    assignee: "Rahul Verma",
    team: "Development Team",
    created: "13 Sep 2026",
    sla: "Breached",
  },
  {
    id: "HAU-2026-00093",
    title: "New Page — Research Publications",
    organization: "HAU",
    project: "HAU University Website",
    category: "Website & Content",
    status: "New",
    priority: "Low",
    assignee: "Unassigned",
    team: "Unassigned",
    created: "12 Sep 2026",
    sla: "On Track",
  },
  {
    id: "REV-2026-00069",
    title: "Access Request — District Officer Role",
    organization: "Department of Revenue",
    project: "Revenue Grievance System",
    category: "Technical Support",
    status: "Resolved",
    priority: "Normal",
    assignee: "Sneha Kulkarni",
    team: "Development Team",
    created: "11 Sep 2026",
    sla: "Met",
  },
  {
    id: "SHM-2026-00047",
    title: "Data Correction — Vaccination Coverage",
    organization: "State Health Mission",
    project: "Health Mission MIS",
    category: "Software & Application",
    status: "Resolved",
    priority: "High",
    assignee: "Divya Menon",
    team: "Content Team",
    created: "10 Sep 2026",
    sla: "Met",
  },
  {
    id: "MGSU-2026-00108",
    title: "Menu Restructure — Student Corner",
    organization: "MGSU",
    project: "MGSU Website Portal",
    category: "Website & Content",
    status: "New",
    priority: "Normal",
    assignee: "Unassigned",
    team: "Unassigned",
    created: "10 Sep 2026",
    sla: "Due Soon",
  },
];

export const consoleNotifications = [
  {
    id: "n1",
    title: "SLA breaching soon",
    detail: "HAU-2026-00098 will breach SLA in 3 hours.",
    time: "8 min ago",
    tone: "danger",
    icon: "ri-timer-flash-line",
    requestId: "HAU-2026-00098",
  },
  {
    id: "n2",
    title: "Client approval requested",
    detail: "MGSU-2026-00132 submitted for client approval.",
    time: "42 min ago",
    tone: "accent",
    icon: "ri-checkbox-circle-line",
    requestId: "MGSU-2026-00132",
  },
  {
    id: "n3",
    title: "New ticket assigned to you",
    detail: "SHM-2026-00051 flagged as Critical priority.",
    time: "2 hours ago",
    tone: "primary",
    icon: "ri-user-received-line",
    requestId: "SHM-2026-00051",
  },
  {
    id: "n4",
    title: "Unassigned tickets pending triage",
    detail: "9 new requests are waiting for assignment.",
    time: "Today, 09:12",
    tone: "warning",
    icon: "ri-inbox-line",
    requestId: null,
  },
];

export const teamMembers = [
  { name: "Arjun Mehta", role: "Operations Admin", team: "Operations", initials: "AM", load: 14 },
  { name: "Priya Nair", role: "Content Analyst", team: "Content Team", initials: "PN", load: 22 },
  { name: "Rahul Verma", role: "Senior Developer", team: "Development Team", initials: "RV", load: 18 },
  { name: "Sneha Kulkarni", role: "Developer", team: "Development Team", initials: "SK", load: 16 },
  { name: "Imran Sheikh", role: "QA Engineer", team: "QA Team", initials: "IS", load: 11 },
  { name: "Divya Menon", role: "Content Analyst", team: "Content Team", initials: "DM", load: 13 },
];

export const navCounts = {
  queue: 64,
  projects: 12,
};