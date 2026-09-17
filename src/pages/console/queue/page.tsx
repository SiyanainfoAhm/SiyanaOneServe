/**
 * Operations ticket queue.
 *
 * Filters live tickets from AppData. Status tabs follow the lifecycle order.
 * Bulk Assign / Change Status buttons are visible but not wired to RPCs yet.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import PageHeader from "@/pages/console/components/PageHeader";
import Tabs from "@/components/base/Tabs";
import Button from "@/components/base/Button";
import Card from "@/components/base/Card";
import QueueFilters from "@/pages/console/queue/components/QueueFilters";
import QueueTable, { type SortKey } from "@/pages/console/queue/components/QueueTable";
import { useConsoleTickets, updateTicketStatus } from "@/hooks/useConsoleTicketStore";
import { useProjects } from "@/hooks/useProjectStore";
import { useAppData } from "@/context/AppDataContext";
import { useProjectScope, setScopedProject, ALL_PROJECTS } from "@/hooks/useProjectScope";
import { matchesDateRange, createDateRange, ALL_TIME, type DateRangeValue, todayIso } from "@/utils/date";
import { useTicker } from "@/hooks/useTicker";

const TODAY = todayIso();
const PAGE_SIZE = 10;

const STATUS_TABS = ["All", "Draft", "Need Approval", "New", "Assigned", "In Progress", "Resolved", "Closed", "Rejected"];

const PRIORITY_ORDER: Record<string, number> = { Critical: 0, High: 1, Normal: 2, Low: 3 };

export default function TicketQueuePage() {
  const elapsed = useTicker();
  const [searchParams] = useSearchParams();
  const projectParam = searchParams.get("project") ?? "";
  const queryParam = searchParams.get("q") ?? "";

  const projects = useProjects();
  const project = useProjectScope();
  const projectOptions = useMemo(
    () => [ALL_PROJECTS, ...projects.map((item) => item.name)],
    [projects],
  );

  const [statusTab, setStatusTab] = useState("All");
  const [search, setSearch] = useState(queryParam);
  const [priority, setPriority] = useState("All Priorities");
  const [assignee, setAssignee] = useState("All Assignees");
  const [dateRange, setDateRange] = useState<DateRangeValue>(createDateRange(ALL_TIME));
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "created", dir: "desc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (projectParam && projectOptions.includes(projectParam)) {
      setScopedProject(projectParam);
    }
  }, [projectParam, projectOptions]);

  useEffect(() => {
    if (queryParam) setSearch(queryParam);
  }, [queryParam]);

  const rows = useConsoleTickets();
  const { refresh, replaceTicket } = useAppData();

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  }

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: rows.length };
    STATUS_TABS.forEach((status) => {
      if (status === "All") return;
      map[status] = rows.filter((ticket) => ticket.status === status).length;
    });
    return map;
  }, [rows]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((ticket) => {
      if (statusTab !== "All" && ticket.status !== statusTab) return false;
      if (project !== "All Projects" && ticket.project !== project) return false;
      if (priority !== "All Priorities" && ticket.priority !== priority) return false;
      if (assignee !== "All Assignees" && ticket.assignee !== assignee) return false;
      if (!matchesDateRange(ticket.created, dateRange, TODAY)) return false;
      if (term) {
        const haystack = `${ticket.id} ${ticket.title} ${ticket.project} ${ticket.organization} ${ticket.assignee} ${ticket.category}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [rows, statusTab, search, project, priority, assignee, dateRange]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      let result = 0;
      if (sort.key === "priority") {
        result = (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
      } else {
        result = a.created.localeCompare(b.created);
      }
      return sort.dir === "asc" ? result : -result;
    });
    return list;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const hasActiveFilters =
    search.trim() !== "" ||
    project !== "All Projects" ||
    priority !== "All Priorities" ||
    assignee !== "All Assignees" ||
    dateRange.preset !== ALL_TIME ||
    statusTab !== "All";

  const allSelected = pageRows.length > 0 && pageRows.every((ticket) => selected.includes(ticket.id));

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  function clearFilters() {
    setSearch("");
    setScopedProject(ALL_PROJECTS);
    setPriority("All Priorities");
    setAssignee("All Assignees");
    setDateRange(createDateRange(ALL_TIME));
    setStatusTab("All");
    setPage(1);
  }

  function toggleRow(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => prev.filter((id) => !pageRows.some((ticket) => ticket.id === id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...pageRows.map((ticket) => ticket.id)])));
    }
  }

  function handleSort(key: SortKey) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      const ticket = await updateTicketStatus(id, status);
      replaceTicket(ticket);
      showToast(`${id} moved to ${status}`);
      await refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to update status.");
    }
  }

  return (
    <ConsoleLayout>
      <PageHeader
        title="Ticket Queue"
        subtitle={`Triage all ${rows.length} service requests across every government project`}
        actions={
          <Link
            to="/console/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary-600 bg-primary-600 px-4 text-sm font-label font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line text-[15px] leading-none"></i>
            New Ticket
          </Link>
        }
      />

      {project !== "All Projects" ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2.5">
          <i className="ri-filter-3-line text-primary-700 text-[15px] leading-none"></i>
          <span className="text-xs font-label font-medium text-primary-800">
            Showing tickets for <span className="font-semibold">{project}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setScopedProject(ALL_PROJECTS);
              setPage(1);
            }}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-800 cursor-pointer"
          >
            <i className="ri-close-line text-[14px] leading-none"></i>
            Clear project filter
          </button>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Tabs
          value={statusTab}
          onChange={(key) => {
            setStatusTab(key);
            setPage(1);
          }}
          items={STATUS_TABS.map((status) => ({
            key: status,
            label: status,
            count: counts[status] ?? 0,
          }))}
        />
      </div>

      <Card className="mt-4" padded={false}>
        <QueueFilters
          search={search}
          onSearch={updateFilter(setSearch)}
          project={project}
          projectOptions={projectOptions}
          onProject={updateFilter(setScopedProject)}
          priority={priority}
          onPriority={updateFilter(setPriority)}
          assignee={assignee}
          onAssignee={updateFilter(setAssignee)}
          dateRange={dateRange}
          onDateRange={(value) => {
            setDateRange(value);
            setPage(1);
          }}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {selected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3 border-b border-background-200 bg-primary-50 px-5 py-2.5">
            <span className="text-xs font-label font-semibold text-primary-800">
              {selected.length} ticket{selected.length > 1 ? "s" : ""} selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" icon="ri-user-add-line">
                Assign
              </Button>
              <Button variant="outline" size="sm" icon="ri-exchange-line">
                Change Status
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="ml-auto text-xs font-medium text-primary-700 hover:text-primary-800 cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        ) : null}

        <QueueTable
          rows={pageRows}
          selected={selected}
          onToggle={toggleRow}
          onToggleAll={toggleAll}
          allSelected={allSelected}
          sort={sort}
          onSort={handleSort}
          onStatusChange={handleStatusChange}
          elapsed={elapsed}
        />

        <div className="flex flex-col items-center justify-between gap-3 border-t border-background-200 px-5 py-3.5 sm:flex-row">
          <p className="text-xs text-foreground-500">
            Showing{" "}
            <span className="font-semibold text-foreground-800">
              {sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, sorted.length)}
            </span>{" "}
            of <span className="font-semibold text-foreground-800">{sorted.length}</span> tickets
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={safePage === 1}
              className="w-8 h-8 rounded-md border border-background-200 flex items-center justify-center text-foreground-600 hover:bg-background-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <i className="ri-arrow-left-s-line text-[16px] leading-none"></i>
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={`w-8 h-8 rounded-md text-xs font-label font-medium transition-colors cursor-pointer ${
                    pageNumber === safePage
                      ? "bg-primary-600 text-background-50"
                      : "border border-background-200 text-foreground-600 hover:bg-background-100"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safePage === totalPages}
              className="w-8 h-8 rounded-md border border-background-200 flex items-center justify-center text-foreground-600 hover:bg-background-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <i className="ri-arrow-right-s-line text-[16px] leading-none"></i>
            </button>
          </div>
        </div>
      </Card>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-background-200 bg-foreground-950 px-4 py-3 shadow-lg">
          <span className="w-4 h-4 flex items-center justify-center">
            <i className="ri-checkbox-circle-fill text-accent-400 text-[16px] leading-none"></i>
          </span>
          <span className="text-sm font-medium text-background-50">{toast}</span>
        </div>
      ) : null}
    </ConsoleLayout>
  );
}