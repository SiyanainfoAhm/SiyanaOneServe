/**
 * Operations home: KPIs, trends, recent tickets. Scoped by top-bar project.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import TicketTrendChart from "@/pages/console/components/TicketTrendChart";
import TicketDistribution from "@/pages/console/components/TicketDistribution";
import TeamWorkload from "@/pages/console/components/TeamWorkload";
import RecentTicketsTable from "@/pages/console/components/RecentTicketsTable";
import StatusStatRow from "@/components/feature/StatusStatRow";
import Card, { CardHeader } from "@/components/base/Card";
import CustomDateRangeFields from "@/components/feature/CustomDateRangeFields";
import { useConsoleTickets } from "@/hooks/useConsoleTicketStore";
import { countByStatus } from "@/utils/ticketStats";
import { useProjectScope, filterByProject } from "@/hooks/useProjectScope";
import { matchesDateRange, createDateRange, CUSTOM_RANGE, type DateRangeValue, todayIso } from "@/utils/date";

const TODAY = todayIso();
const DASHBOARD_DATE_OPTIONS = [
  "Last 14 days",
  "Last 30 days",
  "This quarter",
  "Last 6 months",
  "This year",
  "Custom Range",
];

export default function ConsoleDashboard() {
  const allTickets = useConsoleTickets();
  const scope = useProjectScope();
  const [dateRange, setDateRange] = useState<DateRangeValue>(createDateRange("Last 14 days"));

  const scopedTickets = useMemo(() => filterByProject(allTickets, scope), [allTickets, scope]);
  const tickets = useMemo(
    () => scopedTickets.filter((ticket) => matchesDateRange(ticket.created, dateRange, TODAY)),
    [scopedTickets, dateRange],
  );
  const counts = countByStatus(tickets);

  return (
    <ConsoleLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-heading text-xl font-bold text-foreground-950">Global Dashboard</h1>
          <p className="mt-1 text-sm text-foreground-500">
            Operational control center · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={dateRange.preset}
              onChange={(event) => setDateRange({ ...dateRange, preset: event.target.value })}
              className="h-10 rounded-md border border-background-300 bg-background-50 pl-3 pr-8 text-sm text-foreground-800 outline-none cursor-pointer focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              {DASHBOARD_DATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Link
              to="/console/create"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary-600 bg-primary-600 px-4 text-sm font-label font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="w-4 h-4 flex items-center justify-center">
                <i className="ri-add-line text-[15px] leading-none"></i>
              </span>
              New Ticket
            </Link>
          </div>
          {dateRange.preset === CUSTOM_RANGE ? (
            <CustomDateRangeFields
              className="rounded-lg border border-background-200 bg-background-100 px-3 py-2.5"
              from={dateRange.from}
              to={dateRange.to}
              onFrom={(value) => setDateRange({ ...dateRange, from: value })}
              onTo={(value) => setDateRange({ ...dateRange, to: value })}
            />
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <StatusStatRow counts={counts} />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Ticket Trend"
            subtitle="Created vs Resolved · last 14 days"
            action={
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs text-foreground-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span>
                  Created
                </span>
                <span className="flex items-center gap-1.5 text-xs text-foreground-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-500"></span>
                  Resolved
                </span>
              </div>
            }
          />
          <div className="mt-3">
            <TicketTrendChart />
          </div>
        </Card>

        <Card>
          <CardHeader title="Priority Distribution" subtitle="Active tickets by priority" />
          <div className="mt-4">
            <TicketDistribution />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2" padded={false}>
          <div className="px-5 pt-5">
            <CardHeader
              title="Recent Tickets"
              subtitle="Latest service requests across all government projects"
              action={
                <Link
                  to="/console/queue"
                  className="text-xs font-medium text-primary-700 hover:text-primary-800 whitespace-nowrap cursor-pointer"
                >
                  View all tickets
                </Link>
              }
            />
          </div>
          <div className="mt-4">
            <RecentTicketsTable tickets={tickets} />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Team Workload"
            subtitle="Open tickets per assignee"
            action={
              <Link
                to="/console/users"
                className="text-xs font-medium text-primary-700 hover:text-primary-800 whitespace-nowrap cursor-pointer"
              >
                View all
              </Link>
            }
          />
          <div className="mt-5">
            <TeamWorkload />
          </div>
        </Card>
      </div>
    </ConsoleLayout>
  );
}
