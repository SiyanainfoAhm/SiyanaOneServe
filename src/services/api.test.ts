import { beforeEach, describe, expect, it, vi } from "vitest";

const rpcMock = vi.fn();
const sendForgotPasswordEmail = vi.fn();
const uploadToAzure = vi.fn();
const getSessionToken = vi.fn();

vi.mock("@/services/rpc", () => ({
  rpc: (...args: unknown[]) => rpcMock(...args),
}));

vi.mock("@/lib/testEmail", () => ({
  sendForgotPasswordEmail: (...args: unknown[]) => sendForgotPasswordEmail(...args),
}));

vi.mock("@/lib/azureStorage", () => ({
  uploadToAzure: (...args: unknown[]) => uploadToAzure(...args),
}));

vi.mock("@/lib/session", () => ({
  getSessionToken: () => getSessionToken(),
}));

import { api } from "@/services/api";

describe("api", () => {
  beforeEach(() => {
    rpcMock.mockReset();
    sendForgotPasswordEmail.mockReset();
    uploadToAzure.mockReset();
    getSessionToken.mockReset();
    getSessionToken.mockReturnValue("session-token");
  });

  it("passes p_portal on login so the RPC can lock console vs client", async () => {
    rpcMock.mockResolvedValue({ token: "t", user: { portal: "console" } });
    await api.login("arjun.mehta@siyana.in", "siyana@2026", true, "console");
    expect(rpcMock).toHaveBeenCalledWith("sosticket_login", {
      p_email: "arjun.mehta@siyana.in",
      p_password: "siyana@2026",
      p_keep_signed_in: true,
      p_portal: "console",
    });
  });

  it("skips logout RPC when there is no token", async () => {
    getSessionToken.mockReturnValue(null);
    await expect(api.logout()).resolves.toEqual({ ok: true });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("requires a session token for list/create calls", async () => {
    getSessionToken.mockReturnValue(null);
    expect(() => api.listTickets()).toThrow("Not signed in");
  });

  it("sends forgot-password through the Power Automate edge function", async () => {
    sendForgotPasswordEmail.mockResolvedValue({
      ok: true,
      portal: "client",
      email: "tickets@siyanainfo.com",
    });
    await expect(api.forgotPassword("tickets@siyanainfo.com")).resolves.toEqual({
      ok: true,
      sent: true,
      portal: "client",
      email: "tickets@siyanainfo.com",
    });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("uploads files through Azure then registers the blob path separately", async () => {
    uploadToAzure.mockResolvedValue("siyanaoneserve/images/ticket-uuid/file.png");
    await expect(api.uploadAttachment("ticket-uuid", new File(["x"], "file.png"))).resolves.toBe(
      "siyanaoneserve/images/ticket-uuid/file.png",
    );
    await api.registerAttachment("CCSHAU-2026-00001", "file.png", "siyanaoneserve/images/ticket-uuid/file.png", 12, "image/png");
    expect(rpcMock).toHaveBeenCalledWith("sosticket_register_attachment", {
      p_token: "session-token",
      p_ticket_id: "CCSHAU-2026-00001",
      p_file_name: "file.png",
      p_file_path: "siyanaoneserve/images/ticket-uuid/file.png",
      p_file_size: 12,
      p_mime_type: "image/png",
    });
  });

  it("resends an invitation with the user id and generated password", async () => {
    rpcMock.mockResolvedValue({ id: "user-1", password: "SiyMih@16" });
    await api.resendInvite("user-1", "SiyMih@16");
    expect(rpcMock).toHaveBeenCalledWith("sosticket_resend_invite", {
      p_token: "session-token",
      p_user_id: "user-1",
      p_password: "SiyMih@16",
    });
  });

  it("posts client-visible notes by default and internal when asked", async () => {
    await api.addMessage("ticket-1", "hello");
    expect(rpcMock).toHaveBeenCalledWith("sosticket_add_message", {
      p_token: "session-token",
      p_ticket_id: "ticket-1",
      p_body: "hello",
      p_visibility: "client",
    });
    await api.addMessage("ticket-1", "staff only", "internal");
    expect(rpcMock).toHaveBeenLastCalledWith(
      "sosticket_add_message",
      expect.objectContaining({ p_visibility: "internal" }),
    );
  });
});
