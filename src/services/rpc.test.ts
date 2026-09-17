import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, parseError, rpc } from "@/services/rpc";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

import { supabase } from "@/lib/supabase";

const rpcMock = vi.mocked(supabase.rpc);

describe("parseError", () => {
  it("strips Postgres ERROR prefixes down to the user-facing line", () => {
    expect(parseError(null)).toBe("Request failed");
    expect(parseError({ message: "ERROR: Invalid email or password\nDETAIL: x" })).toBe(
      "Invalid email or password",
    );
    expect(parseError({ message: "This role can only sign in to the Siyana Operations Console" })).toBe(
      "This role can only sign in to the Siyana Operations Console",
    );
  });
});

describe("rpc", () => {
  beforeEach(() => {
    rpcMock.mockReset();
  });

  it("returns data from a successful SECURITY DEFINER call", async () => {
    rpcMock.mockResolvedValue({ data: { ok: true }, error: null } as never);
    await expect(rpc("sosticket_logout", { p_token: "t" })).resolves.toEqual({ ok: true });
    expect(rpcMock).toHaveBeenCalledWith("sosticket_logout", { p_token: "t" });
  });

  it("throws ApiError when PostgREST returns an error", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: "ERROR: Not signed in" },
    } as never);
    await expect(rpc("sosticket_session")).rejects.toBeInstanceOf(ApiError);
    await expect(rpc("sosticket_session")).rejects.toThrow("Not signed in");
  });
});
