/**
 * Project overview, tickets, team, documents.
 * Documents tab is still mock data — not Azure storage.
 */
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import Card from "@/components/base/Card";
import Tabs from "@/components/base/Tabs";
import Button from "@/components/base/Button";
import Avatar from "@/components/base/Avatar";
import EmptyState from "@/components/base/EmptyState";
import StatCard from "@/pages/console/components/StatCard";
import { StatusBadge, PriorityBadge, TicketStatusBadge, type Tone } from "@/components/base/StatusBadge";
import {
  defaultProjectDocuments,
  defaultProjectTeam,
  type Project,
} from "@/mocks/consoleProjects";
import ProjectFormModal, { type ProjectFormValues } from "@/components/feature/ProjectFormModal";
import { useProjects, updateProject } from "@/hooks/useProjectStore";
import { useConsoleTickets } from "@/hooks/useConsoleTicketStore";
import { useAppData } from "@/context/AppDataContext";
import { formatDisplayDate } from "@/utils/date";

const HEAD = "px-4 py-2.5 text-left text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500";

const STATUS_TONE: Record<string, Tone> = {
  Active: "success",
  Inactive: "neutral",
};

const FILE_ICON: Record<string, string> = {
  PDF: "ri-file-pdf-2-line",
  DOCX: "ri-file-word-2-line",
  XLSX: "ri-file-excel-2-line",
  Image: "ri-image-line",
};

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-background-100 py-2.5 last:border-0">
      <span className="text-xs text-foreground-500">{label}</span>
      <span className="text-right text-xs font-medium text-foreground-900">{children}</span>
    </div>
  );
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProjectDetailPage() {
  const params = useParams();
  const code = params.code as string;
  const [tab, setTab] = useState("tickets");
  const [editOpen, setEditOpen] = useState(false);

  const projects = useProjects();
  const { refresh, users } = useAppData();
  const project = useMemo(() => projects.find((item) => item.code === code), [projects, code]);
  const allTickets = useConsoleTickets();

  const projectTickets = useMemo(
    () => (project ? allTickets.filter((ticket) => ticket.project === project.name) : []),
    [project, allTickets],
  );

  const team = useMemo(() => {
    if (!project) return defaultProjectTeam;
    const fromUsers = users
      .filter((user) => user.type === "staff" && user.status === "Active")
      .slice(0, 8)
      .map((user) => ({ initials: user.initials, name: user.full_name, role: user.role }));
    if (fromUsers.length > 0) return fromUsers;
    const managerMember = { initials: project.managerInitials, name: project.manager, role: "Project Manager" };
    const rest = defaultProjectTeam.filter((member) => member.name !== project.manager);
    return [managerMember, ...rest];
  }, [project, users]);

  if (!project) {
    return (
      <ConsoleLayout>
        <Card>
          <EmptyState
            icon="ri-folders-line"
            title={`Project ${code} was not found`}
            description="This project code does not exist or may have been archived."
            action={
              <Link
                to="/console/projects"
                className="inline-flex items-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line text-[15px] leading-none"></i>
                Back to Projects
              </Link>
            }
          />
        </Card>
      </ConsoleLayout>
    );
  }

  const openTickets = projectTickets.filter(
    (ticket) => ticket.status !== "Resolved" && ticket.status !== "Rejected" && ticket.status !== "Closed",
  ).length;
  const resolvedTickets = projectTickets.filter(
    (ticket) => ticket.status === "Resolved" || ticket.status === "Closed",
  ).length;

  async function handleEdit(values: ProjectFormValues) {
    try {
      await updateProject(project!.id, {
        name: values.name,
        organization: values.organization,
        status: values.status as Project["status"],
        manager: values.manager,
        managerInitials: initialsOf(values.manager),
      });
      await refresh();
      setEditOpen(false);
    } catch {
      setEditOpen(false);
    }
  }

  return (
    <ConsoleLayout>
      <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-500">
        <Link to="/console/projects" className="inline-flex items-center gap-1.5 hover:text-foreground-800 transition-colors cursor-pointer">
          <i className="ri-arrow-left-line text-[14px] leading-none"></i>
          Projects
        </Link>
        <i className="ri-arrow-right-s-line text-[14px] leading-none text-foreground-400"></i>
        <span className="font-mono text-foreground-700">{project.code}</span>
      </div>

      <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <h1 className="font-heading text-xl font-bold text-foreground-950">{project.name}</h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <StatusBadge label={project.status} tone={STATUS_TONE[project.status] ?? "neutral"} />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary-200 bg-secondary-100 px-2.5 py-0.5 text-xs font-label font-medium text-secondary-900">
              <i className="ri-building-2-line text-[13px] leading-none"></i>
              {project.organization}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="md" icon="ri-pencil-line" onClick={() => setEditOpen(true)}>
            Edit Project
          </Button>
          <Link
            to={`/console/queue?project=${encodeURIComponent(project.name)}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary-600 bg-primary-600 px-4 text-sm font-label font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-inbox-archive-line text-[15px] leading-none"></i>
            View in Queue
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Open Tickets" value={String(openTickets)} delta="Currently being worked on" tone="warning" icon="ri-ticket-2-line" />
        <StatCard label="Total Tickets" value={String(projectTickets.length || project.totalTickets)} delta="Raised since project start" tone="primary" icon="ri-inbox-archive-line" />
        <StatCard label="Resolved Tickets" value={String(resolvedTickets)} delta="Completed requests" tone="accent" icon="ri-checkbox-circle-line" />
        <StatCard label="Delivery Progress" value={`${project.progress}%`} delta="Overall completion" tone="info" icon="ri-line-chart-line" />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card>
          <h3 className="font-heading text-sm font-semibold text-foreground-950">Project Information</h3>
          <div className="mt-2">
            <InfoRow label="Project name">{project.name}</InfoRow>
            <InfoRow label="Client / Organization">{project.organization}</InfoRow>
            <InfoRow label="Status">
              <StatusBadge label={project.status} tone={STATUS_TONE[project.status] ?? "neutral"} />
            </InfoRow>
            <InfoRow label="Started">{project.started}</InfoRow>
            <InfoRow label="Target deadline">{project.deadline || "Not set"}</InfoRow>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-background-200 pt-4">
            <Avatar initials={project.managerInitials} tone="primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground-900">{project.manager}</p>
              <p className="truncate text-[11px] text-foreground-500">Project Manager</p>
            </div>
          </div>
        </Card>

        <Card className="min-w-0" padded={false}>
          <div className="border-b border-background-200 px-5 py-3.5">
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { key: "tickets", label: "Tickets", count: projectTickets.length, icon: "ri-inbox-archive-line" },
                { key: "documents", label: "Documents", count: defaultProjectDocuments.length, icon: "ri-folder-3-line" },
                { key: "team", label: "Team Members", count: team.length, icon: "ri-team-line" },
              ]}
            />
          </div>

          {tab === "tickets" ? (
            projectTickets.length === 0 ? (
              <EmptyState
                icon="ri-inbox-line"
                title="No tickets in this project yet"
                description="New service requests raised for this project will appear here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                  <thead>
                    <tr className="border-b border-background-200 bg-background-50">
                      <th className={HEAD}>Ticket</th>
                      <th className={HEAD}>Status</th>
                      <th className={HEAD}>Priority</th>
                      <th className={HEAD}>Assignee</th>
                      <th className={HEAD}>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectTickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b border-background-100 last:border-0 hover:bg-background-50 transition-colors">
                        <td className="px-4 py-3 max-w-[280px]">
                          <Link
                            to={`/console/tickets/${ticket.id}`}
                            className="block truncate text-sm font-medium text-foreground-900 hover:text-primary-700 transition-colors cursor-pointer"
                          >
                            {ticket.title}
                          </Link>
                          <span className="font-mono text-[11px] text-foreground-500">{ticket.id}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <TicketStatusBadge status={ticket.status} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <PriorityBadge priority={ticket.priority} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-700">{ticket.assignee}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-foreground-500">
                          {formatDisplayDate(ticket.created)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : null}

          {tab === "documents" ? (
            <ul className="flex flex-col divide-y divide-background-100 px-5">
              {defaultProjectDocuments.map((doc) => (
                <li key={doc.id} className="flex items-center gap-3 py-3.5">
                  <span className="w-9 h-9 rounded-md bg-background-100 flex items-center justify-center shrink-0">
                    <i className={`${FILE_ICON[doc.kind] ?? "ri-file-line"} text-foreground-600 text-[17px] leading-none`}></i>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground-900">{doc.name}</p>
                    <p className="text-[11px] text-foreground-500">
                      {doc.kind} · {doc.size} · updated {doc.updated}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" icon="ri-download-2-line">
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}

          {tab === "team" ? (
            <ul className="flex flex-col divide-y divide-background-100 px-5">
              {team.map((member) => (
                <li key={member.initials} className="flex items-center gap-3 py-3.5">
                  <Avatar initials={member.initials} tone="secondary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground-900">{member.name}</p>
                    <p className="text-[11px] text-foreground-500">{member.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      </div>

      {editOpen ? (
        <ProjectFormModal
          mode="edit"
          initial={project}
          onClose={() => setEditOpen(false)}
          onSubmit={handleEdit}
        />
      ) : null}
    </ConsoleLayout>
  );
}