/**
 * Leftover settings demo. Live profile is sosticket_update_profile.
 */
export interface NotificationPref {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
}

export const notificationPrefs: NotificationPref[] = [
  { id: "n1", label: "New request received", description: "When a government department raises a new service request", email: true, inApp: true },
  { id: "n2", label: "Ticket assigned to me", description: "When a ticket is assigned or reassigned to you", email: true, inApp: true },
  { id: "n3", label: "SLA at risk", description: "When a ticket is 80% through its SLA window", email: true, inApp: true },
  { id: "n4", label: "SLA breached", description: "When a ticket passes its SLA deadline", email: true, inApp: true },
  { id: "n5", label: "Status change on my tickets", description: "When a ticket you follow moves to a new stage", email: true, inApp: true },
  { id: "n6", label: "New note added", description: "When someone adds a note on a ticket you follow", email: true, inApp: true },
  { id: "n7", label: "Daily digest", description: "A morning summary of queue health and pending items", email: false, inApp: true },
];

export const generalDefaults = {
  platformName: "Siyana OneServe",
  supportEmail: "servicedesk@siyana.in",
  defaultLanguage: "English",
  timezone: "IST (UTC+05:30)",
  workingHours: "09:00 – 18:00",
  workingDays: "Monday – Saturday",
};