import { describe, expect, it } from "vitest";
import { isSelectableOrganization } from "@/utils/organization";

describe("isSelectableOrganization", () => {
  it("hides Siyana Info Solutions regardless of casing or surrounding spaces", () => {
    expect(isSelectableOrganization("Siyana Info Solutions")).toBe(false);
    expect(isSelectableOrganization("  SIYANA INFO SOLUTIONS ")).toBe(false);
  });

  it("keeps other organizations selectable", () => {
    expect(isSelectableOrganization("Siyana")).toBe(true);
    expect(isSelectableOrganization("MGSU")).toBe(true);
  });
});
