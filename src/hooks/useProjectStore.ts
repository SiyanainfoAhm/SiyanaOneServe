/**
 * Maps ProjectRecord → Project. upsertProject is create/edit;
 * missing organizations are created inside the RPC.
 */
import { useAppData } from "@/context/AppDataContext";
import { api } from "@/services/api";
import type { Project } from "@/mocks/consoleProjects";
import type { ProjectRecord } from "@/types/oneserve";

export function toProject(project: ProjectRecord): Project {
  return {
    id: project.id,
    name: project.name,
    code: project.code,
    organization: project.organization,
    status: project.status as Project["status"],
    manager: project.manager,
    managerInitials: project.managerInitials,
    progress: Number(project.progress ?? 0),
    openTickets: Number(project.openTickets ?? 0),
    totalTickets: Number(project.totalTickets ?? 0),
    slaHealth: Number(project.slaHealth ?? 100),
    category: project.category,
    started: project.started,
    deadline: project.deadline,
    slaHours: project.slaHours ?? { Critical: 8, High: 24, Normal: 48, Low: 96 },
  };
}

export function useProjects(): Project[] {
  const { projects } = useAppData();
  return projects.map(toProject);
}

export function getProjects(): Project[] {
  return [];
}

export async function addProject(project: Partial<Project> & { slaHours?: Record<string, number> }) {
  return api.upsertProject({
    name: project.name,
    organization: project.organization,
    status: project.status ?? "Active",
    category: project.category,
    manager: project.manager,
    code: project.code,
    slaHours: project.slaHours,
  });
}

export async function updateProject(id: string, patch: Partial<Project> & { slaHours?: Record<string, number> }) {
  return api.upsertProject({
    id,
    name: patch.name,
    organization: patch.organization,
    status: patch.status,
    category: patch.category,
    manager: patch.manager,
    code: patch.code,
    slaHours: patch.slaHours,
  });
}

export function generateProjectCode(organization: string, existingCount = 0) {
  const prefix =
    organization
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "PRJ";
  const sequence = String(100 + existingCount).slice(-3);
  return `${prefix}-${sequence}`;
}
