export function isActiveProject(project: { status: string }): boolean {
  return project.status.trim().toLowerCase() === "active";
}

export function activeProjects<T extends { status: string }>(projects: T[]): T[] {
  return projects.filter(isActiveProject);
}
