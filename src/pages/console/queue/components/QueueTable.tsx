/**
 * Sortable ticket table. Row click opens /console/tickets/:id.
 * Status is display-only here; workflow changes happen on the workbench.
 */
import { Link, useLocation, useNavigate } from "react-router-dom";
import Avatar from "@/components/base/Avatar";
import { PriorityBadge, TicketStatusBadge } from "@/components/base/StatusBadge";
import EmptyState from "@/components/base/EmptyState";
import { formatDisplayDate } from "@/utils/date";
import type { QueueTicket } from "@/mocks/consoleQueue";

export type SortKey = "id" | "title" | "priority" | "status" | "assignee" | "requester" | "created";

interface QueueTableProps {
  rows: QueueTicket[];
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  allSelected: boolean;
  sort: { key: SortKey; dir: "asc" | "desc" };
  onSort: (key: SortKey) => void;
}

const HEAD = "px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500";

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500 hover:text-foreground-800 transition-colors cursor-pointer"
    >
      {label}
      <span className="w-3.5 h-3.5 flex items-center justify-center">
        <i
          className={`${
            active ? (dir === "asc" ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line") : "ri-arrow-up-down-line"
          } text-[13px] leading-none ${active ? "text-primary-600" : "text-foreground-400"}`}
        ></i>
      </span>
    </button>
  );
}

export default function QueueTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
  allSelected,
  sort,
  onSort,
}: QueueTableProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const ticketLocation = `${location.pathname}${location.search}`;

  if (rows.length === 0) {
    return (
      <EmptyState
        icon="ri-search-eye-line"
        title="No tickets match these filters"
        description="Try clearing the filters or widening the date range to see more service requests."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1120px] border-collapse">
        <thead>
          <tr className="border-b border-background-200 bg-background-50">
            <th className="w-12 px-4 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                aria-label="Select all tickets"
                className="w-4 h-4 rounded border-background-300 accent-primary-600 cursor-pointer align-middle"
              />
            </th>
            <th className={HEAD}>
              <SortButton label="Ticket ID" active={sort.key === "id"} dir={sort.dir} onClick={() => onSort("id")} />
            </th>
            <th className={HEAD}>
              <SortButton label="Request" active={sort.key === "title"} dir={sort.dir} onClick={() => onSort("title")} />
            </th>
            <th className={HEAD}>
              <SortButton label="Priority" active={sort.key === "priority"} dir={sort.dir} onClick={() => onSort("priority")} />
            </th>
            <th className={HEAD}>
              <SortButton label="Status" active={sort.key === "status"} dir={sort.dir} onClick={() => onSort("status")} />
            </th>
            <th className={HEAD}>
              <SortButton label="Assigned User" active={sort.key === "assignee"} dir={sort.dir} onClick={() => onSort("assignee")} />
            </th>
            <th className={HEAD}>
              <SortButton label="Requester" active={sort.key === "requester"} dir={sort.dir} onClick={() => onSort("requester")} />
            </th>
            <th className={HEAD}>
              <SortButton label="Created" active={sort.key === "created"} dir={sort.dir} onClick={() => onSort("created")} />
            </th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((ticket) => {
            const isSelected = selected.includes(ticket.id);
            const ticketPath = `/console/tickets/${encodeURIComponent(ticket.id)}`;
            return (
              <tr
                key={ticket.id}
                onClick={() => navigate(ticketPath, { state: { from: ticketLocation } })}
                className={`cursor-pointer border-b border-background-100 last:border-0 transition-colors ${
                  isSelected ? "bg-primary-50/60" : "hover:bg-background-50"
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(ticket.id)}
                    onClick={(event) => event.stopPropagation()}
                    aria-label={`Select ${ticket.id}`}
                    className="w-4 h-4 rounded border-background-300 accent-primary-600 cursor-pointer align-middle"
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(ticketPath, { state: { from: ticketLocation } });
                    }}
                    className="font-mono text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline cursor-pointer"
                  >
                    {ticket.id}
                  </button>
                </td>
                <td className="px-4 py-3 max-w-[320px]">
                  <Link
                    to={ticketPath}
                    state={{ from: ticketLocation }}
                    onClick={(event) => event.stopPropagation()}
                    className="block text-sm font-medium text-foreground-900 hover:text-primary-700 transition-colors cursor-pointer truncate"
                  >
                    {ticket.title}
                  </Link>
                  <span className="block text-[11px] text-foreground-500 truncate">
                    {ticket.organization} · {ticket.project}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {ticket.assignee === "Unassigned" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-foreground-400">
                      <span className="w-6 h-6 rounded-full border border-dashed border-background-300 flex items-center justify-center">
                        <i className="ri-user-line text-[12px] leading-none"></i>
                      </span>
                      Unassigned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Avatar
                        initials={ticket.assignee.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                        size="sm"
                        tone="secondary"
                      />
                      <span className="text-xs text-foreground-700">{ticket.assignee}</span>
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-700">
                  {ticket.requester || "—"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-500">
                  {formatDisplayDate(ticket.created)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <Link
                    to={ticketPath}
                    state={{ from: ticketLocation }}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex w-8 h-8 items-center justify-center rounded-md border border-background-200 text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
                    aria-label={`Open ${ticket.id}`}
                  >
                    <i className="ri-arrow-right-line text-[15px] leading-none"></i>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
