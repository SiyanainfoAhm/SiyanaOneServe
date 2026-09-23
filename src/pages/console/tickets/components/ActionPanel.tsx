/**
 * Workbench assignment and forward-only workflow.
 *
 * New → Assigned → In Progress → Resolved.
 * Priority is set by the department and cannot be changed here.
 * Team and assignee lists come from live staff, not mock data.
 */
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
  teams,
  assignees,
}: ActionPanelProps) {
  const closed = status === "Resolved" || status === "Closed";
  const canStart = status === "Assigned";
  const canResolve = status === "In Progress";

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
          Forward flow only: New → Assigned → In Progress → Resolved. Resolving requires a comment saved as a note.
        </p>
      </section>
    </div>
  );
}
