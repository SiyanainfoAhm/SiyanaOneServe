/**
 * SLA watch list from sosticket_sla_list.
 * States: On Track, Due Soon, At Risk, Breached, Met.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import PageHeader from "@/pages/console/components/PageHeader";
import Card from "@/components/base/Card";
import Tabs from "@/components/base/Tabs";
import StatCard from "@/pages/console/components/StatCard";
import EmptyState from "@/components/base/EmptyState";
import { PriorityBadge, StatusBadge } from "@/components/base/StatusBadge";
import CountdownCell from "@/pages/console/sla/components/CountdownCell";
import { type SlaRow } from "@/mocks/consoleSla";
import { useTicker, formatDuration } from "@/hooks/useTicker";
import { useProjectScope, filterByProject, ALL_PROJECTS } from "@/hooks/useProjectScope";
import { useAppData } from "@/context/AppDataContext";
import type { TicketRecord } from "@/types/oneserve";

const HEAD = "px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500";

const STATE_TONE: Record<string, "success" | "warning" | "danger" | "neutral"> = {
  "On Track": "success",
  "Due Soon": "warning",
  "At Risk": "warning",
  Breached: "danger",
  Met: "neutral",
};

function toSlaRow(ticket: TicketRecord): SlaRow {
  const sla = ticket.sla === "Due Soon" ? "On Track" : ticket.sla;
  return {
    id: ticket.id,
    title: ticket.title,
    project: ticket.project,
    organization: ticket.organization,
    priority: ticket.priority,
    owner: ticket.assignee,
    ownerInitials: ticket.assignee_initials || "—",
    state: (["On Track", "At Risk", "Breached", "Met"].includes(sla) ? sla : "On Track") as SlaRow["state"],
    dueInSeconds: Number(ticket.due_in_seconds ?? 0),
    windowSeconds: Math.max(1, Number(ticket.window_seconds ?? 1)),
    openedAgo: ticket.updated,
  };
}

export default function SlaMonitorPage() {
  const elapsed = useTicker();
  const [tab, setTab] = useState("All");
  const scope = useProjectScope();
  const { tickets } = useAppData();

  const slaRows = useMemo(
    () => filterByProject(tickets.map(toSlaRow), scope),
    [tickets, scope],
  );

  const counts = useMemo(() => {
    return {
      All: slaRows.length,
      "On Track": slaRows.filter((row) => row.state === "On Track").length,
      "At Risk": slaRows.filter((row) => row.state === "At Risk").length,
      Breached: slaRows.filter((row) => row.state === "Breached").length,
      Met: slaRows.filter((row) => row.state === "Met").length,
    };
  }, [slaRows]);

  const activeRows = useMemo(
    () => slaRows.filter((row) => row.state !== "Met"),
    [slaRows],
  );

  const avgRemaining = useMemo(() => {
    if (activeRows.length === 0) return 0;
    const total = activeRows.reduce((sum, row) => sum + (row.dueInSeconds - elapsed), 0);
    return total / activeRows.length;
  }, [activeRows, elapsed]);

  const filtered = useMemo(
    () => (tab === "All" ? slaRows : slaRows.filter((row) => row.state === tab)),
    [tab, slaRows],
  );

  return (
    <ConsoleLayout>
      <PageHeader
        title="SLA Monitor"
        subtitle={
          scope === ALL_PROJECTS
            ? "Live service-level tracking · remaining time updates every second"
            : `Live service-level tracking · filtered to ${scope}`
        }
        actions={
          <span className="inline-flex items-center gap-2 rounded-md border border-background-300 bg-background-50 px-3 py-2 text-xs text-foreground-600">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
            Live
          </span>
        }
      />

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="SLA Met" value={String(counts.Met)} delta="Closed within target window" tone="accent" icon="ri-checkbox-circle-line" />
        <StatCard label="On Track" value={String(counts["On Track"])} delta="Comfortably within SLA" tone="primary" icon="ri-roadster-line" />
        <StatCard label="At Risk" value={String(counts["At Risk"])} delta="Over 75% of window consumed" tone="warning" icon="ri-timer-flash-line" />
        <StatCard label="Breached" value={String(counts.Breached)} delta="Past deadline · escalate now" tone="danger" icon="ri-alarm-warning-line" />
      </div>

      <div className="mt-4">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-[15px] font-semibold text-foreground-950">Live SLA Clock</h3>
              <p className="mt-0.5 text-xs text-foreground-500">
                Aggregate health across all active service-level commitments
              </p>
            </div>
            <span className="font-mono text-xs text-foreground-500">
              avg remaining{" "}
              <span className={`font-semibold ${avgRemaining < 0 ? "text-[oklch(var(--status-danger))]" : "text-foreground-900"}`}>
                {avgRemaining < 0 ? `−${formatDuration(avgRemaining)}` : formatDuration(avgRemaining)}
              </span>
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {[
              { label: "On Track", tone: "success" as const, key: "On Track" },
              { label: "At Risk", tone: "warning" as const, key: "At Risk" },
              { label: "Breached", tone: "danger" as const, key: "Breached" },
            ].map((item) => {
              const value = counts[item.key as keyof typeof counts];
              const percent = Math.round((value / counts.All) * 100);
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground-700">{item.label}</span>
                    <span className="text-sm font-label font-semibold text-foreground-900">
                      {value} <span className="text-foreground-400">({percent}%)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-background-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.tone === "success" ? "bg-accent-500" : item.tone === "warning" ? "bg-[oklch(var(--status-warning))]" : "bg-[oklch(var(--status-danger))]"
                      }`}
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      <div className="mt-4">
        <Tabs
          value={tab}
          onChange={setTab}
          items={[
            { key: "All", label: "All Tickets", count: counts.All },
            { key: "On Track", label: "On Track", count: counts["On Track"] },
            { key: "At Risk", label: "At Risk", count: counts["At Risk"] },
            { key: "Breached", label: "Breached", count: counts.Breached },
            { key: "Met", label: "Met", count: counts.Met },
          ]}
        />
      </div>

      <Card className="mt-4" padded={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="ri-timer-line" title="No tickets in this SLA state" description="Every ticket in this view is currently healthy." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-background-200 bg-background-50">
                  <th className={HEAD}>Ticket</th>
                  <th className={HEAD}>Project</th>
                  <th className={HEAD}>Priority</th>
                  <th className={HEAD}>SLA State</th>
                  <th className={HEAD}>Remaining Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-background-100 last:border-0 hover:bg-background-50 transition-colors">
                    <td className="px-4 py-3 max-w-[280px]">
                      <Link
                        to={`/console/tickets/${row.id}`}
                        className="font-mono text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline cursor-pointer"
                      >
                        {row.id}
                      </Link>
                      <Link
                        to={`/console/tickets/${row.id}`}
                        className="mt-0.5 block truncate text-sm font-medium text-foreground-900 hover:text-primary-700 transition-colors cursor-pointer"
                      >
                        {row.title}
                      </Link>
                      <span className="text-[11px] text-foreground-500">{row.organization}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-600">{row.project}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={row.priority} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge label={row.state} tone={STATE_TONE[row.state] ?? "neutral"} />
                    </td>
                    <td className="px-4 py-3">
                      <CountdownCell row={row} elapsed={elapsed} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </ConsoleLayout>
  );
}