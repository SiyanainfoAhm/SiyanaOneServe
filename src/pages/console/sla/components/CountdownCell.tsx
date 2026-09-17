/**
 * SLA page countdown cell (same timing model as the queue).
 */
import { formatDuration } from "@/hooks/useTicker";
import type { SlaRow } from "@/mocks/consoleSla";

const TONE_TEXT: Record<string, string> = {
  "On Track": "text-accent-700",
  "At Risk": "text-[oklch(var(--status-warning))]",
  Breached: "text-[oklch(var(--status-danger))]",
  Met: "text-foreground-500",
};

const TONE_BAR: Record<string, string> = {
  "On Track": "bg-accent-500",
  "At Risk": "bg-[oklch(var(--status-warning))]",
  Breached: "bg-[oklch(var(--status-danger))]",
  Met: "bg-secondary-400",
};

export default function CountdownCell({ row, elapsed }: { row: SlaRow; elapsed: number }) {
  if (row.state === "Met") {
    return (
      <div className="flex flex-col gap-1">
        <span className="inline-flex items-center gap-1.5 text-sm font-label font-semibold text-accent-700">
          <i className="ri-checkbox-circle-line text-[15px] leading-none"></i>
          Met
        </span>
        <span className="text-[11px] text-foreground-500">{row.openedAgo}</span>
      </div>
    );
  }

  const remaining = row.dueInSeconds - elapsed;
  const breached = remaining < 0;
  const ratio = Math.max(0, Math.min(1, remaining / row.windowSeconds));

  return (
    <div className="flex flex-col gap-1.5 min-w-[140px]">
      <span className={`font-mono text-sm font-semibold ${TONE_TEXT[row.state]}`}>
        {breached ? `−${formatDuration(remaining)}` : formatDuration(remaining)}
      </span>
      <div className="h-1.5 w-full rounded-full bg-background-200 overflow-hidden">
        <div
          className={`h-full rounded-full ${breached ? TONE_BAR.Breached : TONE_BAR[row.state]}`}
          style={{ width: `${ratio * 100}%` }}
        ></div>
      </div>
      <span className="text-[11px] text-foreground-400">
        {breached ? "Overdue" : "remaining"} · opened {row.openedAgo}
      </span>
    </div>
  );
}