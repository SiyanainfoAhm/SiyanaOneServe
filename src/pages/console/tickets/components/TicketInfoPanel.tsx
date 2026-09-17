/**
 * Read-only ticket metadata on the workbench (org, project, SLA, requester).
 */
import type { ReactNode } from "react";
import Avatar from "@/components/base/Avatar";
import { TicketStatusBadge, PriorityBadge, SlaBadge } from "@/components/base/StatusBadge";

interface Approver {
  name: string;
  role: string;
  at: string;
}

interface TicketInfoPanelProps {
  project: string;
  organization: string;
  category: string;
  status: string;
  priority: string;
  created: string;
  sla: string;
  slaDue: string;
  team: string;
  assignee: string;
  assigneeInitials: string;
  assigneeRole: string;
  requester: { name: string; role: string; email?: string; organization?: string };
  approver?: Approver;
}

// Statuses at which no one has been assigned yet. Until a request moves past
// one of these, the "Assigned To" card always reads "Not Assigned" — even if
// stale data still carries an assignee name.
const UNASSIGNED_STATUSES = ["Draft", "Need Approval", "New", "Rejected"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
        {label}
      </span>
      <span className="text-sm text-foreground-900">{children}</span>
    </div>
  );
}

export default function TicketInfoPanel({
  project,
  organization,
  category,
  status,
  priority,
  created,
  sla,
  slaDue,
  team,
  assignee,
  assigneeInitials,
  assigneeRole,
  requester,
  approver,
}: TicketInfoPanelProps) {
  const isAssigned =
    assignee !== "Unassigned" && !UNASSIGNED_STATUSES.includes(status) && Boolean(assignee.trim());

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-background-200 bg-background-50 p-4">
        <h3 className="font-heading text-sm font-semibold text-foreground-950">Request Information</h3>
        <div className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-3.5">
          <Field label="Project">{project}</Field>
          <Field label="Organization">{organization}</Field>
          <Field label="Category">{category}</Field>
          <Field label="Created">{created}</Field>
          <Field label="Status">
            <TicketStatusBadge status={status} />
          </Field>
          <Field label="Priority">
            <PriorityBadge priority={priority} />
          </Field>
        </div>
        <div className="mt-3.5 border-t border-background-200 pt-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
              SLA Status
            </span>
            <SlaBadge sla={sla} />
          </div>
          <p className="mt-1.5 text-xs text-foreground-600">
            Due <span className="font-medium text-foreground-900">{slaDue}</span>
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4">
        <h3 className="font-heading text-sm font-semibold text-foreground-950">Requester</h3>
        <div className="mt-3 flex items-center gap-3">
          <Avatar initials={requester.name.split(" ").map((p) => p[0]).join("").slice(0, 2)} tone="accent" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground-900">{requester.name}</p>
            <p className="truncate text-[11px] text-foreground-500">{requester.role}</p>
            {requester.email ? <p className="truncate text-[11px] text-foreground-400">{requester.email}</p> : null}
          </div>
        </div>
      </section>

      {approver ? (
        <section className="rounded-lg border border-background-200 bg-background-50 p-4">
          <h3 className="font-heading text-sm font-semibold text-foreground-950">Approved By</h3>
          <div className="mt-3 flex items-center gap-3">
            <Avatar initials={approver.name.split(" ").map((p) => p[0]).join("").slice(0, 2)} tone="primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground-900">{approver.name}</p>
              <p className="truncate text-[11px] text-foreground-500">{approver.role}</p>
            </div>
          </div>
          {approver.at ? (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-background-100 px-3 py-2">
              <i className="ri-checkbox-circle-line text-foreground-500 text-[15px] leading-none"></i>
              <span className="text-xs text-foreground-700">Approved on {approver.at}</span>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-lg border border-background-200 bg-background-50 p-4">
        <h3 className="font-heading text-sm font-semibold text-foreground-950">Assigned To</h3>
        <div className="mt-3 flex items-center gap-3">
          {isAssigned ? (
            <Avatar initials={assigneeInitials} tone="primary" />
          ) : (
            <span className="w-9 h-9 rounded-full border border-dashed border-background-300 flex items-center justify-center text-foreground-400">
              <i className="ri-user-line text-[16px] leading-none"></i>
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground-900">
              {isAssigned ? assignee : "Not Assigned"}
            </p>
            <p className="truncate text-[11px] text-foreground-500">
              {isAssigned ? assigneeRole : "Awaiting assignment"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-md bg-background-100 px-3 py-2">
          <i className="ri-group-line text-foreground-500 text-[15px] leading-none"></i>
          <span className="text-xs text-foreground-700">{isAssigned ? team : "Team not assigned yet"}</span>
        </div>
      </section>
    </div>
  );
}