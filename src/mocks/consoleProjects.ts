/**
 * Project option lists (categories, SLA defaults, mock documents).
 * Documents tab still uses this mock — not Azure.
 */
export interface Project {
  id: string;
  name: string;
  code: string;
  organization: string;
  status: "Active" | "Inactive";
  manager: string;
  managerInitials: string;
  progress: number;
  openTickets: number;
  totalTickets: number;
  started: string;
  deadline: string;
  slaHealth?: number;
  category?: string;
  slaHours?: Record<string, number>;
}

export const slaPriorityOptions = ["Critical", "High", "Normal", "Low"];

export const defaultSlaHours: Record<string, number> = {
  Critical: 8,
  High: 24,
  Normal: 48,
  Low: 96,
};

export const projects: Project[] = [
  { id: "p1", name: "MGSU Website Portal", code: "MGSU-WEB", organization: "MGSU", status: "Active", manager: "Arjun Mehta", managerInitials: "AM", progress: 82, openTickets: 14, totalTickets: 96, slaHealth: 94, category: "Website & Content", started: "Jan 2025", deadline: "Dec 2026", slaHours: { Critical: 6, High: 24, Normal: 48, Low: 96 } },
  { id: "p2", name: "MGSU Admission Portal", code: "MGSU-ADM", organization: "MGSU", status: "Active", manager: "Priya Nair", managerInitials: "PN", progress: 68, openTickets: 11, totalTickets: 74, slaHealth: 89, category: "Software & Application", started: "Mar 2025", deadline: "Oct 2026", slaHours: { Critical: 4, High: 12, Normal: 36, Low: 72 } },
  { id: "p3", name: "HAU University Website", code: "HAU-WEB", organization: "HAU", status: "Active", manager: "Rahul Verma", managerInitials: "RV", progress: 74, openTickets: 16, totalTickets: 88, slaHealth: 81, category: "Website & Content", started: "Nov 2024", deadline: "Mar 2027", slaHours: { Critical: 8, High: 24, Normal: 48, Low: 96 } },
  { id: "p4", name: "Revenue Grievance System", code: "REV-GRV", organization: "Department of Revenue", status: "Active", manager: "Sneha Kulkarni", managerInitials: "SK", progress: 61, openTickets: 18, totalTickets: 102, slaHealth: 78, category: "Software & Application", started: "Aug 2025", deadline: "Feb 2027", slaHours: { Critical: 4, High: 16, Normal: 48, Low: 120 } },
  { id: "p5", name: "Health Mission MIS", code: "SHM-MIS", organization: "State Health Mission", status: "Active", manager: "Imran Sheikh", managerInitials: "IS", progress: 55, openTickets: 15, totalTickets: 68, slaHealth: 69, category: "Software & Application", started: "Sep 2025", deadline: "Jun 2027", slaHours: { Critical: 4, High: 12, Normal: 24, Low: 72 } },
  { id: "p6", name: "MGSU Alumni Network", code: "MGSU-ALM", organization: "MGSU", status: "Active", manager: "Divya Menon", managerInitials: "DM", progress: 88, openTickets: 5, totalTickets: 41, slaHealth: 96, category: "Website & Content", started: "Apr 2025", deadline: "Nov 2026", slaHours: { Critical: 8, High: 24, Normal: 48, Low: 96 } },
  { id: "p7", name: "HAU Examination System", code: "HAU-EXM", organization: "HAU", status: "Inactive", manager: "Rahul Verma", managerInitials: "RV", progress: 34, openTickets: 3, totalTickets: 29, slaHealth: 88, category: "Software & Application", started: "Jun 2025", deadline: "Aug 2027", slaHours: { Critical: 8, High: 24, Normal: 48, Low: 96 } },
  { id: "p8", name: "Revenue Land Records", code: "REV-LND", organization: "Department of Revenue", status: "Active", manager: "Sneha Kulkarni", managerInitials: "SK", progress: 47, openTickets: 7, totalTickets: 52, slaHealth: 85, category: "Software & Application", started: "Feb 2026", deadline: "Dec 2027", slaHours: { Critical: 6, High: 24, Normal: 48, Low: 96 } },
  { id: "p9", name: "SHM Telemedicine Portal", code: "SHM-TEL", organization: "State Health Mission", status: "Active", manager: "Priya Nair", managerInitials: "PN", progress: 40, openTickets: 6, totalTickets: 37, slaHealth: 91, category: "Website & Content", started: "Mar 2026", deadline: "Sep 2027", slaHours: { Critical: 4, High: 16, Normal: 48, Low: 96 } },
  { id: "p10", name: "MGSU Campus Wi-Fi Portal", code: "MGSU-WIF", organization: "MGSU", status: "Active", manager: "Imran Sheikh", managerInitials: "IS", progress: 96, openTickets: 2, totalTickets: 33, slaHealth: 98, category: "Technical Support", started: "Oct 2024", deadline: "Oct 2026", slaHours: { Critical: 8, High: 24, Normal: 48, Low: 96 } },
  { id: "p11", name: "HAU Library Management", code: "HAU-LIB", organization: "HAU", status: "Active", manager: "Divya Menon", managerInitials: "DM", progress: 100, openTickets: 0, totalTickets: 46, slaHealth: 99, category: "Software & Application", started: "May 2024", deadline: "May 2026", slaHours: { Critical: 8, High: 24, Normal: 48, Low: 96 } },
  { id: "p12", name: "SHM Field Worker App", code: "SHM-FLD", organization: "State Health Mission", status: "Inactive", manager: "Rahul Verma", managerInitials: "RV", progress: 28, openTickets: 1, totalTickets: 22, slaHealth: 90, category: "Software & Application", started: "Jul 2025", deadline: "Jan 2027", slaHours: { Critical: 4, High: 24, Normal: 48, Low: 96 } },
];

