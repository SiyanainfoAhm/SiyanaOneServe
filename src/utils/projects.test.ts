import { describe, expect, it } from "vitest";
import { activeProjects, isActiveProject } from "@/utils/projects";

describe("activeProjects", () => {
  it("keeps only active projects regardless of status casing", () => {
    const projects = [
      { name: "Current", status: "Active" },
      { name: "Archived", status: "Inactive" },
      { name: "Legacy", status: "inactive" },
    ];

    expect(activeProjects(projects).map((project) => project.name)).toEqual(["Current"]);
    expect(isActiveProject(projects[1])).toBe(false);
  });
});
