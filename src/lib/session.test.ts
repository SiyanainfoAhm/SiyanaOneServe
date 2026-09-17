import { afterEach, describe, expect, it } from "vitest";
import { clearSessionToken, getSessionToken, setSessionToken } from "@/lib/session";

describe("session token", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("stores, reads, and clears the custom OneServe token", () => {
    expect(getSessionToken()).toBeNull();
    setSessionToken("opaque-token");
    expect(getSessionToken()).toBe("opaque-token");
    expect(localStorage.getItem("sosticket_token")).toBe("opaque-token");
    clearSessionToken();
    expect(getSessionToken()).toBeNull();
  });
});
