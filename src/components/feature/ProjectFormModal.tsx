/**
 * Create/edit project. Organization name is sent on create; the RPC auto-creates
 * the org if missing. "+ Add new organization" is a local option, not a separate API.
 */
import { useMemo, useState } from "react";
import Select from "@/components/base/Select";
import Button from "@/components/base/Button";
import ModalOverlay from "@/components/base/ModalOverlay";
import {
  projectManagerOptions,
  projectEditableStatusOptions,
  type Project,
} from "@/mocks/consoleProjects";
import { useAppData } from "@/context/AppDataContext";

export interface ProjectFormValues {
  name: string;
  organization: string;
  status: string;
  manager: string;
}

const ADD_ORG_VALUE = "+ Add new organization";

interface ProjectFormModalProps {
  mode: "create" | "edit";
  initial?: Project;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => void | Promise<void>;
}

export default function ProjectFormModal({ mode, initial, onClose, onSubmit }: ProjectFormModalProps) {
  const { organizations, users } = useAppData();
  const liveOrgs = useMemo(() => {
    const names = organizations.map((org) => org.name).filter(Boolean);
    if (initial?.organization && !names.includes(initial.organization)) names.push(initial.organization);
    return names.length > 0 ? names : ["Siyana"];
  }, [organizations, initial]);
  const managerOptions = useMemo(() => {
    const staff = users
      .filter((user) => user.type === "staff" && user.status === "Active")
      .map((user) => user.full_name || user.name);
    if (initial?.manager && !staff.includes(initial.manager)) staff.unshift(initial.manager);
    return staff.length > 0 ? staff : projectManagerOptions;
  }, [users, initial]);

  const [name, setName] = useState(initial?.name ?? "");
  const [organization, setOrganization] = useState(initial?.organization ?? liveOrgs[0]);
  const [newOrg, setNewOrg] = useState("");
  const [status, setStatus] = useState<string>(initial?.status ?? "Active");
  const [manager, setManager] = useState(initial?.manager ?? managerOptions[0]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const orgOptions = useMemo(() => [...liveOrgs, ADD_ORG_VALUE], [liveOrgs]);

  const creatingOrg = organization === ADD_ORG_VALUE;

  async function handleSubmit() {
    const finalOrg = creatingOrg ? newOrg.trim() : organization;
    if (!name.trim()) {
      setError("Please enter a project name.");
      return;
    }
    if (!finalOrg || finalOrg === ADD_ORG_VALUE) {
      setError("Please enter the new organization name.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        organization: finalOrg,
        status: mode === "create" ? "Active" : status,
        manager,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save this project.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalOverlay>
      <div className="w-full max-w-xl rounded-lg border border-background-200 bg-background-50 shadow-lg">
        <div className="flex items-center justify-between border-b border-background-200 px-5 py-4">
          <div>
            <h3 className="font-heading text-[15px] font-semibold text-foreground-950">
              {mode === "create" ? "New Project" : "Edit Project"}
            </h3>
            <p className="mt-0.5 text-xs text-foreground-500">
              {mode === "create"
                ? "Set up a project and its organization"
                : "Update the project details, status and owner"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <i className="ri-close-line text-[18px] leading-none"></i>
          </button>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          <div>
            <label htmlFor="project-name" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
              Project name <span className="text-[oklch(var(--status-danger))]">*</span>
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              placeholder="e.g. MGSU Examination Portal"
              className="h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Organization"
              options={orgOptions}
              value={organization}
              onChange={(event) => {
                setOrganization(event.target.value);
                setError("");
              }}
              icon="ri-building-2-line"
            />
            {mode === "edit" ? (
              <Select
                label="Status"
                options={projectEditableStatusOptions}
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                icon="ri-toggle-line"
              />
            ) : (
              <div>
                <span className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">Status</span>
                <div className="flex h-10 items-center gap-2 rounded-md border border-background-200 bg-background-100 px-3 text-sm text-foreground-700">
                  <i className="ri-checkbox-circle-line text-foreground-500 text-[15px] leading-none"></i>
                  Active — set automatically on creation
                </div>
              </div>
            )}
            <Select
              label="Project Manager"
              options={managerOptions}
              value={manager}
              onChange={(event) => setManager(event.target.value)}
              icon="ri-user-star-line"
            />
          </div>

          {creatingOrg ? (
            <div className="rounded-lg border border-primary-200 bg-primary-50 p-3.5">
              <label htmlFor="project-new-org" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
                New organization name <span className="text-[oklch(var(--status-danger))]">*</span>
              </label>
              <input
                id="project-new-org"
                type="text"
                value={newOrg}
                onChange={(event) => {
                  setNewOrg(event.target.value);
                  setError("");
                }}
                placeholder="e.g. Department of Rural Development"
                className="h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
              />
              <p className="mt-1.5 text-[11px] text-foreground-500">
                This organization will be used for the new project and added to the organization list.
              </p>
            </div>
          ) : null}

          {error ? (
            <p className="flex items-start gap-1.5 rounded-md border border-[oklch(var(--status-danger)/0.3)] bg-[oklch(var(--status-danger)/0.06)] px-3 py-2 text-[11px] text-[oklch(var(--status-danger))]">
              <i className="ri-error-warning-line text-[14px] leading-none mt-0.5"></i>
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-background-200 px-5 py-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={mode === "create" ? "ri-add-line" : "ri-save-3-line"}
            onClick={() => void handleSubmit()}
            disabled={saving}
          >
            {mode === "create" ? "Create Project" : "Save Changes"}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}