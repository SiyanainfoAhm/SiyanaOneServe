/**
 * Ops reports from sosticket_reports, filtered by project scope.
 */
import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import PageHeader from "@/pages/console/components/PageHeader";
import Card, { CardHeader } from "@/components/base/Card";
import Select from "@/components/base/Select";
import CustomDateRangeFields from "@/components/feature/CustomDateRangeFields";
import Avatar from "@/components/base/Avatar";
import StatCard from "@/pages/console/components/StatCard";
import { reportRangeOptions } from "@/mocks/consoleReports";
import { useConsoleTickets } from "@/hooks/useConsoleTicketStore";
import { useProjectScope, filterByProject, ALL_PROJECTS } from "@/hooks/useProjectScope";
import { createDateRange, matchesDateRange, CUSTOM_RANGE, type DateRangeValue, todayIso } from "@/utils/date";
import { monthVolumeTrend } from "@/utils/liveStats";
import { useAppData } from "@/context/AppDataContext";

const TODAY = todayIso();

const tooltipStyle = {
  borderRadius: 8,
  border: "1px solid oklch(var(--background-200))",
  fontSize: 12,
  fontFamily: "var(--font-body)",
  background: "oklch(var(--background-50))",
};

const HEAD = "px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRangeValue>(createDateRange("This quarter"));
  const allTickets = useConsoleTickets();
  const { tickets: liveTickets } = useAppData();
  const scope = useProjectScope();
  const tickets = useMemo(
    () =>
      filterByProject(allTickets, scope).filter((ticket) =>
        matchesDateRange(ticket.created, dateRange, TODAY),
      ),
    [allTickets, scope, dateRange],
  );
  const volumeTrend = useMemo(
    () => monthVolumeTrend(filterByProject(liveTickets, scope)),
    [liveTickets, scope],
  );

  const summary = useMemo(() => {
    const total = tickets.length;
    const resolved = tickets.filter((ticket) => ticket.status === "Resolved" || ticket.status === "Closed").length;
    return { total, resolved, pending: total - resolved };
  }, [tickets]);

  const projectRows = useMemo(() => {
    const map = new Map<string, { project: string; organization: string; total: number; resolved: number }>();
    tickets.forEach((ticket) => {
      const entry = map.get(ticket.project) ?? {
        project: ticket.project,
        organization: ticket.organization,
        total: 0,
        resolved: 0,
      };
      entry.total += 1;
      if (ticket.status === "Resolved" || ticket.status === "Closed") entry.resolved += 1;
      map.set(ticket.project, entry);
    });
    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        pending: entry.total - entry.resolved,
        completion: entry.total ? Math.round((entry.resolved / entry.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [tickets]);

  const priorityMix = useMemo(() => {
    const order = ["Critical", "High", "Normal", "Low"];
    const map = new Map<string, number>();
    order.forEach((priority) => map.set(priority, 0));
    tickets.forEach((ticket) => map.set(ticket.priority, (map.get(ticket.priority) ?? 0) + 1));
    const total = tickets.length || 1;
    return order.map((priority) => ({
      priority,
      value: map.get(priority) ?? 0,
      percent: Math.round(((map.get(priority) ?? 0) / total) * 100),
    }));
  }, [tickets]);

  const statusBreakdown = useMemo(() => {
    const order = ["New", "Assigned", "In Progress", "Resolved"];
    const map = new Map<string, number>();
    order.forEach((status) => map.set(status, 0));
    tickets.forEach((ticket) => {
      const key = ticket.status === "Closed" ? "Resolved" : ticket.status;
      if (order.includes(key)) map.set(key, (map.get(key) ?? 0) + 1);
    });
    const total = tickets.length || 1;
    return order.map((status) => ({
      status,
      value: map.get(status) ?? 0,
      percent: Math.round(((map.get(status) ?? 0) / total) * 100),
    }));
  }, [tickets]);

  const teamRows = useMemo(() => {
    const map = new Map<string, { name: string; assigned: number; completed: number }>();
    tickets
      .filter((ticket) => ticket.assignee !== "Unassigned")
      .forEach((ticket) => {
        const entry = map.get(ticket.assignee) ?? { name: ticket.assignee, assigned: 0, completed: 0 };
        entry.assigned += 1;
        if (ticket.status === "Resolved" || ticket.status === "Closed") entry.completed += 1;
        map.set(ticket.assignee, entry);
      });
    return Array.from(map.values())
      .map((entry) => ({ ...entry, pending: entry.assigned - entry.completed }))
      .sort((a, b) => b.assigned - a.assigned);
  }, [tickets]);

  return (
    <ConsoleLayout>
      <PageHeader
        title="Reports"
        subtitle={
          scope === ALL_PROJECTS
            ? "Live performance and team productivity derived from the current request statuses"
            : `Live performance reports · filtered to ${scope}`
        }
        actions={
          <Select
            options={reportRangeOptions}
            value={dateRange.preset}
            onChange={(e) => setDateRange({ ...dateRange, preset: e.target.value })}
            icon="ri-calendar-line"
            containerClassName="w-[168px]"
          />
        }
      />

      {dateRange.preset === CUSTOM_RANGE ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-background-200 bg-background-50 px-4 py-3">
          <span className="flex items-center gap-2 text-xs font-label font-medium text-foreground-700">
            <i className="ri-calendar-2-line text-foreground-500 text-[15px] leading-none"></i>
            Custom date range
          </span>
          <CustomDateRangeFields
            from={dateRange.from}
            to={dateRange.to}
            onFrom={(value) => setDateRange({ ...dateRange, from: value })}
            onTo={(value) => setDateRange({ ...dateRange, to: value })}
          />
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Requests" value={String(summary.total)} delta="Across all projects" tone="primary" icon="ri-ticket-2-line" />
        <StatCard label="Resolved" value={String(summary.resolved)} delta="Completed requests" tone="accent" icon="ri-checkbox-circle-line" />
        <StatCard label="Open Requests" value={String(summary.pending)} delta="Still being worked on" tone="info" icon="ri-loader-4-line" />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader title="Ticket Volume Trend" subtitle="Created vs Resolved · last 6 months" />
          <div className="mt-4 h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--background-200))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "oklch(var(--foreground-500))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(var(--foreground-500))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(var(--background-100))" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="created" name="Created" fill="oklch(var(--primary-500))" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Bar dataKey="closed" name="Resolved" fill="oklch(var(--accent-500))" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Priority Mix" subtitle="Share of requests by priority" />
          <div className="mt-4 flex flex-col gap-3.5">
            {priorityMix.map((row) => {
              const colors: Record<string, string> = {
                Critical: "bg-[oklch(var(--status-danger))]",
                High: "bg-[oklch(var(--status-warning))]",
                Normal: "bg-primary-500",
                Low: "bg-secondary-400",
              };
              return (
                <div key={row.priority}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground-700">{row.priority}</span>
                    <span className="font-label font-semibold text-foreground-900">
                      {row.value} <span className="text-foreground-400">({row.percent}%)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-background-200 overflow-hidden">
                    <div className={`h-full rounded-full ${colors[row.priority] ?? "bg-primary-500"}`} style={{ width: `${row.percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card className="mt-4" padded={false}>
        <div className="px-5 pt-5">
          <CardHeader title="Project Performance Report" subtitle="Live request totals and completion per project" />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-background-200 bg-background-50">
                <th className={HEAD}>Project</th>
                <th className={HEAD}>Organization</th>
                <th className={HEAD}>Total</th>
                <th className={HEAD}>Resolved</th>
                <th className={HEAD}>Pending</th>
                <th className={HEAD}>Completion</th>
              </tr>
            </thead>
            <tbody>
              {projectRows.map((row) => (
                <tr key={row.project} className="border-b border-background-100 last:border-0 hover:bg-background-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground-900">{row.project}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-600">{row.organization}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground-800">{row.total}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-accent-700 font-label font-semibold">{row.resolved}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground-800">{row.pending}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-background-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${row.completion >= 80 ? "bg-accent-500" : row.completion >= 50 ? "bg-primary-500" : "bg-[oklch(var(--status-warning))]"}`}
                          style={{ width: `${row.completion}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-foreground-700">{row.completion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader title="Team Performance" subtitle="Assigned, resolved and pending tickets per member" />
          <div className="mt-4 flex flex-col gap-4">
            {teamRows.map((member) => (
              <div key={member.name} className="flex items-center gap-3.5">
                <Avatar initials={initialsOf(member.name)} size="sm" tone="primary" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground-900">{member.name}</span>
                    <span className="text-[11px] text-foreground-500">
                      {member.completed}/{member.assigned} resolved · {member.pending} pending
                    </span>
                  </div>
                  <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-background-200">
                    <div className="h-full bg-accent-500" style={{ width: `${(member.completed / member.assigned) * 100}%` }}></div>
                    <div className="h-full bg-[oklch(var(--status-warning))]" style={{ width: `${(member.pending / member.assigned) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Status Breakdown" subtitle="Requests by current status" />
          <div className="mt-4 flex flex-col gap-3.5">
            {statusBreakdown.map((row) => {
              const colors: Record<string, string> = {
                New: "bg-[oklch(var(--status-info))]",
                Assigned: "bg-primary-500",
                "In Progress": "bg-primary-400",
                Resolved: "bg-accent-500",
              };
              return (
                <div key={row.status} className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${colors[row.status] ?? "bg-primary-500"}`}></span>
                  <span className="flex-1 text-xs text-foreground-700">{row.status}</span>
                  <span className="text-xs font-label font-semibold text-foreground-950">{row.value}</span>
                  <span className="w-9 text-right text-[11px] text-foreground-400">{row.percent}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </ConsoleLayout>
  );
}