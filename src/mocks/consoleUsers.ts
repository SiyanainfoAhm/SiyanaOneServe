/**
 * ConsoleUser type + leftover demo. Invite/edit uses sosticket_invite_user / sosticket_update_user.
 */
export interface ConsoleUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: string;
  team: string;
  organization: string;
  type: "staff" | "government";
  status: "Active" | "Inactive";
  openTickets: number;
  lastActive: string;
  projects?: string[];
}

export const consoleUsers: ConsoleUser[] = [
  { id: "u1", name: "Arjun Mehta", initials: "AM", email: "arjun.mehta@siyana.in", role: "Operations Admin", team: "Operations", organization: "Siyana", type: "staff", status: "Active", openTickets: 8, lastActive: "Active now" },
  { id: "u2", name: "Priya Nair", initials: "PN", email: "priya.nair@siyana.in", role: "Content Analyst", team: "Content Team", organization: "Siyana", type: "staff", status: "Active", openTickets: 22, lastActive: "Active now" },
  { id: "u3", name: "Rahul Verma", initials: "RV", email: "rahul.verma@siyana.in", role: "Senior Developer", team: "Development Team", organization: "Siyana", type: "staff", status: "Active", openTickets: 18, lastActive: "12 min ago" },
  { id: "u4", name: "Sneha Kulkarni", initials: "SK", email: "sneha.kulkarni@siyana.in", role: "Developer", team: "Development Team", organization: "Siyana", type: "staff", status: "Active", openTickets: 16, lastActive: "28 min ago" },
  { id: "u5", name: "Imran Sheikh", initials: "IS", email: "imran.sheikh@siyana.in", role: "QA Engineer", team: "QA Team", organization: "Siyana", type: "staff", status: "Active", openTickets: 11, lastActive: "1h ago" },
  { id: "u6", name: "Divya Menon", initials: "DM", email: "divya.menon@siyana.in", role: "Content Analyst", team: "Content Team", organization: "Siyana", type: "staff", status: "Inactive", openTickets: 13, lastActive: "Yesterday" },
  { id: "u7", name: "Nikhil Rao", initials: "NR", email: "nikhil.rao@siyana.in", role: "Project Manager", team: "Operations", organization: "Siyana", type: "staff", status: "Active", openTickets: 4, lastActive: "45 min ago" },
  { id: "u8", name: "Farah Ansari", initials: "FA", email: "farah.ansari@siyana.in", role: "Business Analyst", team: "Operations", organization: "Siyana", type: "staff", status: "Active", openTickets: 0, lastActive: "Invite pending" },
  { id: "u9", name: "Vikram Singh", initials: "VS", email: "vikram.singh@siyana.in", role: "Super Admin", team: "Operations", organization: "Siyana", type: "staff", status: "Active", openTickets: 2, lastActive: "3h ago" },
  { id: "u10", name: "Dr. Meera Joshi", initials: "MJ", email: "meera.joshi@mgsu.ac.in", role: "Government Nodal Officer", team: "—", organization: "MGSU", type: "government", status: "Active", openTickets: 9, lastActive: "Active now", projects: ["MGSU Website Portal", "MGSU Admission Portal", "MGSU Alumni Network"] },
  { id: "u11", name: "Sanjay Kulkarni", initials: "SK", email: "sanjay.k@mgsu.ac.in", role: "Government Requester", team: "—", organization: "MGSU", type: "government", status: "Active", openTickets: 5, lastActive: "2h ago", projects: ["MGSU Website Portal", "MGSU Campus Wi-Fi Portal"] },
  { id: "u12", name: "Prof. Anil Deshmukh", initials: "AD", email: "registrar@hau.ac.in", role: "Government Nodal Officer", team: "—", organization: "HAU", type: "government", status: "Active", openTickets: 7, lastActive: "38 min ago", projects: ["HAU University Website", "HAU Examination System", "HAU Library Management"] },
  { id: "u13", name: "Ramesh Patil", initials: "RP", email: "ramesh.patil@revenue.gov.in", role: "Government Nodal Officer", team: "—", organization: "Department of Revenue", type: "government", status: "Active", openTickets: 11, lastActive: "1h ago", projects: ["Revenue Grievance System", "Revenue Land Records"] },
  { id: "u14", name: "Dr. Kavita Rao", initials: "KR", email: "kavita.rao@shm.gov.in", role: "Government Nodal Officer", team: "—", organization: "State Health Mission", type: "government", status: "Inactive", openTickets: 6, lastActive: "Yesterday", projects: ["Health Mission MIS", "SHM Telemedicine Portal", "SHM Field Worker App"] },
];