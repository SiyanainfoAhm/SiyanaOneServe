import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/api", () => ({
  api: {
    updateTicket: vi.fn(),
  },
}));

import { api } from "@/services/api";
import { updateRequestStatus } from "@/hooks/useClientRequestStore";

describe("useClientRequestStore status updates", () => {
  beforeEach(() => {
    vi.mocked(api.updateTicket).mockReset();
  });

  it("routes every status through updateTicket", async () => {
    await updateRequestStatus("ticket-1", "In Progress");
    expect(api.updateTicket).toHaveBeenCalledWith({ id: "ticket-1", status: "In Progress" });
  });
});
