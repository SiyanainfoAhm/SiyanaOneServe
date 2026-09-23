import { describe, expect, it } from "vitest";
import { STATUS_ORDER } from "@/components/base/StatusBadge";
import { countByStatus, isClosedStatus, isOpen } from "@/utils/ticketStats";

describe("ticketStats", () => {
  it("exposes the forward-only status order", () => {
    expect(STATUS_ORDER).toEqual(["New", "Assigned", "In Progress", "Resolved"]);
  });

  it("counts rows by status", () => {
    expect(countByStatus([{ status: "New" }, { status: "New" }, { status: "Resolved" }])).toMatchObject({
      New: 2,
      Resolved: 1,
    });
  });

  it("treats Resolved and Closed as not open", () => {
    expect(isOpen("New")).toBe(true);
    expect(isOpen("In Progress")).toBe(true);
    expect(isOpen("Resolved")).toBe(false);
    expect(isOpen("Closed")).toBe(false);
    expect(isClosedStatus("resolved")).toBe(true);
  });
});
