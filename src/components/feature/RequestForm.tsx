/**
 * Shared create-ticket form for both portals.
 *
 * Latest design: org/project from the account, then details, optional files,
 * required notes, and a locked-after-submit priority. Status starts at New.
 * Files upload to Azure only after the ticket UUID exists.
 */
import { useMemo, useState } from "react";
import Card from "@/components/base/Card";
import Button from "@/components/base/Button";
import Select from "@/components/base/Select";
import ClientPageHeader from "@/pages/client/components/ClientPageHeader";
import PageHeader from "@/pages/console/components/PageHeader";
import AttachmentDropzone, { type UploadFile } from "@/pages/client/create/components/AttachmentDropzone";
import { useProjectScope } from "@/hooks/useProjectScope";
import { useAppData } from "@/context/AppDataContext";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/services/api";
import { requestPriorityOptions } from "@/mocks/client";
import { projectNamesOf } from "@/utils/liveStats";

const MAX_DESC = 500;
const MAX_NOTE = 500;
const DEFAULT_PRIORITY = "Normal";

export type RequestFormMode = "client" | "console";

const INPUT_CLASS =
  "h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 disabled:cursor-not-allowed";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

const READONLY_CLASS =
  "flex h-10 w-full items-center justify-between rounded-md border border-background-200 bg-background-100 px-3";

