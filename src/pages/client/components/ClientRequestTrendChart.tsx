/**
 * Client dashboard trend of submissions over time.
 */
import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppData } from "@/context/AppDataContext";
import { useProjectScope, filterByProject } from "@/hooks/useProjectScope";
import { monthVolumeTrend } from "@/utils/liveStats";

export default function ClientRequestTrendChart() {
  const { tickets } = useAppData();
  const scope = useProjectScope();
  const data = useMemo(
    () => monthVolumeTrend(filterByProject(tickets, scope)),
    [tickets, scope],
  );

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="clientRaisedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(var(--primary-500))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(var(--primary-500))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="clientResolvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(var(--accent-500))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(var(--accent-500))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--background-200))" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "oklch(var(--foreground-500))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "oklch(var(--foreground-500))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid oklch(var(--background-200))",
              fontSize: 12,
              fontFamily: "var(--font-body)",
              background: "oklch(var(--background-50))",
            }}
            labelStyle={{ color: "oklch(var(--foreground-950))", fontWeight: 600 }}
          />
          <Area
            type="monotone"
            dataKey="raised"
            name="Raised"
            stroke="oklch(var(--primary-500))"
            strokeWidth={2}
            fill="url(#clientRaisedGrad)"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            name="Resolved"
            stroke="oklch(var(--accent-500))"
            strokeWidth={2}
            fill="url(#clientResolvedGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
