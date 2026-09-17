/**
 * Shared create-ticket form for both portals.
 *
 * Client submissions typically land in Need Approval.
 * Files upload to Azure only after the ticket UUID exists.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "@/components/base/Card";
import Select from "@/components/base/Select";
import Button from "@/components/base/Button";
import ClientPageHeader from "@/pages/client/components/ClientPageHeader";
import PageHeader from "@/pages/console/components/PageHeader";
import AttachmentDropzone, { type UploadFile } from "@/pages/client/create/components/AttachmentDropzone";
import { useProjectScope } from "@/hooks/useProjectScope";
import { useAppData } from "@/context/AppDataContext";
import { api } from "@/services/api";
import { serviceCatalogue, requestPriorityOptions } from "@/mocks/client";

const MAX_DESC = 500;
const MAX_NOTE = 500;

const CATEGORY_OPTIONS = serviceCatalogue.map((category) => category.title);
const PRIORITY_OPTIONS = requestPriorityOptions;

export type RequestFormMode = "client" | "console";

const INPUT_CLASS =
  "h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

const TEXTAREA_CLASS =
  "w-full resize-none rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100";

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

export default function RequestForm({ mode }: { mode: RequestFormMode }) {
  const isConsole = mode === "console";
  const scopedProject = useProjectScope();
  const { projects, organizations, refresh } = useAppData();
  const projectOptions = projects.map((project) => project.name);
  const organizationOptions = organizations.map((org) => org.name);
  const defaultProject = projectOptions.includes(scopedProject) ? scopedProject : projectOptions[0] ?? "";
  const [organization, setOrganization] = useState(organizationOptions[0] ?? "");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [subCategory, setSubCategory] = useState(serviceCatalogue[0].options[0].label);
  const [otherSub, setOtherSub] = useState("");
  const [project, setProject] = useState(defaultProject);
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[2]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [saving, setSaving] = useState(false);

  const subOptions = useMemo(() => {
    const match = serviceCatalogue.find((item) => item.title === category) ?? serviceCatalogue[0];
    return [...match.options.map((option) => option.label), "Other"];
  }, [category]);

  function handleCategoryChange(value: string) {
    setCategory(value);
    const match = serviceCatalogue.find((item) => item.title === value) ?? serviceCatalogue[0];
    setSubCategory(match.options[0].label);
    setOtherSub("");
  }

  function resetForm() {
    setOrganization(organizationOptions[0] ?? "");
    setCategory(CATEGORY_OPTIONS[0]);
    setSubCategory(serviceCatalogue[0].options[0].label);
    setOtherSub("");
    setProject(defaultProject);
    setPriority(PRIORITY_OPTIONS[2]);
    setTitle("");
    setDescription("");
    setLink("");
    setNote("");
    setFiles([]);
    setError("");
    setSubmitted(false);
    setGeneratedId("");
  }

  async function handleSubmit() {
    if (!title.trim() || !description.trim()) {
      setError("Please provide a request title and a short description before submitting.");
      return;
    }
    if (subCategory === "Other" && !otherSub.trim()) {
      setError("Please describe your request type under 'Other'.");
      return;
    }
    if (!project) {
      setError("Please choose a project.");
      return;
    }
    setError("");
    setSaving(true);

    const resolvedType = subCategory === "Other" ? otherSub.trim() || "Other" : subCategory;

    try {
      const created = await api.createTicket({
        project,
        category,
        request_type: resolvedType,
        title: title.trim(),
        description: description.trim(),
        reference_url: link.trim() || null,
        priority,
        comment: note.trim() || null,
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
      setGeneratedId(created.id);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit this request.");
    } finally {
      setSaving(false);
    }
  }

  if (submitted) {
    return (
      <>
        {isConsole ? (
          <PageHeader
            title="Request Submitted"
            subtitle="The request has been logged and routed to the Siyana service team."
          />
        ) : (
          <ClientPageHeader
            title="Request Submitted"
            subtitle="Your requirement has reached the Siyana service team."
            breadcrumb={[{ label: "Dashboard", to: "/client/dashboard" }, { label: "Create Request" }]}
          />
        )}
        <Card className="mt-5 max-w-3xl">
          <div className="flex flex-col items-center text-center px-4 py-8">
            <span className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-accent-700 text-[34px] leading-none"></i>
            </span>
            <h2 className="mt-4 font-heading text-lg font-bold text-foreground-950">
              Request raised successfully
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-foreground-500">
              We have generated ticket{" "}
              <span className="font-mono font-semibold text-foreground-900">{generatedId}</span> for
              your request. You will receive updates here and can track progress at any time.
            </p>

            <div className="mt-6 grid w-full max-w-md grid-cols-1 gap-2.5 rounded-lg border border-background-200 bg-background-100 p-4 text-left sm:grid-cols-2">
              {isConsole ? (
                <div className="sm:col-span-2">
                  <p className="text-[11px] font-label font-semibold uppercase tracking-wide text-foreground-500">
                    Organization
                  </p>
                  <p className="mt-0.5 text-sm text-foreground-900">{organization}</p>
                </div>
              ) : null}
              <div>
                <p className="text-[11px] font-label font-semibold uppercase tracking-wide text-foreground-500">
                  Category
                </p>
                <p className="mt-0.5 text-sm text-foreground-900">{category}</p>
              </div>
              <div>
                <p className="text-[11px] font-label font-semibold uppercase tracking-wide text-foreground-500">
                  Sub-category
                </p>
                <p className="mt-0.5 text-sm text-foreground-900">
                  {subCategory === "Other" ? otherSub.trim() || "Other" : subCategory}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] font-label font-semibold uppercase tracking-wide text-foreground-500">
                  Title
                </p>
                <p className="mt-0.5 text-sm text-foreground-900">{title}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link
                to={isConsole ? "/console/queue" : `/client/requests/${generatedId}`}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary-600 bg-primary-600 px-4 text-sm font-label font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-external-link-line text-[15px] leading-none"></i>
                {isConsole ? "View Ticket Queue" : "View Request"}
              </Link>
              <Button variant="outline" icon="ri-arrow-go-back-line" onClick={resetForm}>
                Create Another
              </Button>
              {!isConsole ? (
                <Link
                  to="/client/requests"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-background-300 bg-background-50 px-4 text-sm font-label font-medium text-foreground-800 hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  My Requests
                </Link>
              ) : null}
            </div>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      {isConsole ? (
        <PageHeader
          title="Create Request"
          subtitle="Log a service request on behalf of a department — the same simple form your departments use."
        />
      ) : (
        <ClientPageHeader
          title="Create Request"
          subtitle="Tell us what you need in a few simple steps — we will route it to the right team."
          breadcrumb={[{ label: "Dashboard", to: "/client/dashboard" }, { label: "Create Request" }]}
        />
      )}

      <div className="mt-5 flex max-w-4xl flex-col gap-4">
        <Card>
          <SectionTitle
            step={1}
            icon="ri-apps-2-line"
            title="What do you need?"
            subtitle="Pick a category and the closest option"
          />
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {isConsole ? (
              <Select
                label="Organization"
                options={organizationOptions}
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                icon="ri-building-2-line"
              />
            ) : null}
            <Select
              label="Category"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(event) => handleCategoryChange(event.target.value)}
              icon="ri-apps-2-line"
            />
            <Select
              label="Sub-category"
              options={subOptions}
              value={subCategory}
              onChange={(event) => setSubCategory(event.target.value)}
              icon="ri-list-check-2"
            />
            {subCategory === "Other" ? (
              <div className="md:col-span-2">
                <label
                  htmlFor="other-sub"
                  className="mb-1.5 block text-xs font-label font-semibold text-foreground-800"
                >
                  Describe your request type
                </label>
                <input
                  id="other-sub"
                  type="text"
                  value={otherSub}
                  onChange={(event) => setOtherSub(event.target.value)}
                  placeholder="e.g. New landing page for admissions"
                  className={INPUT_CLASS}
                />
              </div>
            ) : null}
            <Select
              label="Project"
              options={projectOptions}
              value={project}
              onChange={(event) => setProject(event.target.value)}
              icon="ri-folders-line"
            />
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              icon="ri-flag-line"
            />
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
              <label
                htmlFor="req-title"
                className="mb-1.5 block text-xs font-label font-semibold text-foreground-800"
              >
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
                <label
                  htmlFor="req-desc"
                  className="block text-xs font-label font-semibold text-foreground-800"
                >
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
              <label
                htmlFor="req-link"
                className="mb-1.5 block text-xs font-label font-semibold text-foreground-800"
              >
                Reference link (optional)
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
                Paste the page or document this request relates to, if any.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle
            step={3}
            icon="ri-attachment-2"
            title="Attachments (optional)"
            subtitle="Add supporting documents, artwork or reference sheets"
          />
          <div className="mt-4">
            <AttachmentDropzone files={files} onChange={setFiles} />
          </div>
        </Card>

        <Card>
          <SectionTitle
            step={4}
            icon="ri-sticky-note-line"
            title="Notes (optional)"
            subtitle="Anything else the team should know about the issue?"
          />
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="req-note"
                className="block text-xs font-label font-semibold text-foreground-800"
              >
                Notes (optional)
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
          {error ? (
            <p className="mb-3 flex items-start gap-1.5 rounded-md border border-[oklch(var(--status-danger)/0.3)] bg-[oklch(var(--status-danger)/0.06)] px-3 py-2 text-[11px] text-[oklch(var(--status-danger))]">
              <i className="ri-error-warning-line text-[14px] leading-none mt-0.5"></i>
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] leading-relaxed text-foreground-500">
              Once submitted, the request is assigned a ticket ID and routed to the right Siyana team
              automatically.
            </p>
            <div className="flex items-center gap-2 sm:shrink-0">
              <Button variant="outline" icon="ri-eraser-line" onClick={resetForm}>
                Clear Form
              </Button>
              <Button variant="primary" icon="ri-send-plane-line" onClick={() => void handleSubmit()} disabled={saving}>
                {saving ? "Submitting…" : "Submit Request"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}