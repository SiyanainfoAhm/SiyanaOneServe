import { describe, expect, it } from "vitest";
import { toQueueTicket } from "@/hooks/useConsoleTicketStore";
import { toClientDetail, toClientRequest } from "@/hooks/useClientRequestStore";
import { generateProjectCode, toProject } from "@/hooks/useProjectStore";
import { makeProject, makeTicket } from "@/test/fixtures";

describe("ticket and project mappers", () => {
  it("maps a TicketRecord onto a queue row", () => {
    const row = toQueueTicket(makeTicket({ due_in_seconds: 120, window_seconds: 4800 }));
    expect(row).toMatchObject({
      id: "ticket-1",
      title: "Portal login delay",
      project: "OneServe",
      status: "New",
    });
  });

  it("maps a TicketRecord onto a client request and detail", () => {
    const ticket = makeTicket({
      request_type: "Bug",
      waiting_on_me: true,
      team: "Unassigned",
      messages: [
        {
          id: "m1",
          author: "Meera",
          initials: "MJ",
          kind: "client",
          role: "Nodal Officer",
          visibility: "client",
          body: "Please help",
          time: "10:00",
          created_at: "2026-09-16T10:00:00Z",
        },
      ],
      events: [
        {
          id: "e1",
          time: "10:01",
          date: "16 Sep",
          type: "created",
          title: "Created",
          note: null,
          actor: "Meera",
          tone: "primary",
        },
      ],
      attachments: [
        {
          id: "a1",
          name: "shot.png",
          file_path: "siyanaoneserve/images/ticket-1/shot.png",
          size: "12 KB",
          kind: "image",
          created_at: "2026-09-16T10:00:00Z",
        },
      ],
    });
    expect(toClientRequest(ticket)).toMatchObject({
      project: "OneServe",
      status: "New",
    });
    const detail = toClientDetail(ticket);
    expect(detail.assignedTeam).toBe("Siyana Support Team");
    expect(detail.messages[0].kind).toBe("client");
    expect(detail.attachments[0].filePath).toBe("siyanaoneserve/images/ticket-1/shot.png");
  });

  it("maps a ProjectRecord and generates a project code", () => {
    expect(toProject(makeProject()).code).toBe("CCS-001");
    expect(generateProjectCode("Chaudhary Charan Singh Haryana", 0)).toBe("CCS-100");
    expect(generateProjectCode("", 5)).toBe("PRJ-105");
  });
});
