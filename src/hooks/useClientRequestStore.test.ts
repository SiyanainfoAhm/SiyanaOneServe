import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateRequestStatus } from "@/hooks/useClientRequestStore";

vi.mock("@/services/api", () => ({
  api: {
    rejectTicket: vi.fn(),
    updateTicket: vi.fn(),
  },
}));

import { api } from "@/services/api";

describe("client request mutations", () => {
  beforeEach(() => {
    vi.mocked(api.rejectTicket).mockReset();
    vi.mocked(api.updateTicket).mockReset();
  });

  it("routes Rejected through rejectTicket and other statuses through updateTicket", async () => {
    await updateRequestStatus("ticket-1", "Rejected", "Out of scope");
    expect(api.rejectTicket).toHaveBeenCalledWith("ticket-1", "Out of scope");
    await updateRequestStatus("ticket-1", "In Progress");
    expect(api.updateTicket).toHaveBeenCalledWith({ id: "ticket-1", status: "In Progress" });
  });
});
