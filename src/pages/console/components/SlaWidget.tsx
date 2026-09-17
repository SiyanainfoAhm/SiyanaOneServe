/**
 * Console SLA summary (On Track / Due Soon / At Risk / Breached / Met).
 */
import { useMemo } from "react";
import { useAppData } from "@/context/AppDataContext";
import { useProjectScope, filterByProject } from "@/hooks/useProjectScope";
import { slaCounts } from "@/utils/liveStats";

const TONE_TEXT: Record<string, string> = {
  accent: "text-accent-700",
  warning: "text-[oklch(var(--status-warning))]",
  danger: "text-[oklch(var(--status-danger))]",
};

const TONE_DOT: Record<string, string> = {
  accent: "bg-accent-500",
  warning: "bg-[oklch(var(--status-warning))]",
  danger: "bg-[oklch(var(--status-danger))]",
};

export default function SlaWidget() {
  const { tickets } = useAppData();
  const scope = useProjectScope();
  const scoped = useMemo(() => filterByProject(tickets, scope), [tickets, scope]);
  const counts = slaCounts(scoped);
  const rows = [
    { key: "onTrack", label: "On Track", value: Math.round((counts.onTrack / counts.active) * 100), tone: "accent" },
    { key: "atRisk", label: "At Risk", value: Math.round(((counts.atRisk + counts.dueSoon) / counts.active) * 100), tone: "warning" },
    { key: "breached", label: "Breached", value: Math.round((counts.breached / counts.active) * 100), tone: "danger" },
  ];
  const gradient = `conic-gradient(oklch(var(--accent-500)) 0% ${rows[0].value}%, oklch(var(--status-warning)) ${rows[0].value}% ${rows[0].value + rows[1].value}%, oklch(var(--status-danger)) ${rows[0].value + rows[1].value}% 100%)`;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="relative w-[148px] h-[148px] shrink-0 self-center">
        <div className="w-full h-full rounded-full" style={{ background: gradient }}></div>
        <div className="absolute inset-[16px] rounded-full bg-background-50 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold text-foreground-950">{counts.onTrackPct}%</span>
          <span className="text-[10px] uppercase tracking-wide text-foreground-500">On Track</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground-500">
          SLA performance across{" "}
          <span className="font-semibold text-foreground-900">{counts.active} active tickets</span>
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {rows.map((item) => (
            <div key={item.key}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${TONE_DOT[item.tone]}`}></span>
                <span className="flex-1 text-sm text-foreground-700">{item.label}</span>
                <span className={`text-sm font-label font-semibold ${TONE_TEXT[item.tone]}`}>
                  {item.value}%
                </span>
              </div>
              <div className="mt-1.5 ml-[18px] h-1.5 rounded-full bg-background-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${TONE_DOT[item.tone]}`}
                  style={{ width: `${item.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
