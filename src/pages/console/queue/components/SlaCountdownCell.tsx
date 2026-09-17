/**
 * Live SLA countdown using due_in_seconds + useTicker (1s).
 */
import { formatDuration } from "@/hooks/useTicker";
import { slaTiming } from "@/utils/sla";

interface SlaCountdownCellProps {
  id: string;
  priority: string;
  sla: string;
  elapsed: number;
  dueInSeconds?: number;
}

interface Tone {
  wrap: string;
  icon: string;
  label: string;
}

const TONES: Record<string, Tone> = {
  "On Track": {
    wrap: "border-accent-200 bg-accent-50 text-accent-700",
    icon: "ri-timer-line",
    label: "remaining",
  },
  "Due Soon": {
    wrap: "border-[oklch(var(--status-warning)/0.35)] bg-[oklch(var(--status-warning)/0.1)] text-[oklch(var(--status-warning))]",
    icon: "ri-timer-flash-line",
    label: "due soon",
  },
  "At Risk": {
    wrap: "border-[oklch(var(--status-warning)/0.45)] bg-[oklch(var(--status-warning)/0.12)] text-[oklch(var(--status-warning))]",
    icon: "ri-alert-line",
    label: "at risk",
  },
  Breached: {
    wrap: "border-[oklch(var(--status-danger)/0.45)] bg-[oklch(var(--status-danger)/0.12)] text-[oklch(var(--status-danger))]",
    icon: "ri-alarm-warning-line",
    label: "overdue",
  },
  Met: {
    wrap: "border-background-200 bg-background-100 text-foreground-500",
    icon: "ri-checkbox-circle-line",
    label: "met",
  },
};

export default function SlaCountdownCell({ id, priority, sla, elapsed, dueInSeconds }: SlaCountdownCellProps) {
  if (sla === "Met") {
    const met = TONES.Met;
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 ${met.wrap}`}>
        <i className={`${met.icon} text-[13px] leading-none`}></i>
        <span className="font-label text-xs font-medium">Met</span>
      </span>
    );
  }

  const { dueInSeconds: fallbackDue } = slaTiming(id, priority, sla);
  const remaining = (dueInSeconds ?? fallbackDue) - elapsed;
  const breached = remaining < 0;
  const tone = TONES[breached ? "Breached" : sla] ?? TONES["On Track"];
  const emphasize = breached && priority === "Critical";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 whitespace-nowrap ${tone.wrap} ${
        emphasize ? "border-2 border-[oklch(var(--status-danger))]" : ""
      }`}
    >
      {breached ? (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      ) : (
        <i className={`${tone.icon} text-[13px] leading-none`}></i>
      )}
      <span className="flex flex-col leading-none">
        <span className="font-mono text-xs font-semibold">
          {breached ? `−${formatDuration(remaining)}` : formatDuration(remaining)}
        </span>
        <span className="mt-0.5 text-[10px] font-label font-medium uppercase tracking-wide opacity-80">
          {tone.label}
        </span>
      </span>
    </span>
  );
}