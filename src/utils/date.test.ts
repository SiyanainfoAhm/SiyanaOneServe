import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ALL_TIME,
  CUSTOM_RANGE,
  createDateRange,
  daysBetween,
  formatDisplayDate,
  formatRelativeTime,
  matchesDateRange,
  todayIso,
} from "@/utils/date";

describe("date helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 17, 11, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats today as ISO and display dates as D Mon YYYY", () => {
    expect(todayIso()).toBe("2026-09-17");
    expect(formatDisplayDate("2026-09-17")).toBe("17 Sep 2026");
    expect(formatDisplayDate("hello")).toBe("hello");
  });

  it("computes day gaps and relative labels", () => {
    expect(daysBetween("2026-09-17", "2026-09-17")).toBe(0);
    expect(daysBetween("2026-09-16", "2026-09-17")).toBe(1);
    expect(formatRelativeTime("2026-09-17", "2026-09-17")).toBe("Today");
    expect(formatRelativeTime("2026-09-16", "2026-09-17")).toBe("Yesterday");
    expect(formatRelativeTime("2026-09-14", "2026-09-17")).toBe("3 days ago");
    expect(formatRelativeTime("2026-09-01", "2026-09-17")).toBe("1 Sep 2026");
  });

  it("matches All Time, presets, and custom ranges", () => {
    const reference = "2026-09-17";
    expect(matchesDateRange("2020-01-01", createDateRange(ALL_TIME), reference)).toBe(true);
    expect(matchesDateRange("2026-09-17", createDateRange("Today"), reference)).toBe(true);
    expect(matchesDateRange("2026-09-16", createDateRange("Today"), reference)).toBe(false);
    expect(matchesDateRange("2026-09-16", createDateRange("Yesterday"), reference)).toBe(true);
    expect(matchesDateRange("2026-09-11", createDateRange("Last 7 Days"), reference)).toBe(true);
    expect(matchesDateRange("2026-09-01", createDateRange("Last 7 Days"), reference)).toBe(false);
    expect(matchesDateRange("2026-08-19", createDateRange("Last 30 Days"), reference)).toBe(true);
    expect(matchesDateRange("2025-09-17", createDateRange("This year"), reference)).toBe(false);
    expect(
      matchesDateRange("2026-09-10", { preset: CUSTOM_RANGE, from: "2026-09-08", to: "2026-09-12" }, reference),
    ).toBe(true);
    expect(
      matchesDateRange("2026-09-01", { preset: CUSTOM_RANGE, from: "2026-09-08", to: "2026-09-12" }, reference),
    ).toBe(false);
  });
});
