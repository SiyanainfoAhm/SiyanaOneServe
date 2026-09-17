import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateInvitePassword } from "@/utils/credentials";

describe("generateInvitePassword", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 16));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses first 3 org letters + first 3 first-name letters + @ + day", () => {
    expect(generateInvitePassword("Mihir Shah", "Siyana")).toBe("SiyMih@16");
  });

  it("strips non-letters and capitalizes each part", () => {
    expect(generateInvitePassword("jatin", "ccshau")).toBe("CcsJat@16");
    expect(generateInvitePassword("A-1 User", "MGSU-2026")).toBe("MgsA@16");
  });

  it("falls back when org or name has no letters", () => {
    expect(generateInvitePassword("123", "!!!")).toBe("OrgUsr@16");
  });
});
