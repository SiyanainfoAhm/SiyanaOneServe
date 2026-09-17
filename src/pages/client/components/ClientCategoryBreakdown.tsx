/**
 * Client dashboard chart of request categories from live tickets.
 */
import { useMemo } from "react";
import { useAppData } from "@/context/AppDataContext";
import { useProjectScope, filterByProject } from "@/hooks/useProjectScope";
import { categoryBreakdown } from "@/utils/liveStats";

const TONE_BUBBLE: Record<string, string> = {
  primary: "bg-primary-100 text-primary-700",
  accent: "bg-accent-100 text-accent-700",
  secondary: "bg-secondary-100 text-secondary-800",
};

const TONE_BAR: Record<string, string> = {
  primary: "bg-primary-500",
  accent: "bg-accent-500",
  secondary: "bg-secondary-400",
};

export default function ClientCategoryBreakdown() {
  const { tickets } = useAppData();
  const scope = useProjectScope();
  const rows = useMemo(
    () => categoryBreakdown(filterByProject(tickets, scope)),
    [tickets, scope],
  );
  const total = rows.reduce((sum, item) => sum + item.value, 0);

  if (rows.length === 0) {
    return <p className="text-xs text-foreground-500">No requests in this view yet.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {rows.map((item) => {
        const pct = total ? Math.round((item.value / total) * 100) : 0;
        const resolvedPct = item.value ? Math.round((item.resolved / item.value) * 100) : 0;
        return (
          <div key={item.key}>
            <div className="flex items-center gap-3">
              <span
                className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                  TONE_BUBBLE[item.tone] ?? TONE_BUBBLE.primary
                }`}
              >
                <i className={`${item.icon} text-[18px] leading-none`}></i>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground-900">{item.name}</p>
                  <span className="text-sm font-label font-semibold text-foreground-950">
                    {item.value}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-background-200">
                  <div
                    className={`h-full rounded-full ${TONE_BAR[item.tone] ?? TONE_BAR.primary}`}
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-foreground-500">
                  <span>{pct}% of all requests</span>
                  <span className="text-accent-700">{resolvedPct}% resolved</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
