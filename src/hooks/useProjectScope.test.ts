import { describe, expect, it } from "vitest";
import { ALL_PROJECTS, filterByProject, getScopedProject, setScopedProject } from "@/hooks/useProjectScope";

describe("project scope", () => {
  it("defaults to All Projects and filters rows by name", () => {
    setScopedProject("");
    expect(getScopedProject()).toBe(ALL_PROJECTS);

    const rows = [
      { id: "1", project: "OneServe" },
      { id: "2", project: "MGSU Portal" },
    ];
    expect(filterByProject(rows, ALL_PROJECTS)).toEqual(rows);
    expect(filterByProject(rows, "OneServe")).toEqual([{ id: "1", project: "OneServe" }]);

    setScopedProject("OneServe");
    expect(getScopedProject()).toBe("OneServe");
    setScopedProject(ALL_PROJECTS);
  });
});
