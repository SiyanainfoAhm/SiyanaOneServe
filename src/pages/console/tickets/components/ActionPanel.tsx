/**
 * Workbench assignment and forward-only workflow.
 *
 * New → Assigned → In Progress → Resolved. Reject is terminal and needs a reason.
 * Priority is set by the department and cannot be changed here.
 * Team and assignee lists come from live staff, not mock data.
 */
import { useState } from "react";
import Select from "@/components/base/Select";
import Button from "@/components/base/Button";

interface ActionPanelProps {
  status: string;
  teamDraft: string;
  onTeamDraft: (value: string) => void;
  userDraft: string;
  onUserDraft: (value: string) => void;
  priority: string;
  onAssign: () => void;
  onStartWork: () => void;
  onResolve: () => void;
  onReject: (reason: string) => void;
  teams: string[];
  assignees: string[];
}

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 h-4 flex items-center justify-center">
        <i className={`${icon} text-foreground-500 text-[15px] leading-none`}></i>
      </span>
      <h3 className="font-heading text-sm font-semibold text-foreground-950">{label}</h3>
    </div>
  );
}

export default function ActionPanel({
  status,
  teamDraft,
  onTeamDraft,
  userDraft,
  onUserDraft,
  priority,
  onAssign,
  onStartWork,
  onResolve,
  onReject,
  teams,
  assignees,
}: ActionPanelProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const isResolved = status === "Resolved" || status === "Closed";
  const isRejected = status === "Rejected";
  const closed = isResolved || isRejected;
  const canStart = status === "Assigned";
  const canResolve = status === "In Progress";

  function confirmReject() {
    if (!reason.trim()) {
      setError("A rejection reason is mandatory.");
      return;
    }
    onReject(reason.trim());
    setRejectOpen(false);
    setReason("");
    setError("");
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-background-200 bg-background-50 p-4">
        <SectionTitle icon="ri-user-add-line" label="Assignment" />
        <div className="mt-3 flex flex-col gap-2.5">
          <Select
            options={teams}
            value={teamDraft}
            onChange={(e) => onTeamDraft(e.target.value)}
            label="Team"
            placeholder="Select team"
          />
          <Select
            options={assignees}
            value={userDraft}
            onChange={(e) => onUserDraft(e.target.value)}
            label="Assign User"
            placeholder={teamDraft ? "Select user" : "Choose a team first"}
            disabled={!teamDraft}
          />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-md border border-background-200 bg-background-100 px-3 py-2.5">
          <span className="text-xs text-foreground-600">Priority (set by department)</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-900">
            <i className="ri-lock-2-line text-foreground-500 text-[13px] leading-none"></i>
            {priority}
          </span>
        </div>
        <Button variant="accent" size="sm" fullWidth className="mt-3" icon="ri-check-line" onClick={onAssign} disabled={closed || !userDraft}>
          Save Assignment
        </Button>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4">
        <SectionTitle icon="ri-flow-chart" label="Workflow" />
        <div className="mt-3 flex flex-col gap-2">
          <Button variant="outline" size="sm" fullWidth icon="ri-play-circle-line" onClick={onStartWork} disabled={!canStart}>
            Start Work
          </Button>
          <Button variant="primary" size="sm" fullWidth icon="ri-checkbox-circle-line" onClick={onResolve} disabled={!canResolve}>
            Mark Resolved
          </Button>
        </div>
        <p className="mt-2.5 text-[11px] leading-relaxed text-foreground-500">
          Forward flow only: New → Assigned → In Progress → Resolved. Rejecting a ticket is final.
        </p>
      </section>

      {!closed ? (
        <section className="rounded-lg border border-[oklch(var(--status-danger)/0.3)] bg-[oklch(var(--status-danger)/0.05)] p-4">
          <SectionTitle icon="ri-close-circle-line" label="Reject Ticket" />
          {rejectOpen ? (
            <>
              <label htmlFor="console-reject" className="mt-3 block text-xs font-label font-semibold text-foreground-800">
                Reason for rejection <span className="text-[oklch(var(--status-danger))]">*</span>
              </label>
              <textarea
                id="console-reject"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError("");
                }}
                rows={3}
                maxLength={300}
                placeholder="e.g. Request outside scope, insufficient information, not feasible…"
                className="mt-1.5 w-full resize-none rounded-md border border-background-300 bg-background-50 px-3 py-2 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              {error ? (
                <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-[oklch(var(--status-danger))]">
                  <i className="ri-error-warning-line text-[13px] leading-none mt-0.5"></i>
                  {error}
                </p>
              ) : null}
              <div className="mt-3 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRejectOpen(false);
                    setReason("");
                    setError("");
                  }}
                >
                  Cancel
                </Button>
                <Button variant="danger" size="sm" icon="ri-close-line" onClick={confirmReject}>
                  Confirm Reject
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-[11px] leading-relaxed text-foreground-600">
                Rejecting requires a reason. The requester is notified and the ticket is marked Rejected.
              </p>
              <Button
                variant="danger"
                size="sm"
                fullWidth
                className="mt-3"
                icon="ri-close-circle-line"
                onClick={() => setRejectOpen(true)}
              >
                Reject Ticket
              </Button>
            </>
          )}
        </section>
      ) : null}
    </div>
  );
}
