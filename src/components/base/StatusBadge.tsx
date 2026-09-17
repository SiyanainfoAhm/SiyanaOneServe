/**
 * Ticket / SLA / priority chips.
 *
 * Lifecycle (server-enforced): Need Approval → New → Assigned → In Progress → Resolved → Closed.
 * Rejected is a terminal draft-approval outcome. Draft is rarely used in live data.
 */
export type Tone = "primary" | "accent" | "secondary" | "info" | "success" | "warning" | "danger" | "neutral";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-secondary-100 text-secondary-800 border-secondary-200",
  primary: "bg-primary-100 text-primary-700 border-primary-200",
  accent: "bg-accent-100 text-accent-700 border-accent-200",
  secondary: "bg-secondary-100 text-secondary-800 border-secondary-200",
  info: "bg-[oklch(var(--status-info)/0.12)] text-[oklch(var(--status-info))] border-[oklch(var(--status-info)/0.28)]",
  success: "bg-[oklch(var(--status-success)/0.12)] text-[oklch(var(--status-success))] border-[oklch(var(--status-success)/0.28)]",
  warning: "bg-[oklch(var(--status-warning)/0.14)] text-[oklch(var(--status-warning))] border-[oklch(var(--status-warning)/0.30)]",
  danger: "bg-[oklch(var(--status-danger)/0.12)] text-[oklch(var(--status-danger))] border-[oklch(var(--status-danger)/0.28)]",
};

const STATUS_TONES: Record<string, Tone> = {
  Draft: "neutral",
  "Need Approval": "warning",
  New: "info",
  Assigned: "primary",
  "In Progress": "primary",
  Resolved: "success",
  Closed: "success",
  Rejected: "danger",
};

export const STATUS_ORDER = [
  "Draft",
  "Need Approval",
  "New",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Rejected",
];

export const STATUS_ICONS: Record<string, string> = {
  Draft: "ri-draft-line",
  "Need Approval": "ri-user-received-line",
  New: "ri-inbox-archive-line",
  Assigned: "ri-user-star-line",
  "In Progress": "ri-loader-4-line",
  Resolved: "ri-checkbox-circle-line",
  Closed: "ri-lock-line",
  Rejected: "ri-close-circle-line",
};

export function statusTone(status: string): Tone {
  return STATUS_TONES[status] ?? "neutral";
}

const PRIORITY_TONES: Record<string, Tone> = {
  Critical: "danger",
  High: "warning",
  Normal: "info",
  Low: "neutral",
};

const SLA_TONES: Record<string, Tone> = {
  Met: "success",
  "On Track": "success",
  "Due Soon": "warning",
  "At Risk": "warning",
  Breached: "danger",
};

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ label, tone = "neutral", dot = true, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-label font-medium whitespace-nowrap ${TONE_CLASSES[tone]} ${className}`}
    >
      {dot ? <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span> : null}
      {label}
    </span>
  );
}

export function TicketStatusBadge({ status }: { status: string }) {
  return <StatusBadge label={status} tone={STATUS_TONES[status] ?? "neutral"} />;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const tone = PRIORITY_TONES[priority] ?? "neutral";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-label font-semibold uppercase tracking-wide whitespace-nowrap ${TONE_CLASSES[tone]}`}
    >
      {priority}
    </span>
  );
}

export function SlaBadge({ sla }: { sla: string }) {
  return <StatusBadge label={sla} tone={SLA_TONES[sla] ?? "neutral"} />;
}

export default StatusBadge;