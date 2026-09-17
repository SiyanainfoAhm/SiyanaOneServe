/**
 * Workbench assign + status change. Saving calls sosticket_update_ticket;
 * the DB trigger sends Power Automate mail to the assignee / requester.
 */
import Select from "@/components/base/Select";
import Button from "@/components/base/Button";
import { workbenchStatuses, workbenchTeams, workbenchAssigneesByTeam } from "@/mocks/consoleTicket";

interface ActionPanelProps {
  status: string;
  statusDraft: string;
  onStatusDraft: (value: string) => void;
  onUpdateStatus: () => void;
  teamDraft: string;
  onTeamDraft: (value: string) => void;
  userDraft: string;
  onUserDraft: (value: string) => void;
  priority: string;
  onAssign: () => void;
  assignees?: string[];
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
  statusDraft,
  onStatusDraft,
  onUpdateStatus,
  teamDraft,
  onTeamDraft,
  userDraft,
  onUserDraft,
  priority,
  onAssign,
  assignees,
}: ActionPanelProps) {
  const assigneeOptions = assignees ?? workbenchAssigneesByTeam[teamDraft] ?? [];

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-background-200 bg-background-50 p-4">
        <SectionTitle icon="ri-exchange-line" label="Change Status" />
        <div className="mt-3">
          <Select options={workbenchStatuses} value={statusDraft} onChange={(e) => onStatusDraft(e.target.value)} />
        </div>
        <Button
          variant="primary"
          size="sm"
          fullWidth
          className="mt-2.5"
          icon="ri-refresh-line"
          onClick={onUpdateStatus}
          disabled={statusDraft === status}
        >
          Update Status
        </Button>
      </section>

      <section className="rounded-lg border border-background-200 bg-background-50 p-4">
        <SectionTitle icon="ri-user-add-line" label="Assignment" />
        <div className="mt-3 flex flex-col gap-2.5">
          <Select options={workbenchTeams} value={teamDraft} onChange={(e) => onTeamDraft(e.target.value)} label="Team" />
          <Select options={assigneeOptions} value={userDraft} onChange={(e) => onUserDraft(e.target.value)} label="Assign User" />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-md border border-background-200 bg-background-100 px-3 py-2.5">
          <span className="text-xs text-foreground-600">Priority (set by department)</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-900">
            <i className="ri-lock-2-line text-foreground-500 text-[13px] leading-none"></i>
            {priority}
          </span>
        </div>
        <Button variant="accent" size="sm" fullWidth className="mt-3" icon="ri-check-line" onClick={onAssign}>
          Save Assignment
        </Button>
      </section>
    </div>
  );
}