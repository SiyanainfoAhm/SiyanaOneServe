/**
 * Dashboard status distribution from live tickets.
 */
import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAppData } from "@/context/AppDataContext";
import { useProjectScope, filterByProject } from "@/hooks/useProjectScope";
import { countMap } from "@/utils/liveStats";

type TabKey = "category" | "priority" | "organization";

const TABS: { key: TabKey; label: string }[] = [
  { key: "category", label: "Category" },
  { key: "priority", label: "Priority" },
  { key: "organization", label: "Organization" },
];

const TONE_COLOR = [
  "oklch(var(--primary-500))",
  "oklch(var(--accent-500))",
  "oklch(var(--secondary-400))",
  "oklch(var(--status-warning))",
];

const PRIORITY_COLOR: Record<string, string> = {
  Critical: "oklch(var(--status-danger))",
  High: "oklch(var(--status-warning))",
  Normal: "oklch(var(--primary-500))",
  Low: "oklch(var(--secondary-400))",
};

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid oklch(var(--background-200))",
  fontSize: 12,
  fontFamily: "var(--font-body)",
  background: "oklch(var(--background-50))",
};

export default function TicketDistribution() {
  const [tab, setTab] = useState<TabKey>("category");
  const { tickets } = useAppData();
  const scope = useProjectScope();
  const scoped = useMemo(() => filterByProject(tickets, scope), [tickets, scope]);

  const categoryData = countMap(scoped, "category").map((item, index) => ({
    ...item,
    color: TONE_COLOR[index % TONE_COLOR.length],
  }));
  const priorityData = countMap(scoped, "priority").map((item) => ({
    ...item,
    color: PRIORITY_COLOR[item.name] ?? TONE_COLOR[0],
  }));
  const orgData = countMap(scoped, "organization").map((item, index) => ({
    ...item,
    color: TONE_COLOR[index % TONE_COLOR.length],
  }));

  const activeData = tab === "category" ? categoryData : tab === "priority" ? priorityData : orgData;
  const total = activeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="inline-flex items-center gap-1 rounded-full border border-background-200 bg-background-100 p-1 self-start">
        {TABS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`rounded-full px-3 py-1 text-xs font-label font-medium whitespace-nowrap transition-colors cursor-pointer ${
              tab === item.key
                ? "bg-background-50 text-foreground-950 shadow-sm border border-background-200"
                : "text-foreground-500 hover:text-foreground-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative w-[150px] h-[150px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeData}
                dataKey="value"
                innerRadius={44}
                outerRadius={70}
                paddingAngle={2}
                stroke="none"
              >
                {activeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-heading text-2xl font-bold text-foreground-950">{total}</span>
            <span className="text-[11px] text-foreground-500">tickets</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
          {activeData.map((item) => (
            <div key={item.name} className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="flex-1 text-xs text-foreground-700 truncate">{item.name}</span>
              <span className="text-xs font-label font-semibold text-foreground-950">
                {item.value}
              </span>
              <span className="w-9 text-right text-[11px] text-foreground-400">
                {total ? Math.round((item.value / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