function SectionTitle({
  step,
  icon,
  title,
  subtitle,
}: {
  step: number;
  icon: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-md bg-primary-100 text-primary-700 flex items-center justify-center shrink-0 font-label text-xs font-bold">
        {step}
      </span>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 flex items-center justify-center">
            <i className={`${icon} text-foreground-500 text-[15px] leading-none`}></i>
          </span>
          <h3 className="font-heading text-[15px] font-semibold text-foreground-950">{title}</h3>
        </div>
        {subtitle ? <p className="mt-0.5 text-xs text-foreground-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">{label}</span>
      <div className={READONLY_CLASS}>
        <span className="truncate text-sm text-foreground-700">{value || "—"}</span>
        <i className="ri-lock-2-line text-foreground-400 text-[14px] leading-none"></i>
      </div>
    </div>
  );
}

export default function RequestForm({ mode }: { mode: RequestFormMode }) {
  const isConsole = mode === "console";
  const { user } = useAuth();
  const scopedProject = useProjectScope();
  const { projects, organizations, refresh } = useAppData();

  const assignedNames = useMemo(
    () => projectNamesOf(user?.projects as Array<string | { name: string }>),
    [user?.projects],
  );
  const projectList = useMemo(() => {
    const all = projects.map((project) => ({ name: project.name, organization: project.organization }));
    if (isConsole || assignedNames.length === 0) return all;
    return all.filter((item) => assignedNames.includes(item.name));
  }, [projects, isConsole, assignedNames]);

  const organizationOptions = useMemo(() => {
    const names = Array.from(new Set(organizations.map((org) => org.name).filter(Boolean)));
    projectList.forEach((item) => {
      if (item.organization && !names.includes(item.organization)) names.push(item.organization);
    });
    if (user?.organization && !names.includes(user.organization)) names.unshift(user.organization);
    return names.sort((a, b) => a.localeCompare(b));
  }, [organizations, projectList, user?.organization]);

  const scopedOrganization = projectList.find((item) => item.name === scopedProject)?.organization;
  const defaultOrganization = scopedOrganization ?? user?.organization ?? organizationOptions[0] ?? "";
  const defaultProject =
    projectList.find((item) => item.name === scopedProject && item.organization === defaultOrganization)?.name ??
    projectList.find((item) => item.organization === defaultOrganization)?.name ??
    projectList[0]?.name ??
    "";

  const [organization, setOrganization] = useState(defaultOrganization);
  const [project, setProject] = useState(defaultProject);
  const [priority, setPriority] = useState(DEFAULT_PRIORITY);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const projectsForOrganization = useMemo(
    () => projectList.filter((item) => item.organization === organization).map((item) => item.name),
    [projectList, organization],
  );

  const canChangeOrganization = organizationOptions.length > 1;
  const canChangeProject = projectsForOrganization.length > 1;

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 3600);
  }

  function handleOrganizationChange(value: string) {
    setOrganization(value);
    const next = projectList.filter((item) => item.organization === value);
    setProject(next[0]?.name ?? "");
  }

  function resetForm() {
    setOrganization(defaultOrganization);
    setProject(defaultProject);
    setPriority(DEFAULT_PRIORITY);
    setTitle("");
    setDescription("");
    setLink("");
    setNote("");
    setFiles([]);
    setError("");
  }

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Please enter a request title.");
      return;
    }
    if (!description.trim()) {
      setError("Please add a description for your request.");
      return;
    }
    if (!link.trim()) {
      setError("Please provide a reference link for this request.");
      return;
    }
    if (!note.trim()) {
      setError("Please add a short note describing the issue.");
      return;
    }
    if (!project) {
      setError("Please choose a project.");
      return;
    }
    setError("");
    setSaving(true);

    try {
      const created = await api.createTicket({
        project,
        organization,
        title: title.trim(),
        description: description.trim(),
        reference_url: link.trim(),
        priority,
        comment: note.trim(),
      });

      for (const item of files.filter((file) => file.status === "Ready" && file.file)) {
        try {
          const path = await api.uploadAttachment(created.ticket_id, item.file as File);
          await api.registerAttachment(created.id, item.name, path, item.byteSize, item.file?.type);
        } catch {
          /* keep the ticket even if a file fails */
        }
      }

      await refresh();
      showToast(
        isConsole
          ? `Request ${created.id} raised successfully and placed in the queue as New.`
          : `Request ${created.id} raised successfully and sent to the Siyana team.`,
      );
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit this request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {isConsole ? (
        <PageHeader
          title="Create Request"
          subtitle="Log a service request — organization and project are set automatically for the selected department."
        />
      ) : (
        <ClientPageHeader
          title="Create Request"
          subtitle="Tell us what you need — we will route it to the right team."
          breadcrumb={[{ label: "Dashboard", to: "/client/dashboard" }, { label: "Create Request" }]}
        />
      )}

      <div className="mt-5 flex max-w-4xl flex-col gap-4">
        <Card>
          <SectionTitle
            step={1}
            icon="ri-building-2-line"
            title="Requesting For"
            subtitle={
              canChangeOrganization || canChangeProject
                ? "Defaults are set from your account — change them if you have more than one"
                : "Organization and project are filled in automatically from your account"
            }
          />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {canChangeOrganization ? (
              <Select
                label="Organization"
                options={organizationOptions}
                value={organization}
                onChange={(event) => handleOrganizationChange(event.target.value)}
                icon="ri-building-2-line"
              />
            ) : (
              <ReadOnlyField label="Organization" value={organization} />
            )}
            {canChangeProject ? (
              <Select
                label="Project"
                options={projectsForOrganization}
                value={project}
                onChange={(event) => setProject(event.target.value)}
                icon="ri-folders-line"
              />
            ) : (
              <ReadOnlyField label="Project" value={project} />
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle
            step={2}
            icon="ri-article-line"
            title="Request Details"
            subtitle="Describe what you need in your own words"
          />
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="req-title" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
                Title <span className="text-[oklch(var(--status-danger))]">*</span>
              </label>
              <input
                id="req-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Update the homepage banner for convocation"
                className={INPUT_CLASS}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="req-desc" className="block text-xs font-label font-semibold text-foreground-800">
                  Description <span className="text-[oklch(var(--status-danger))]">*</span>
                </label>
                <span className="text-[11px] text-foreground-400">
                  {description.length}/{MAX_DESC}
                </span>
              </div>
              <textarea
                id="req-desc"
                value={description}
                maxLength={MAX_DESC}
                onChange={(event) => setDescription(event.target.value.slice(0, MAX_DESC))}
                rows={5}
                placeholder="Explain the requirement, any deadlines, and what the finished result should look like…"
                className={TEXTAREA_CLASS}
              />
            </div>

            <div>
              <label htmlFor="req-link" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
                Reference link <span className="text-[oklch(var(--status-danger))]">*</span>
              </label>
              <input
                id="req-link"
                type="url"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder="https://mgsu.ac.in/…"
                className={INPUT_CLASS}
              />
              <p className="mt-1.5 text-[11px] text-foreground-500">
                Paste the page or document this request relates to.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle
            step={3}
            icon="ri-attachment-2"
            title="Attachments"
            subtitle="Optional — add supporting documents, artwork or reference sheets"
          />
          <div className="mt-4">
            <AttachmentDropzone files={files} onChange={setFiles} />
          </div>
        </Card>

        <Card>
          <SectionTitle
            step={4}
            icon="ri-sticky-note-line"
            title="Notes"
            subtitle="Anything else the team should know about the issue?"
          />
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="req-note" className="block text-xs font-label font-semibold text-foreground-800">
                Notes <span className="text-[oklch(var(--status-danger))]">*</span>
              </label>
              <span className="text-[11px] text-foreground-400">
                {note.length}/{MAX_NOTE}
              </span>
            </div>
            <textarea
              id="req-note"
              value={note}
              maxLength={MAX_NOTE}
              onChange={(event) => setNote(event.target.value.slice(0, MAX_NOTE))}
              rows={4}
              placeholder="Describe the issue or add any extra context, deadlines or notes for the Siyana team…"
              className={TEXTAREA_CLASS}
            />
          </div>
        </Card>

        <Card>
          <SectionTitle
            step={5}
            icon="ri-flag-line"
            title="Priority"
            subtitle="Priority is chosen now and cannot be changed after submission"
          />
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {requestPriorityOptions.map((option) => {
              const active = priority === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPriority(option)}
                  className={`flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-label font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-background-300 bg-background-50 text-foreground-700 hover:bg-background-100"
                  }`}
                >
                  <i className={`${active ? "ri-radio-button-line" : "ri-checkbox-blank-circle-line"} text-[15px] leading-none`}></i>
                  {option}
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          {error ? (
            <p className="mb-3 flex items-start gap-1.5 rounded-md border border-[oklch(var(--status-danger)/0.3)] bg-[oklch(var(--status-danger)/0.06)] px-3 py-2 text-[11px] text-[oklch(var(--status-danger))]">
              <i className="ri-error-warning-line text-[14px] leading-none mt-0.5"></i>
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] leading-relaxed text-foreground-500">
              Once submitted, the request is given ticket ID and placed in the Siyana queue with status{" "}
              <span className="font-semibold text-foreground-700">New</span>.
            </p>
            <div className="flex items-center gap-2 sm:shrink-0">
              <Button variant="outline" icon="ri-eraser-line" onClick={resetForm} disabled={saving}>
                Clear Form
              </Button>
              <Button variant="primary" icon="ri-send-plane-line" onClick={() => void handleSubmit()} disabled={saving}>
                {saving ? "Submitting…" : "Submit Request"}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-2.5 rounded-lg border border-background-200 bg-foreground-950 px-4 py-3 shadow-lg">
          <span className="w-4 h-4 flex items-center justify-center shrink-0">
            <i className="ri-checkbox-circle-fill text-accent-400 text-[16px] leading-none"></i>
          </span>
          <span className="text-sm font-medium text-background-50">{toast}</span>
        </div>
      ) : null}
    </>
  );
}
