import { beforeEach, describe, expect, it, vi } from "vitest";
import { azureDownloadUrl, uploadToAzure } from "@/lib/azureStorage";

vi.mock("@/lib/session", () => ({
  getSessionToken: () => "session-token",
}));

describe("Azure storage client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("POSTs the file bytes to the edge function with x-action=upload", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ path: "siyanaoneserve/images/ticket-1/a.png" }),
    } as Response);
    const file = new File(["hello"], "a.png", { type: "image/png" });
    await expect(uploadToAzure("ticket-1", file)).resolves.toBe("siyanaoneserve/images/ticket-1/a.png");
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("/functions/v1/sosticket-azure-sas");
    expect((init as RequestInit).headers).toMatchObject({
      "x-action": "upload",
      "x-token": "session-token",
      "x-ticket-id": "ticket-1",
      "x-file-name": "a.png",
    });
    expect((init as RequestInit).body).toBe(file);
  });

  it("requests a read SAS for download", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://siyanastorage.blob.core.windows.net/file?sv=2021-08-06&sig=abc" }),
    } as Response);
    const url = await azureDownloadUrl("siyanaoneserve/files/ticket-1/doc.pdf");
    expect(url).toContain("sv=2021-08-06");
    expect(JSON.parse(String((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body))).toEqual({
      token: "session-token",
      action: "download",
      blobPath: "siyanaoneserve/files/ticket-1/doc.pdf",
    });
  });

  it("surfaces function and network failures", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(uploadToAzure("ticket-1", new File(["x"], "a.png"))).rejects.toThrow(
      "Unable to reach Azure upload service",
    );
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Invalid session" }),
    } as Response);
    await expect(azureDownloadUrl("path")).rejects.toThrow("Invalid session");
  });
});
