import { useSyncExternalStore } from "react";

/**
 * A tiny global store that holds the currently selected project.
 * Both the operations console and the government client portal read from it,
 * so choosing a project in the top bar instantly filters every page.
 */

export const ALL_PROJECTS = "All Projects";

let scopedProject: string = ALL_PROJECTS;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getScopedProject() {
  return scopedProject;
}

export function setScopedProject(project: string) {
  scopedProject = project || ALL_PROJECTS;
  emit();
}

export function useProjectScope() {
  return useSyncExternalStore(subscribe, getScopedProject, getScopedProject);
}

/** Keeps only the rows that belong to the selected project (or all rows when none is selected). */
export function filterByProject<T extends { project: string }>(items: T[], scope: string): T[] {
  if (!scope || scope === ALL_PROJECTS) return items;
  return items.filter((item) => item.project === scope);
}