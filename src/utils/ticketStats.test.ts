import { describe, expect, it } from "vitest";
import { STATUS_ORDER } from "@/components/base/StatusBadge";
import { countByStatus, isOpen } from "@/utils/ticketStats";

describe("ticketStats", () => {
  it("starts every lifecycle status at zero then counts rows", () => {
    const map = countByStatus([
      { status: "New" },
      { status: "New" },
      { status: "Closed" },
      { status: "Custom" },
    ]);
    expect(map.New).toBe(2);
    expect(map.Closed).toBe(1);
    expect(map["Need Approval"]).toBe(0);
    expect(map.Custom).toBe(1);
    expect(STATUS_ORDER.every((status) => status in map)).toBe(true);
  });

  it("treats Resolved, Closed, and Rejected as not open", () => {
    expect(isOpen("Assigned")).toBe(true);
    expect(isOpen("Resolved")).toBe(false);
    expect(isOpen("Closed")).toBe(false);
    expect(isOpen("Rejected")).toBe(false);
  });
});
