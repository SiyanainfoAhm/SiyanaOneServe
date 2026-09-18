import { describe, expect, it } from "vitest";
import { STATUS_ORDER } from "@/components/base/StatusBadge";
import { countByStatus, isClosedStatus, isOpen, rejectionFromEvents } from "@/utils/ticketStats";

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
    expect(map.Assigned).toBe(0);
    expect(map.Custom).toBe(1);
    expect(STATUS_ORDER).toEqual(["New", "Assigned", "In Progress", "Resolved", "Rejected"]);
    expect(STATUS_ORDER.every((status) => status in map)).toBe(true);
  });

  it("treats Resolved, Closed, and Rejected as not open", () => {
    expect(isOpen("Assigned")).toBe(true);
    expect(isOpen("Resolved")).toBe(false);
    expect(isOpen("Closed")).toBe(false);
    expect(isOpen("Rejected")).toBe(false);
    expect(isClosedStatus("rejected")).toBe(true);
    expect(isClosedStatus("Resolved")).toBe(true);
    expect(isClosedStatus("Assigned")).toBe(false);
  });

  it("reads a rejection reason from the latest reject event", () => {
    const rejection = rejectionFromEvents("Rejected", [
      { type: "created", title: "Created", actor: "Meera", date: "15 Sep", time: "09:00" },
      { type: "rejected", title: "Rejected", note: "Out of scope", actor: "Arjun", date: "16 Sep", time: "11:20" },
    ]);
    expect(rejection).toEqual({
      by: "Arjun",
      at: "16 Sep 11:20",
      reason: "Out of scope",
    });
    expect(rejectionFromEvents("New")).toBeUndefined();
    expect(
      rejectionFromEvents("Rejected", [], "16 Sep", {
        reason: "Missing documents",
        by: "Priya Nair",
        at: "16 Sep 2026",
      }),
    ).toEqual({
      by: "Priya Nair",
      at: "16 Sep 2026",
      reason: "Missing documents",
    });
  });
});
