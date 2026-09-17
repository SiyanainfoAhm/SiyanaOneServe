/**
 * Dashboard recent-ticket table. Links to the workbench.
 */
import { Link } from "react-router-dom";
import { useConsoleTickets } from "@/hooks/useConsoleTicketStore";
import type { QueueTicket } from "@/mocks/consoleQueue";
import { useProjectScope, filterByProject } from "@/hooks/useProjectScope";
import { TicketStatusBadge, PriorityBadge } from "@/components/base/StatusBadge";

interface RecentTicketsTableProps {
  tickets?: QueueTicket[];
}

export default function RecentTicketsTable({ tickets }: RecentTicketsTableProps = {}) {
  const storeTickets = useConsoleTickets();
  const scope = useProjectScope();
  const source = tickets ?? filterByProject(storeTickets, scope);
  const rows = source.slice(0, 6);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr className="border-b border-background-200">
            <th className="px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
              Ticket ID
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
              Request
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
              Status
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
              Priority
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
              Date
            </th>
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
                  to={`/console/tickets/${ticket.id}`}
                  className="font-mono text-xs font-medium text-primary-700 hover:text-primary-800 hover:underline cursor-pointer"
                >
                  {ticket.id}
                </Link>
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/console/tickets/${ticket.id}`}
                  className="block text-sm font-medium text-foreground-900 hover:text-primary-700 transition-colors cursor-pointer"
                >
                  {ticket.title}
                </Link>
                <span className="text-[11px] text-foreground-500">
                  {ticket.organization} · {ticket.project}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <TicketStatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-500">
                {ticket.created}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
