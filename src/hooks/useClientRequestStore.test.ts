import { beforeEach, describe, expect, it, vi } from "vitest";
import { approveRequest, updateRequestStatus } from "@/hooks/useClientRequestStore";

vi.mock("@/services/api", () => ({
  api: {
    rejectTicket: vi.fn(),
    updateTicket: vi.fn(),
    approveTicket: vi.fn(),
  },
}));

import { api } from "@/services/api";

describe("client request mutations", () => {
  beforeEach(() => {
    vi.mocked(api.rejectTicket).mockReset();
    vi.mocked(api.updateTicket).mockReset();
    vi.mocked(api.approveTicket).mockReset();
  });

  it("routes Rejected through rejectTicket and other statuses through updateTicket", async () => {
    await updateRequestStatus("ticket-1", "Rejected");
    expect(api.rejectTicket).toHaveBeenCalledWith("ticket-1");
    await updateRequestStatus("ticket-1", "In Progress");
    expect(api.updateTicket).toHaveBeenCalledWith({ id: "ticket-1", status: "In Progress" });
  });

  it("approves Need Approval tickets via the dedicated RPC", async () => {
    await approveRequest("ticket-1");
    expect(api.approveTicket).toHaveBeenCalledWith("ticket-1");
  });
});
