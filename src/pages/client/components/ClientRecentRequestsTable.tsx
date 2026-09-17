/**
 * Dashboard table of recent requests. Links to /client/requests/:id.
 */
import { Link } from "react-router-dom";
import { TicketStatusBadge, PriorityBadge } from "@/components/base/StatusBadge";
import { formatDisplayDate } from "@/utils/date";
import { useClientRequests } from "@/hooks/useClientRequestStore";
import { useProjectScope, filterByProject } from "@/hooks/useProjectScope";

const HEAD = "px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500";

export default function ClientRecentRequestsTable() {
  const allRows = useClientRequests();
  const scope = useProjectScope();
  const rows = filterByProject(allRows, scope).slice(0, 6);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr className="border-b border-background-200">
            <th className={HEAD}>Request ID</th>
            <th className={HEAD}>Request</th>
            <th className={HEAD}>Status</th>
            <th className={HEAD}>Priority</th>
            <th className={HEAD}>Date</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((ticket) => (
            <tr
              key={ticket.id}
              className="border-b border-background-100 last:border-0 hover:bg-background-50 transition-colors"
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <Link
                  to={`/client/requests/${ticket.id}`}
                  className="font-mono text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline cursor-pointer"
                >
                  {ticket.id}
                </Link>
              </td>
              <td className="px-4 py-3 max-w-[320px]">
                <Link
                  to={`/client/requests/${ticket.id}`}
                  className="block truncate text-sm font-medium text-foreground-900 hover:text-primary-700 transition-colors cursor-pointer"
                >
                  {ticket.title}
                </Link>
                <span className="block truncate text-[11px] text-foreground-500">{ticket.project}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <TicketStatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-500">
                {formatDisplayDate(ticket.created)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <Link
                  to={`/client/requests/${ticket.id}`}
                  className="inline-flex w-8 h-8 items-center justify-center rounded-md border border-background-200 text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
                  aria-label={`Open ${ticket.id}`}
                >
                  <i className="ri-arrow-right-line text-[15px] leading-none"></i>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