export const projectOrganizationOptions = ["All Organizations", "MGSU", "HAU", "Department of Revenue", "State Health Mission"];
export const projectStatusOptions = ["All Statuses", "Active", "Inactive"];
export const projectEditableStatusOptions = ["Active", "Inactive"];
export const projectCategoryOptions = ["Website & Content", "Software & Application", "Technical Support", "Access & Security"];
export const projectManagerOptions = ["Arjun Mehta", "Priya Nair", "Rahul Verma", "Sneha Kulkarni", "Imran Sheikh", "Divya Menon"];

export interface ProjectDocument {
  id: string;
  name: string;
  kind: string;
  size: string;
  updated: string;
}

export const defaultProjectDocuments: ProjectDocument[] = [
  { id: "d1", name: "Project Scope & Requirement Note", kind: "PDF", size: "1.8 MB", updated: "12 Sep 2026" },
  { id: "d2", name: "Service Agreement — Signed", kind: "PDF", size: "640 KB", updated: "02 Sep 2026" },
  { id: "d3", name: "Content Handover Sheet", kind: "XLSX", size: "220 KB", updated: "28 Aug 2026" },
  { id: "d4", name: "Deployment Runbook", kind: "DOCX", size: "310 KB", updated: "19 Aug 2026" },
];

export interface ProjectMember {
  initials: string;
  name: string;
  role: string;
}

export const defaultProjectTeam: ProjectMember[] = [
  { initials: "AM", name: "Arjun Mehta", role: "Operations Admin" },
  { initials: "PN", name: "Priya Nair", role: "Content Analyst" },
  { initials: "RV", name: "Rahul Verma", role: "Senior Developer" },
  { initials: "SK", name: "Sneha Kulkarni", role: "Developer" },
  { initials: "IS", name: "Imran Sheikh", role: "QA Engineer" },
  { initials: "DM", name: "Divya Menon", role: "Content Analyst" },
];