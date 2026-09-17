/**
 * Government home: counts, SLA widget, recent requests for this org / project scope.
 */
import { useMemo } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "@/pages/client/components/ClientLayout";
import ClientSlaWidget from "@/pages/client/components/ClientSlaWidget";
import ClientRequestTrendChart from "@/pages/client/components/ClientRequestTrendChart";
import ClientCategoryBreakdown from "@/pages/client/components/ClientCategoryBreakdown";
import ClientRecentRequestsTable from "@/pages/client/components/ClientRecentRequestsTable";
import StatusStatRow from "@/components/feature/StatusStatRow";
import Card, { CardHeader } from "@/components/base/Card";
import { clientUser } from "@/mocks/client";
import { useClientRequests } from "@/hooks/useClientRequestStore";
import { countByStatus } from "@/utils/ticketStats";
import { useProjectScope, filterByProject } from "@/hooks/useProjectScope";
import { useAuth } from "@/context/AuthContext";

export default function ClientDashboard() {
  const { user } = useAuth();
  const allRequests = useClientRequests();
  const scope = useProjectScope();
  const requests = useMemo(() => filterByProject(allRequests, scope), [allRequests, scope]);
  const counts = countByStatus(requests);
  const pending = requests.filter((item) => item.status === "Need Approval");

  return (
    <ClientLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold text-foreground-950">
            Welcome back, {user?.full_name ?? clientUser.name}
          </h1>
          <p className="mt-1 text-sm text-foreground-500">
            {user?.organization ?? clientUser.organization} ·{" "}
            <span className="text-foreground-700">{user?.organization_full ?? clientUser.organizationFull}</span> ·{" "}
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/client/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary-600 bg-primary-600 px-4 text-sm font-label font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line text-[15px] leading-none"></i>
            </span>
            Create Request
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <StatusStatRow counts={counts} />
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Service Performance"
            subtitle="How your department's requests are tracking against SLA"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-[11px] font-label font-medium text-accent-700">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                Live
              </span>
            }
          />
          <div className="mt-5">
            <ClientSlaWidget />
          </div>
        </Card>

        <Card padded={false}>
          <div className="px-5 pt-5">
            <CardHeader
              title="Draft Approval Request"
              subtitle="Drafts awaiting your approval"
              action={
                <Link
                  to="/client/draft-approvals"
                  className="text-xs font-medium text-primary-700 hover:text-primary-800 whitespace-nowrap cursor-pointer"
                >
                  View all
                </Link>
              }
            />
          </div>
          <ul className="mt-3 px-5 pb-5 flex flex-col gap-3">
            {pending.length === 0 ? (
              <li className="rounded-lg border border-dashed border-background-300 px-4 py-6 text-center">
                <p className="text-xs text-foreground-500">No drafts waiting on you right now.</p>
              </li>
            ) : (
              pending.slice(0, 4).map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                      item.priority === "Critical" || item.priority === "High"
                        ? "bg-[oklch(var(--status-warning)/0.14)] text-[oklch(var(--status-warning))]"
                        : "bg-secondary-100 text-secondary-800"
                    }`}
                  >
                    <i className="ri-draft-line text-[14px] leading-none"></i>
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/client/draft-approvals"
                      className="block truncate text-sm font-medium text-foreground-900 hover:text-primary-700 transition-colors cursor-pointer"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-0.5 text-[11px] text-foreground-500">
                      {item.requestType} · raised {item.updated}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Requests over time"
            subtitle="Monthly volume of raised versus resolved requests for your department"
            action={
              <span className="inline-flex items-center gap-1.5 rounded-full border border-background-200 bg-background-100 px-2.5 py-1 text-[11px] font-label font-medium text-foreground-600">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                Last 9 months
              </span>
            }
          />
          <div className="mt-5">
            <ClientRequestTrendChart />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Category breakdown"
            subtitle="Where your requests come from"
          />
          <div className="mt-5">
            <ClientCategoryBreakdown />
          </div>
        </Card>
      </div>

      <div className="mt-4">
        <Card padded={false}>
          <div className="px-5 pt-5">
            <CardHeader
              title="Recent Requests"
              subtitle="Your latest service requests across all projects"
              action={
                <Link
                  to="/client/requests"
                  className="text-xs font-medium text-primary-700 hover:text-primary-800 whitespace-nowrap cursor-pointer"
                >
                  View all requests
                </Link>
              }
            />
          </div>
          <div className="mt-4">
            <ClientRecentRequestsTable />
          </div>
        </Card>
      </div>
    </ClientLayout>
  );
}