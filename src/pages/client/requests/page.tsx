/**
 * My Requests list. Honors ?q= from GlobalSearch and the top-bar project scope.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ClientLayout from "@/pages/client/components/ClientLayout";
import ClientPageHeader from "@/pages/client/components/ClientPageHeader";
import Card from "@/components/base/Card";
import Tabs from "@/components/base/Tabs";
import Select from "@/components/base/Select";
import CustomDateRangeFields from "@/components/feature/CustomDateRangeFields";
import EmptyState from "@/components/base/EmptyState";
import { TicketStatusBadge, PriorityBadge } from "@/components/base/StatusBadge";
import { useClientRequests } from "@/hooks/useClientRequestStore";
import { useProjectScope, setScopedProject } from "@/hooks/useProjectScope";
import { createDateRange, matchesDateRange, CUSTOM_RANGE, ALL_TIME, type DateRangeValue, todayIso } from "@/utils/date";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";

const TODAY = todayIso();

const DATE_OPTIONS = ["All Time", "Today", "Last 7 Days", "Last 30 Days", "Custom Range"];

const HEAD = "px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500";

const STATUS_TABS = ["All", "New", "Assigned", "In Progress", "Resolved", "Rejected"];

export default function ClientMyRequestsPage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get("q") ?? "";
  const requests = useClientRequests();
  const project = useProjectScope();
  const { user } = useAuth();
  const { projects } = useAppData();
  const projectOptions = ["All Projects", ...projects.map((item) => item.name)];
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState(queryParam);
  const [dateRange, setDateRange] = useState<DateRangeValue>(createDateRange(ALL_TIME));

  useEffect(() => {
    if (queryParam) setSearch(queryParam);
  }, [queryParam]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: requests.length };
    STATUS_TABS.forEach((status) => {
      if (status === "All") return;
      map[status] = requests.filter((request) => request.status === status).length;
    });
    return map;
  }, [requests]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (tab !== "All" && request.status !== tab) return false;
      if (project !== "All Projects" && request.project !== project) return false;
      if (!matchesDateRange(request.created, dateRange, TODAY)) return false;
      if (term) {
        const haystack = `${request.id} ${request.title} ${request.project}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [requests, tab, project, dateRange, search]);

  return (
    <ClientLayout>
      <ClientPageHeader
        title="My Requests"
        subtitle={`All ${requests.length} service requests raised by ${user?.organization ?? "your department"} — track, filter and review each one.`}
        actions={
          <Link
            to="/client/create"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary-600 bg-primary-600 px-4 text-sm font-label font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-[15px] leading-none"></i>
              New Request
            </Link>
        }
      />

      <div className="mt-5">
        <Tabs
          value={tab}
          onChange={setTab}
          items={STATUS_TABS.map((status) => ({ key: status, label: status, count: counts[status] ?? 0 }))}
        />
      </div>

      <Card className="mt-4" padded={false}>
        <div className="flex flex-col gap-3 border-b border-background-200 px-5 py-4 lg:flex-row lg:items-center">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
              <i className="ri-search-line text-foreground-400 text-[16px] leading-none"></i>
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by request ID, title or type…"
              className="h-10 w-full rounded-md border border-background-300 bg-background-50 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <Select
            options={projectOptions}
            value={project}
            onChange={(event) => setScopedProject(event.target.value)}
            icon="ri-folders-line"
            containerClassName="lg:w-[240px]"
          />
          <Select
            options={DATE_OPTIONS}
            value={dateRange.preset}
            onChange={(event) => setDateRange({ ...dateRange, preset: event.target.value })}
            icon="ri-calendar-line"
            containerClassName="lg:w-[180px]"
          />
        </div>

        {dateRange.preset === CUSTOM_RANGE ? (
          <div className="border-b border-background-200 bg-background-100 px-5 py-3">
            <CustomDateRangeFields
              from={dateRange.from}
              to={dateRange.to}
              onFrom={(value) => setDateRange({ ...dateRange, from: value })}
              onTo={(value) => setDateRange({ ...dateRange, to: value })}
            />
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState
            icon="ri-search-eye-line"
            title="No requests match your filters"
            description="Try a different status tab or clear the search to see all of your requests."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-background-200 bg-background-50">
                  <th className={HEAD}>Request ID</th>
                  <th className={HEAD}>Request</th>
                  <th className={HEAD}>Status</th>
                  <th className={HEAD}>Priority</th>
                  <th className={HEAD}>Last Updated</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((request) => (
                  <tr key={request.id} className="border-b border-background-100 last:border-0 hover:bg-background-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        to={`/client/requests/${request.id}`}
                        className="font-mono text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline cursor-pointer"
                      >
                        {request.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 max-w-[340px]">
                      <Link
                        to={`/client/requests/${request.id}`}
                        className="block truncate text-sm font-medium text-foreground-900 hover:text-primary-700 transition-colors cursor-pointer"
                      >
                        {request.title}
                      </Link>
                      <span className="block truncate text-[11px] text-foreground-500">{request.project}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <TicketStatusBadge status={request.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <PriorityBadge priority={request.priority} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-500">{request.updated}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        to={`/client/requests/${request.id}`}
                        className="inline-flex w-8 h-8 items-center justify-center rounded-md border border-background-200 text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
                        aria-label={`Open ${request.id}`}
                      >
                        <i className="ri-arrow-right-line text-[15px] leading-none"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </ClientLayout>
  );
}