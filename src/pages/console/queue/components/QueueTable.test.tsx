import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import QueueTable from "@/pages/console/queue/components/QueueTable";
import type { QueueTicket } from "@/mocks/consoleQueue";

const ticket: QueueTicket = {
  id: "SIYANA-2026-00047",
  title: "Vercel Link",
  organization: "Siyana",
  project: "General Tasks",
  status: "Resolved",
  priority: "Normal",
  assignee: "Jatin Saksena",
  requester: "Shashank Sharma",
  team: "Operations",
  created: "2026-10-05",
};

describe("QueueTable navigation", () => {
  it("opens the selected ticket from its ticket ID", () => {
    render(
      <MemoryRouter initialEntries={["/console/queue?assignee=Jatin%20Saksena"]}>
        <Routes>
          <Route
            path="/console/queue"
            element={
              <QueueTable
                rows={[ticket]}
                selected={[]}
                onToggle={() => undefined}
                onToggleAll={() => undefined}
                allSelected={false}
                sort={{ key: "created", dir: "desc" }}
                onSort={() => undefined}
              />
            }
          />
          <Route path="/console/tickets/:id" element={<p>Ticket view opened</p>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: ticket.id }));

    expect(screen.getByText("Ticket view opened")).toBeInTheDocument();
  });
});
