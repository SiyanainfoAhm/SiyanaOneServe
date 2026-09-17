import { describe, expect, it } from "vitest";
import { CLIENT_ROLE_KEYS, isClientRole, portalForRole } from "@/lib/roles";

describe("isClientRole / portalForRole", () => {
  it("maps government nodal officer and requester to the client portal", () => {
    expect(CLIENT_ROLE_KEYS).toEqual(["government_nodal_officer", "government_requester"]);
    expect(isClientRole("government_nodal_officer")).toBe(true);
    expect(isClientRole("government_requester")).toBe(true);
    expect(isClientRole("Government Nodal Officer")).toBe(true);
    expect(isClientRole("Government Requester")).toBe(true);
    expect(isClientRole("Nodal Officer")).toBe(true);
    expect(portalForRole("government_nodal_officer")).toBe("client");
    expect(portalForRole("Government Requester")).toBe("client");
  });

  it("maps every other role to the operations console", () => {
    expect(isClientRole("operations_admin")).toBe(false);
    expect(isClientRole("super_admin")).toBe(false);
    expect(isClientRole("Developer")).toBe(false);
    expect(isClientRole(null)).toBe(false);
    expect(isClientRole(undefined)).toBe(false);
    expect(isClientRole("")).toBe(false);
    expect(portalForRole("operations_admin")).toBe("console");
    expect(portalForRole(undefined)).toBe("console");
  });

  it("normalizes spacing and case for RPC keys", () => {
    expect(isClientRole("  government_nodal_officer  ")).toBe(true);
    expect(isClientRole("government requester")).toBe(true);
  });
});
