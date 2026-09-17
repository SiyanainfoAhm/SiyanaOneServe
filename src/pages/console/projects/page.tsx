/**
 * Project list + add/edit. New organizations are created inside sosticket_upsert_project.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import PageHeader from "@/pages/console/components/PageHeader";
import Card from "@/components/base/Card";
import Select from "@/components/base/Select";
import Button from "@/components/base/Button";
import Avatar from "@/components/base/Avatar";
import StatCard from "@/pages/console/components/StatCard";
import EmptyState from "@/components/base/EmptyState";
import { StatusBadge, type Tone } from "@/components/base/StatusBadge";
import ProjectFormModal, { type ProjectFormValues } from "@/components/feature/ProjectFormModal";
import { useProjects, addProject, updateProject, generateProjectCode } from "@/hooks/useProjectStore";
import { useProjectScope, ALL_PROJECTS } from "@/hooks/useProjectScope";
import { useAppData } from "@/context/AppDataContext";
import {
  projectStatusOptions,
  type Project,
} from "@/mocks/consoleProjects";

const STATUS_TONE: Record<string, Tone> = {
  Active: "success",
  Inactive: "neutral",
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProjectsPage() {
  const projects = useProjects();
  const { refresh, organizations } = useAppData();
  const orgFilterOptions = useMemo(
    () => ["All Organizations", ...organizations.map((item) => item.name)],
    [organizations],
  );
  const scope = useProjectScope();
  const [org, setOrg] = useState("All Organizations");
  const [status, setStatus] = useState("All Statuses");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [toast, setToast] = useState("");

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);

  function showToast(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 2600);
  }

  const scoped = useMemo(
    () => (scope === ALL_PROJECTS ? projects : projects.filter((project) => project.name === scope)),
    [projects, scope],
  );

  const filtered = useMemo(
    () =>
      scoped.filter((project) => {
        if (org !== "All Organizations" && project.organization !== org) return false;
        if (status !== "All Statuses" && project.status !== status) return false;
        return true;
      }),
    [scoped, org, status],
  );

  const stats = useMemo(() => {
    const active = scoped.filter((project) => project.status === "Active").length;
    const open = scoped.reduce((sum, project) => sum + project.openTickets, 0);
    const avg = Math.round(
      scoped.reduce((sum, project) => sum + project.progress, 0) / Math.max(1, scoped.length),
    );
    return { active, open, avg };
  }, [scoped]);

  function openCreate() {
    setEditing(null);
    setModalMode("create");
  }

  function openEdit(project: Project) {
    setEditing(project);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditing(null);
  }

  async function handleSubmit(values: ProjectFormValues) {
    try {
      if (modalMode === "edit" && editing) {
        await updateProject(editing.id, {
          name: values.name,
          organization: values.organization,
          status: values.status as Project["status"],
          manager: values.manager,
          managerInitials: initialsOf(values.manager),
        });
        showToast(`Project ${values.name} updated`);
      } else {
        const project: Project = {
          id: `p-${Date.now()}`,
          name: values.name,
          code: generateProjectCode(values.organization, projects.length),
          organization: values.organization,
          status: "Active",
          manager: values.manager,
          managerInitials: initialsOf(values.manager),
          progress: 0,
          openTickets: 0,
          totalTickets: 0,
          started: "Sep 2026",
          deadline: "",
        };
        await addProject(project);
        showToast(`Project ${project.name} created`);
      }
      await refresh();
      closeModal();
    } catch (err) {
      throw err;
    }
  }

  return (
    <ConsoleLayout>
      <PageHeader
        title="Projects"
        subtitle="Government organizations and their active IT projects managed by Siyana"
        actions={
          <Button variant="primary" icon="ri-add-line" onClick={openCreate}>
            New Project
          </Button>
        }
      />

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={String(projects.length)} delta={`Across ${organizations.length} organizations`} tone="primary" icon="ri-folders-line" />
        <StatCard label="Active Projects" value={String(stats.active)} delta="Currently in delivery" tone="accent" icon="ri-play-circle-line" />
        <StatCard label="Open Tickets" value={String(stats.open)} delta="Across all projects" tone="warning" icon="ri-ticket-2-line" />
        <StatCard label="Avg Progress" value={`${stats.avg}%`} delta="Portfolio completion" tone="info" icon="ri-line-chart-line" />
      </div>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select options={orgFilterOptions} value={org} onChange={(e) => setOrg(e.target.value)} icon="ri-building-2-line" containerClassName="w-[200px]" />
          <Select options={projectStatusOptions} value={status} onChange={(e) => setStatus(e.target.value)} icon="ri-filter-3-line" containerClassName="w-[170px]" />
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-background-200 bg-background-100 px-1 py-1 self-start">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-label font-medium transition-colors cursor-pointer ${
              view === "grid" ? "bg-background-50 text-foreground-950 border border-background-200" : "text-foreground-500 hover:text-foreground-800"
            }`}
          >
            <i className="ri-grid-line text-[14px] leading-none"></i>
            Grid
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-label font-medium transition-colors cursor-pointer ${
              view === "list" ? "bg-background-50 text-foreground-950 border border-background-200" : "text-foreground-500 hover:text-foreground-800"
            }`}
          >
            <i className="ri-list-check text-[14px] leading-none"></i>
            List
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-4">
          <EmptyState icon="ri-folders-line" title="No projects match these filters" description="Try a different organization or status to see more projects." />
        </Card>
      ) : view === "grid" ? (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-secondary-200 bg-secondary-100 px-2 py-0.5 text-[11px] font-label font-medium text-secondary-900">
                  <i className="ri-building-2-line text-[12px] leading-none"></i>
                  {project.organization}
                </span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge label={project.status} tone={STATUS_TONE[project.status] ?? "neutral"} />
                  <button
                    type="button"
                    onClick={() => openEdit(project)}
                    className="w-7 h-7 rounded-md flex items-center justify-center text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
                    aria-label={`Edit ${project.name}`}
                  >
                    <i className="ri-pencil-line text-[15px] leading-none"></i>
                  </button>
                </div>
              </div>

              <h3 className="mt-3 font-heading text-[15px] font-semibold text-foreground-950">
                <Link
                  to={`/console/projects/${project.code}`}
                  className="hover:text-primary-700 transition-colors cursor-pointer"
                >
                  {project.name}
                </Link>
              </h3>
              <p className="mt-0.5 font-mono text-[11px] text-foreground-500">{project.code} · started {project.started}</p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-500">Delivery progress</span>
                  <span className="font-label font-semibold text-foreground-900">{project.progress}%</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-background-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${project.progress >= 80 ? "bg-accent-500" : project.progress >= 50 ? "bg-primary-500" : "bg-[oklch(var(--status-warning))]"}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 rounded-md bg-background-100 p-2.5">
                <div className="text-center">
                  <p className="font-heading text-sm font-bold text-foreground-950">{project.openTickets}</p>
                  <p className="text-[10px] uppercase tracking-wide text-foreground-500">Open</p>
                </div>
                <div className="text-center border-l border-background-200">
                  <p className="font-heading text-sm font-bold text-foreground-950">{project.totalTickets}</p>
                  <p className="text-[10px] uppercase tracking-wide text-foreground-500">Total</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-background-100 pt-3.5">
                <Avatar initials={project.managerInitials} size="sm" tone="primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground-900">{project.manager}</p>
                  <p className="text-[11px] text-foreground-500">Project Manager</p>
                </div>
                <Button variant="outline" size="sm" icon="ri-pencil-line" onClick={() => openEdit(project)}>
                  Edit
                </Button>
                <Link
                  to={`/console/queue?project=${encodeURIComponent(project.name)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-background-300 bg-background-50 px-3 text-xs font-medium text-foreground-800 hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap"
                >
                  Tickets
                  <i className="ri-arrow-right-line text-[14px] leading-none"></i>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-4" padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-background-200 bg-background-50">
                  {["Project", "Organization", "Manager", "Status", "Progress", "Open", ""].map((head, index) => (
                    <th key={head || `col-${index}`} className="px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((project) => (
                  <tr key={project.id} className="border-b border-background-100 last:border-0 hover:bg-background-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/console/projects/${project.code}`}
                        className="text-sm font-medium text-foreground-900 hover:text-primary-700 transition-colors cursor-pointer"
                      >
                        {project.name}
                      </Link>
                      <p className="font-mono text-[11px] text-foreground-500">{project.code}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-600">{project.organization}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-2">
                        <Avatar initials={project.managerInitials} size="sm" tone="primary" />
                        <span className="text-xs text-foreground-700">{project.manager}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge label={project.status} tone={STATUS_TONE[project.status] ?? "neutral"} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 rounded-full bg-background-200 overflow-hidden">
                          <div className="h-full rounded-full bg-primary-500" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-foreground-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground-800">{project.openTickets}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Button variant="outline" size="sm" icon="ri-pencil-line" onClick={() => openEdit(project)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modalMode ? (
        <ProjectFormModal
          mode={modalMode}
          initial={editing ?? undefined}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-background-200 bg-foreground-950 px-4 py-3 shadow-lg">
          <span className="w-4 h-4 flex items-center justify-center">
            <i className="ri-checkbox-circle-fill text-accent-400 text-[16px] leading-none"></i>
          </span>
          <span className="text-sm font-medium text-background-50">{toast}</span>
        </div>
      ) : null}
    </ConsoleLayout>
  );
}