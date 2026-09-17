import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendForgotPasswordEmail, sendTestEmail } from "@/lib/testEmail";

describe("Power Automate mail client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("posts action=test and action=forgot as JSON", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, portal: "console", email: "jatin.saksena@siyanainfo.com" }),
    } as Response);

    await sendTestEmail("jatin.saksena@siyanainfo.com");
    await sendForgotPasswordEmail("jatin.saksena@siyanainfo.com");

    expect(fetch).toHaveBeenCalledTimes(2);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toContain("/functions/v1/sosticket-test-email");
    expect(JSON.parse(String((init as RequestInit).body))).toEqual({
      email: "jatin.saksena@siyanainfo.com",
      action: "test",
    });
    expect(JSON.parse(String((vi.mocked(fetch).mock.calls[1][1] as RequestInit).body))).toEqual({
      email: "jatin.saksena@siyanainfo.com",
      action: "forgot",
    });
  });

  it("throws the function error when the email is not registered", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ ok: false, error: "No OneServe account uses this email." }),
    } as Response);
    await expect(sendForgotPasswordEmail("unknown@example.com")).rejects.toThrow(
      "No OneServe account uses this email.",
    );
  });
});
