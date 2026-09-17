import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { formatDuration, useTicker } from "@/hooks/useTicker";

describe("formatDuration", () => {
  it("formats minutes, hours, and days; ignores sign", () => {
    expect(formatDuration(75)).toBe("1m 15s");
    expect(formatDuration(3661)).toBe("1h 01m 01s");
    expect(formatDuration(90061)).toBe("1d 1h 01m");
    expect(formatDuration(-75)).toBe("1m 15s");
  });
});

describe("useTicker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("advances elapsed seconds on each interval", () => {
    const { result } = renderHook(() => useTicker(1000));
    expect(result.current).toBe(0);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(3);
  });
});
