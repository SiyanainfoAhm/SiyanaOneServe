/**
 * Read-only ticket metadata on the workbench (org, project, requester, assignment).
 */
import type { ReactNode } from "react";
import Avatar from "@/components/base/Avatar";
import { TicketStatusBadge, PriorityBadge } from "@/components/base/StatusBadge";

interface TicketInfoPanelProps {
  project: string;
  organization: string;
  status: string;
  priority: string;
  created: string;
  team: string;
  assignee: string;
  assigneeInitials: string;
  assigneeRole: string;
  requester: { name: string; role: string; email?: string; organization?: string };
}

const UNASSIGNED_STATUSES = ["New"];

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
  status,
  priority,
  created,
  team,
  assignee,
  assigneeInitials,
  assigneeRole,
  requester,
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
          <Field label="Created">{created}</Field>
          <Field label="Status">
            <TicketStatusBadge status={status} />
          </Field>
          <Field label="Priority">
            <PriorityBadge priority={priority} />
          </Field>
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
