/**
 * Invite or edit a user.
 *
 * Government Nodal Officer / Government Requester → client portal; every other role → console.
 * Invite password = first 3 org letters + first 3 first-name letters + @ + day.
 */
import { useMemo, useState } from "react";
import Select from "@/components/base/Select";
import Button from "@/components/base/Button";
import { useProjects } from "@/hooks/useProjectStore";
import { useAppData } from "@/context/AppDataContext";
import { generateInvitePassword } from "@/utils/credentials";
import type { ConsoleUser } from "@/mocks/consoleUsers";

export const USER_ROLES = [
  "Super Admin",
  "Operations Admin",
  "Project Manager",
  "Business Analyst",
  "Senior Developer",
  "Developer",
  "QA Engineer",
  "Content Analyst",
  "Government Nodal Officer",
  "Government Requester",
];

export const USER_TEAMS = ["Operations", "Content Team", "Development Team", "QA Team"];
const GOVERNMENT_ROLES = ["Government Nodal Officer", "Government Requester"]; // client portal only
const BASE_ORG_OPTIONS = ["Siyana"];
const STATUS_OPTIONS: ConsoleUser["status"][] = ["Active", "Inactive"];

function initialsOf(name: string): string {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "NA";
  return parts.map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

interface UserFormModalProps {
  mode: "create" | "edit";
  user?: ConsoleUser;
  onClose: () => void;
  onSubmit: (user: ConsoleUser, password?: string) => void | Promise<void>;
}

export default function UserFormModal({ mode, user, onClose, onSubmit }: UserFormModalProps) {
  const projects = useProjects();
  const { organizations } = useAppData();

  const orgOptions = useMemo(() => {
    const set = new Set<string>(organizations.map((org) => org.name));
    if (user) set.add(user.organization);
    projects.forEach((project) => set.add(project.organization));
    BASE_ORG_OPTIONS.forEach((org) => set.add(org));
    return Array.from(set);
  }, [projects, user, organizations]);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState(user?.role ?? USER_ROLES[0]);
  const [organization, setOrganization] = useState(user?.organization ?? orgOptions[0]);
  const [team, setTeam] = useState(
    user && USER_TEAMS.includes(user.team) ? user.team : USER_TEAMS[0],
  );
  const [status, setStatus] = useState<ConsoleUser["status"]>(user?.status ?? "Active");
  const [selectedProjects, setSelectedProjects] = useState<string[]>(user?.projects ?? []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState<{ user: ConsoleUser; password: string } | null>(null);

  const isGovernment = GOVERNMENT_ROLES.includes(role);
  const isCreate = mode === "create";

  function toggleProject(projectName: string) {
    setSelectedProjects((prev) =>
      prev.includes(projectName) ? prev.filter((item) => item !== projectName) : [...prev, projectName],
    );
  }

  async function handleSubmit() {
    if (!name.trim() || !email.trim()) {
      setError("Please provide both a name and an email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const nextUser: ConsoleUser = {
      id: user?.id ?? `u-${Date.now()}`,
      name: name.trim(),
      initials: initialsOf(name),
      email: email.trim(),
      role,
      team: isGovernment ? "—" : team,
      organization,
      type: isGovernment ? "government" : "staff",
      status: isCreate ? "Active" : status,
      openTickets: user?.openTickets ?? 0,
      lastActive: isCreate ? "Invite pending" : user?.lastActive ?? "Just now",
      projects: selectedProjects,
    };

    setSaving(true);
    try {
      if (isCreate) {
        const password = generateInvitePassword(name.trim(), organization);
        await onSubmit(nextUser, password);
        setSent({ user: nextUser, password });
        return;
      }
      await onSubmit(nextUser);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save this user.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground-950/40 p-4 sm:items-center">
      <div className="w-full max-w-xl rounded-lg border border-background-200 bg-background-50">
        <div className="flex items-center justify-between border-b border-background-200 px-5 py-4">
          <div>
            <h3 className="font-heading text-[15px] font-semibold text-foreground-950">
              {sent ? "Invitation Sent" : isCreate ? "Invite User" : "Edit User"}
            </h3>
            <p className="mt-0.5 text-xs text-foreground-500">
              {sent
                ? "Login details that have been emailed to the new user"
                : isCreate
                  ? "Send access to a new team member"
                  : "Update this user's role, organization, projects and access"}
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

        {sent ? (
          <div className="px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-accent-100">
                <i className="ri-mail-check-line text-accent-700 text-[20px] leading-none"></i>
              </span>
              <div>
                <p className="text-sm font-medium text-foreground-950">An email was sent to {sent.user.email}</p>
                <p className="text-xs text-foreground-500">They can sign in with the unique password below.</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-background-200 bg-background-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-background-200 pb-3">
                <div>
                  <p className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">To</p>
                  <p className="text-sm text-foreground-900">{sent.user.email}</p>
                </div>
                <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-[11px] font-medium text-secondary-900">
                  Siyana portal access
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-foreground-500">Name</span>
                  <span className="font-medium text-foreground-900">{sent.user.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-foreground-500">Email</span>
                  <span className="font-medium text-foreground-900">{sent.user.email}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-foreground-500">Organization</span>
                  <span className="font-medium text-foreground-900">{sent.user.organization}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-md border border-accent-200 bg-accent-100/70 px-3 py-2">
                  <span className="text-xs font-medium text-accent-900">Unique password</span>
                  <span className="font-mono text-sm font-semibold tracking-wide text-accent-900">{sent.password}</span>
                </div>
              </div>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-foreground-500">
              <i className="ri-information-line text-[14px] leading-none mt-0.5"></i>
              The user will be asked to change this password on first sign-in.
            </p>

            <div className="mt-5 flex justify-end">
              <Button variant="primary" icon="ri-check-line" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 px-5 py-5">
              <div>
                <label htmlFor="user-name" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
                  Full name <span className="text-[oklch(var(--status-danger))]">*</span>
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  placeholder="e.g. Mihir Sharma"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="user-email" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
                  Email address <span className="text-[oklch(var(--status-danger))]">*</span>
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  placeholder="name@siyana.in"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Select
                  label="Role"
                  options={USER_ROLES}
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  icon="ri-shield-user-line"
                />
                <Select
                  label="Organization"
                  options={orgOptions}
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                  icon="ri-building-2-line"
                />
                {isGovernment ? null : (
                  <Select
                    label="Team"
                    options={USER_TEAMS}
                    value={team}
                    onChange={(event) => setTeam(event.target.value)}
                    icon="ri-group-line"
                  />
                )}
                {isCreate ? null : (
                  <Select
                    label="Status"
                    options={STATUS_OPTIONS}
                    value={status}
                    onChange={(event) => setStatus(event.target.value as ConsoleUser["status"])}
                    icon="ri-toggle-line"
                  />
                )}
              </div>

              {isGovernment ? (
                <p className="flex items-start gap-1.5 rounded-md border border-secondary-200 bg-secondary-100/70 px-3 py-2 text-[11px] text-secondary-900">
                  <i className="ri-government-line text-[14px] leading-none mt-0.5"></i>
                  Government roles do not belong to a team, so no team is assigned.
                </p>
              ) : null}

              <div className="rounded-lg border border-background-200 bg-background-100 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-label font-semibold text-foreground-800">Assign projects (optional)</p>
                  <span className="text-[11px] text-foreground-500">{selectedProjects.length} selected</span>
                </div>
                <p className="mt-0.5 text-[11px] text-foreground-500">
                  Choose the projects this user should have access to.
                </p>
                <div className="mt-3 max-h-[200px] overflow-y-auto pr-1">
                  <div className="flex flex-col gap-1.5">
                    {projects.map((project) => {
                      const checked = selectedProjects.includes(project.name);
                      return (
                        <label
                          key={project.id}
                          className="flex cursor-pointer items-center gap-3 rounded-md border border-background-200 bg-background-50 px-3 py-2 transition-colors hover:border-primary-300"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleProject(project.name)}
                            className="h-4 w-4 cursor-pointer accent-[oklch(var(--primary-500))]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-foreground-900">{project.name}</span>
                            <span className="block truncate text-[11px] text-foreground-500">
                              {project.organization} · {project.code}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

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
                icon={isCreate ? "ri-send-plane-line" : "ri-save-3-line"}
                onClick={() => void handleSubmit()}
                disabled={saving}
              >
                {isCreate ? "Send Invitation" : "Save Changes"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}