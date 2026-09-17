/**
 * Dashboard workload chart from live tickets grouped by team.
 */
import { useMemo } from "react";
import Avatar from "@/components/base/Avatar";
import { useAppData } from "@/context/AppDataContext";
import { useProjectScope, filterByProject } from "@/hooks/useProjectScope";
import { workloadFromTickets } from "@/utils/liveStats";

const MAX_LOAD = 24;

export default function TeamWorkload() {
  const { tickets } = useAppData();
  const scope = useProjectScope();
  const members = useMemo(
    () => workloadFromTickets(filterByProject(tickets, scope)),
    [tickets, scope],
  );

  if (members.length === 0) {
    return <p className="text-xs text-foreground-500">No assigned open tickets in this view.</p>;
  }

  return (
    <div className="flex flex-col gap-3.5">
      {members.map((member, index) => (
        <div key={member.name} className="flex items-center gap-3">
          <Avatar
            initials={member.initials}
            size="sm"
            tone={index % 3 === 0 ? "primary" : index % 3 === 1 ? "accent" : "secondary"}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground-900 truncate">
                {member.name}
              </span>
              <span className="text-[11px] font-label font-semibold text-foreground-500">
                {member.load} open
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-background-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  member.load >= 20
                    ? "bg-[oklch(var(--status-warning))]"
                    : index % 2 === 0
                    ? "bg-primary-500"
                    : "bg-accent-500"
                }`}
                style={{ width: `${Math.min((member.load / MAX_LOAD) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
