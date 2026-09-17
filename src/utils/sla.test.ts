import { describe, expect, it } from "vitest";
import { slaTiming } from "@/utils/sla";

describe("slaTiming", () => {
  it("uses priority windows (hours → seconds)", () => {
    expect(slaTiming("T1", "Critical", "Met").windowSeconds).toBe(8 * 3600);
    expect(slaTiming("T1", "High", "Met").windowSeconds).toBe(24 * 3600);
    expect(slaTiming("T1", "Normal", "Met").windowSeconds).toBe(48 * 3600);
    expect(slaTiming("T1", "Low", "Met").windowSeconds).toBe(72 * 3600);
    expect(slaTiming("T1", "Unknown", "Met").windowSeconds).toBe(48 * 3600);
  });

  it("returns stable due times by SLA state", () => {
    expect(slaTiming("ABC", "High", "Met").dueInSeconds).toBe(0);
    expect(slaTiming("ABC", "High", "Breached").dueInSeconds).toBeLessThan(0);
    expect(slaTiming("ABC", "High", "At Risk").dueInSeconds).toBeGreaterThan(0);
    expect(slaTiming("ABC", "High", "Due Soon").dueInSeconds).toBeGreaterThan(
      slaTiming("ABC", "High", "At Risk").dueInSeconds,
    );
    expect(slaTiming("ABC", "High", "On Track")).toEqual(slaTiming("ABC", "High", "On Track"));
  });
});
