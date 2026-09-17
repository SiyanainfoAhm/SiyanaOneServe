/**
 * QueueTicket type + leftover demo rows. The queue page reads live tickets via useConsoleTickets.
 */
export interface QueueTicket {
  id: string;
  title: string;
  organization: string;
  project: string;
  status: string;
  priority: string;
  assignee: string;
  team: string;
  created: string;
  category?: string;
  sla?: string;
  dueInSeconds?: number;
  windowSeconds?: number;
}

export const queueTickets: QueueTicket[] = [
  { id: "MGSU-2026-00132", title: "Admission Portal — Merit List Upload", organization: "MGSU", project: "MGSU Admission Portal", category: "Website & Content", status: "In Progress", priority: "High", assignee: "Priya Nair", team: "Content Team", created: "2026-09-15", sla: "On Track" },
  { id: "MGSU-2026-00131", title: "Convocation Banner Update", organization: "MGSU", project: "MGSU Website Portal", category: "Website & Content", status: "In Progress", priority: "Normal", assignee: "Rahul Verma", team: "Content Team", created: "2026-09-15", sla: "On Track" },
  { id: "MGSU-2026-00130", title: "Fee Gateway Payment Timeout", organization: "MGSU", project: "MGSU Admission Portal", category: "Technical Support", status: "In Progress", priority: "Critical", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-15", sla: "Due Soon" },
  { id: "HAU-2026-00104", title: "Faculty SSO Login Failure", organization: "HAU", project: "HAU University Website", category: "Technical Support", status: "Assigned", priority: "Critical", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-15", sla: "At Risk" },
  { id: "REV-2026-00081", title: "Grievance Form — Add District Field", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Software & Application", status: "In Progress", priority: "High", assignee: "Imran Sheikh", team: "QA Team", created: "2026-09-15", sla: "On Track" },
  { id: "SHM-2026-00058", title: "MIS Dashboard Slow Response", organization: "State Health Mission", project: "Health Mission MIS", category: "Technical Support", status: "In Progress", priority: "Critical", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-15", sla: "Breached" },
  { id: "MGSU-2026-00129", title: "Notice Board — New Circular Upload", organization: "MGSU", project: "MGSU Website Portal", category: "Website & Content", status: "Assigned", priority: "Normal", assignee: "Divya Menon", team: "Content Team", created: "2026-09-15", sla: "On Track" },
  { id: "HAU-2026-00103", title: "Research Publications — New Page", organization: "HAU", project: "HAU University Website", category: "Website & Content", status: "New", priority: "Low", assignee: "Unassigned", team: "Unassigned", created: "2026-09-15", sla: "On Track" },
  { id: "REV-2026-00080", title: "Backup Restore — July Records", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Technical Support", status: "New", priority: "High", assignee: "Unassigned", team: "Unassigned", created: "2026-09-15", sla: "Due Soon" },
  { id: "SHM-2026-00057", title: "Vaccination Data Correction", organization: "State Health Mission", project: "Health Mission MIS", category: "Software & Application", status: "Assigned", priority: "Normal", assignee: "Divya Menon", team: "Content Team", created: "2026-09-15", sla: "On Track" },
  { id: "MGSU-2026-00128", title: "Student Corner Menu Restructure", organization: "MGSU", project: "MGSU Website Portal", category: "Website & Content", status: "New", priority: "Normal", assignee: "Unassigned", team: "Unassigned", created: "2026-09-14", sla: "Due Soon" },
  { id: "MGSU-2026-00127", title: "Result Portal — Semester 4 Upload", organization: "MGSU", project: "MGSU Admission Portal", category: "Website & Content", status: "In Progress", priority: "High", assignee: "Imran Sheikh", team: "QA Team", created: "2026-09-14", sla: "On Track" },
  { id: "HAU-2026-00102", title: "Department Page — Hindi Content", organization: "HAU", project: "HAU University Website", category: "Website & Content", status: "In Progress", priority: "Normal", assignee: "Divya Menon", team: "Content Team", created: "2026-09-14", sla: "On Track" },
  { id: "REV-2026-00079", title: "Dashboard Access — Tahsildar Role", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Technical Support", status: "Assigned", priority: "Normal", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-14", sla: "On Track" },
  { id: "SHM-2026-00056", title: "New Feature — District Filter", organization: "State Health Mission", project: "Health Mission MIS", category: "Software & Application", status: "In Progress", priority: "Normal", assignee: "Priya Nair", team: "Development Team", created: "2026-09-14", sla: "On Track" },
  { id: "MGSU-2026-00126", title: "Tender Document Publish — Batch 3", organization: "MGSU", project: "MGSU Website Portal", category: "Website & Content", status: "Assigned", priority: "Normal", assignee: "Divya Menon", team: "Content Team", created: "2026-09-14", sla: "On Track" },
  { id: "HAU-2026-00101", title: "Admission Notice — Round 2", organization: "HAU", project: "HAU University Website", category: "Website & Content", status: "Assigned", priority: "Normal", assignee: "Priya Nair", team: "Content Team", created: "2026-09-14", sla: "On Track" },
  { id: "REV-2026-00078", title: "Grievance Report Export Error", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Software & Application", status: "In Progress", priority: "High", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-14", sla: "Due Soon" },
  { id: "SHM-2026-00055", title: "Report Export Timeout", organization: "State Health Mission", project: "Health Mission MIS", category: "Software & Application", status: "In Progress", priority: "High", assignee: "Imran Sheikh", team: "QA Team", created: "2026-09-14", sla: "On Track" },
  { id: "HAU-2026-00100", title: "Portal Performance Degradation", organization: "HAU", project: "HAU University Website", category: "Technical Support", status: "In Progress", priority: "High", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-14", sla: "Due Soon" },
  { id: "REV-2026-00077", title: "Circular Upload — Land Records", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Website & Content", status: "In Progress", priority: "Normal", assignee: "Divya Menon", team: "Content Team", created: "2026-09-14", sla: "On Track" },
  { id: "SHM-2026-00054", title: "Facility Login Issue", organization: "State Health Mission", project: "Health Mission MIS", category: "Technical Support", status: "Assigned", priority: "High", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-14", sla: "At Risk" },
  { id: "MGSU-2026-00125", title: "Homepage Banner Update", organization: "MGSU", project: "MGSU Website Portal", category: "Website & Content", status: "In Progress", priority: "Normal", assignee: "Rahul Verma", team: "Content Team", created: "2026-09-14", sla: "On Track" },
  { id: "MGSU-2026-00124", title: "Alumni Registration — Form Bug", organization: "MGSU", project: "MGSU Website Portal", category: "Software & Application", status: "In Progress", priority: "High", assignee: "Priya Nair", team: "Development Team", created: "2026-09-13", sla: "On Track" },
  { id: "HAU-2026-00099", title: "Syllabus PDF Update — BSc", organization: "HAU", project: "HAU University Website", category: "Website & Content", status: "In Progress", priority: "Normal", assignee: "Imran Sheikh", team: "QA Team", created: "2026-09-13", sla: "On Track" },
  { id: "REV-2026-00076", title: "Portal SSL Certificate Renewal", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Technical Support", status: "In Progress", priority: "Critical", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-13", sla: "At Risk" },
  { id: "SHM-2026-00053", title: "Data Sync Failure — PHC Records", organization: "State Health Mission", project: "Health Mission MIS", category: "Technical Support", status: "In Progress", priority: "Critical", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-13", sla: "Breached" },
  { id: "MGSU-2026-00123", title: "Research Journal Page Addition", organization: "MGSU", project: "MGSU Website Portal", category: "Website & Content", status: "Resolved", priority: "Low", assignee: "Divya Menon", team: "Content Team", created: "2026-09-13", sla: "Met" },
  { id: "HAU-2026-00098", title: "Career Portal — Broken Apply Button", organization: "HAU", project: "HAU University Website", category: "Software & Application", status: "In Progress", priority: "High", assignee: "Priya Nair", team: "Development Team", created: "2026-09-13", sla: "On Track" },
  { id: "REV-2026-00075", title: "Grievance Status SMS Not Sent", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Technical Support", status: "In Progress", priority: "High", assignee: "Imran Sheikh", team: "QA Team", created: "2026-09-13", sla: "On Track" },
  { id: "SHM-2026-00052", title: "Dashboard Widget Not Rendering", organization: "State Health Mission", project: "Health Mission MIS", category: "Software & Application", status: "In Progress", priority: "Normal", assignee: "Priya Nair", team: "Development Team", created: "2026-09-13", sla: "On Track" },
  { id: "MGSU-2026-00122", title: "Admin Login — Access Request", organization: "MGSU", project: "MGSU Website Portal", category: "Technical Support", status: "Resolved", priority: "Normal", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-12", sla: "Met" },
  { id: "MGSU-2026-00121", title: "Event Gallery Upload — Annual Day", organization: "MGSU", project: "MGSU Website Portal", category: "Website & Content", status: "In Progress", priority: "Normal", assignee: "Priya Nair", team: "Content Team", created: "2026-09-12", sla: "On Track" },
  { id: "HAU-2026-00097", title: "Nodal Officer Access Request", organization: "HAU", project: "HAU University Website", category: "Technical Support", status: "Assigned", priority: "Normal", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-12", sla: "On Track" },
  { id: "REV-2026-00074", title: "Grievance Form — Field Modification", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Software & Application", status: "In Progress", priority: "High", assignee: "Imran Sheikh", team: "QA Team", created: "2026-09-12", sla: "On Track" },
  { id: "SHM-2026-00051", title: "Performance Degradation Report", organization: "State Health Mission", project: "Health Mission MIS", category: "Technical Support", status: "In Progress", priority: "Critical", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-12", sla: "At Risk" },
  { id: "MGSU-2026-00120", title: "Scholarship PDF — Broken Link", organization: "MGSU", project: "MGSU Website Portal", category: "Website & Content", status: "In Progress", priority: "High", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-11", sla: "At Risk" },
  { id: "HAU-2026-00096", title: "Photo Gallery — Convocation 2026", organization: "HAU", project: "HAU University Website", category: "Website & Content", status: "Resolved", priority: "Low", assignee: "Divya Menon", team: "Content Team", created: "2026-09-11", sla: "Met" },
  { id: "REV-2026-00073", title: "District Officer Access Request", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Technical Support", status: "Resolved", priority: "Normal", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-11", sla: "Met" },
  { id: "SHM-2026-00050", title: "Health Camp Page Update", organization: "State Health Mission", project: "Health Mission MIS", category: "Website & Content", status: "New", priority: "Low", assignee: "Unassigned", team: "Unassigned", created: "2026-09-11", sla: "On Track" },
  { id: "HAU-2026-00095", title: "Anti-ragging Policy Page", organization: "HAU", project: "HAU University Website", category: "Website & Content", status: "New", priority: "Normal", assignee: "Unassigned", team: "Unassigned", created: "2026-09-11", sla: "Due Soon" },
  { id: "REV-2026-00072", title: "Notice Board — New Circular", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Website & Content", status: "Assigned", priority: "Normal", assignee: "Priya Nair", team: "Content Team", created: "2026-09-11", sla: "On Track" },
  { id: "SHM-2026-00049", title: "Access Request — Block Officer", organization: "State Health Mission", project: "Health Mission MIS", category: "Technical Support", status: "Assigned", priority: "Normal", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-11", sla: "On Track" },
  { id: "MGSU-2026-00119", title: "Old News Archive Cleanup", organization: "MGSU", project: "MGSU Website Portal", category: "Website & Content", status: "Assigned", priority: "Low", assignee: "Divya Menon", team: "Content Team", created: "2026-09-11", sla: "On Track" },
  { id: "HAU-2026-00094", title: "Fee Receipt Email Not Sending", organization: "HAU", project: "HAU University Website", category: "Technical Support", status: "In Progress", priority: "Critical", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-11", sla: "Breached" },
  { id: "REV-2026-00071", title: "Map View Not Loading", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Technical Support", status: "In Progress", priority: "High", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-11", sla: "At Risk" },
  { id: "MGSU-2026-00118", title: "Hostel Allotment — Data Update", organization: "MGSU", project: "MGSU Admission Portal", category: "Software & Application", status: "In Progress", priority: "Normal", assignee: "Priya Nair", team: "Content Team", created: "2026-09-10", sla: "On Track" },
  { id: "HAU-2026-00093", title: "Old Faculty Directory Cleanup", organization: "HAU", project: "HAU University Website", category: "Website & Content", status: "Resolved", priority: "Low", assignee: "Divya Menon", team: "Content Team", created: "2026-09-10", sla: "Met" },
  { id: "REV-2026-00070", title: "Bulk Grievance Import Failure", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Software & Application", status: "New", priority: "High", assignee: "Unassigned", team: "Unassigned", created: "2026-09-10", sla: "Due Soon" },
  { id: "SHM-2026-00048", title: "Coverage Report Format Change", organization: "State Health Mission", project: "Health Mission MIS", category: "Software & Application", status: "In Progress", priority: "Normal", assignee: "Imran Sheikh", team: "QA Team", created: "2026-09-10", sla: "On Track" },
  { id: "MGSU-2026-00117", title: "Website Search Not Returning Results", organization: "MGSU", project: "MGSU Website Portal", category: "Technical Support", status: "Resolved", priority: "High", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-10", sla: "Met" },
  { id: "HAU-2026-00092", title: "Mobile Menu Overlap Issue", organization: "HAU", project: "HAU University Website", category: "Software & Application", status: "In Progress", priority: "Normal", assignee: "Imran Sheikh", team: "QA Team", created: "2026-09-10", sla: "On Track" },
  { id: "REV-2026-00069", title: "User Manual PDF Upload", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Website & Content", status: "Resolved", priority: "Low", assignee: "Divya Menon", team: "Content Team", created: "2026-09-10", sla: "Met" },
  { id: "SHM-2026-00047", title: "Vaccination Coverage Data Fix", organization: "State Health Mission", project: "Health Mission MIS", category: "Software & Application", status: "Resolved", priority: "High", assignee: "Divya Menon", team: "Content Team", created: "2026-09-10", sla: "Met" },
  { id: "HAU-2026-00091", title: "Event Calendar Sync Failure", organization: "HAU", project: "HAU University Website", category: "Software & Application", status: "In Progress", priority: "High", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-09", sla: "At Risk" },
  { id: "REV-2026-00068", title: "Login Captcha Refresh Issue", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Technical Support", status: "In Progress", priority: "Normal", assignee: "Priya Nair", team: "Development Team", created: "2026-09-09", sla: "On Track" },
  { id: "SHM-2026-00046", title: "User Manual Content Update", organization: "State Health Mission", project: "Health Mission MIS", category: "Website & Content", status: "Resolved", priority: "Low", assignee: "Divya Menon", team: "Content Team", created: "2026-09-09", sla: "Met" },
  { id: "MGSU-2026-00116", title: "Alumni Directory Pagination Bug", organization: "MGSU", project: "MGSU Website Portal", category: "Software & Application", status: "Resolved", priority: "Normal", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-09", sla: "Met" },
  { id: "HAU-2026-00090", title: "Hostel Form — Field Addition", organization: "HAU", project: "HAU University Website", category: "Software & Application", status: "Resolved", priority: "Normal", assignee: "Priya Nair", team: "Development Team", created: "2026-09-09", sla: "Met" },
  { id: "REV-2026-00067", title: "Grievance Category Rename", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Software & Application", status: "Resolved", priority: "Low", assignee: "Imran Sheikh", team: "QA Team", created: "2026-09-09", sla: "Met" },
  { id: "SHM-2026-00045", title: "Mobile App Screenshot Upload", organization: "State Health Mission", project: "Health Mission MIS", category: "Website & Content", status: "In Progress", priority: "Normal", assignee: "Priya Nair", team: "Content Team", created: "2026-09-09", sla: "On Track" },
  { id: "MGSU-2026-00115", title: "Tender Archive — Access Issue", organization: "MGSU", project: "MGSU Website Portal", category: "Technical Support", status: "Resolved", priority: "Normal", assignee: "Sneha Kulkarni", team: "Development Team", created: "2026-09-09", sla: "Met" },
  { id: "HAU-2026-00089", title: "Homepage Slider Autoplay Bug", organization: "HAU", project: "HAU University Website", category: "Software & Application", status: "Resolved", priority: "Normal", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-08", sla: "Met" },
  { id: "REV-2026-00066", title: "Homepage Notice Ticker", organization: "Department of Revenue", project: "Revenue Grievance System", category: "Website & Content", status: "Resolved", priority: "Normal", assignee: "Divya Menon", team: "Content Team", created: "2026-09-08", sla: "Met" },
  { id: "SHM-2026-00044", title: "Grievance Form — Health Wing", organization: "State Health Mission", project: "Health Mission MIS", category: "Software & Application", status: "In Progress", priority: "High", assignee: "Rahul Verma", team: "Development Team", created: "2026-09-08", sla: "At Risk" },
  { id: "MGSU-2026-00114", title: "Fee Structure Table Update", organization: "MGSU", project: "MGSU Admission Portal", category: "Website & Content", status: "Resolved", priority: "Normal", assignee: "Divya Menon", team: "Content Team", created: "2026-09-08", sla: "Met" },
  { id: "SHM-2026-00043", title: "Old Circular Archive Cleanup", organization: "State Health Mission", project: "Health Mission MIS", category: "Website & Content", status: "Resolved", priority: "Low", assignee: "Divya Menon", team: "Content Team", created: "2026-09-08", sla: "Met" },
];

export const queuePriorityOptions = ["All Priorities", "Critical", "High", "Normal", "Low"];

export const queueAssigneeOptions = [
  "All Assignees",
  "Unassigned",
  "Arjun Mehta",
  "Priya Nair",
  "Rahul Verma",
  "Sneha Kulkarni",
  "Imran Sheikh",
  "Divya Menon",
];

export const queueDateOptions = [
  "All Time",
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "Custom Range",
];