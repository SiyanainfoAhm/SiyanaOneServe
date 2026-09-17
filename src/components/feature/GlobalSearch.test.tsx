import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GlobalSearch from "@/components/feature/GlobalSearch";
import { clientUser, makeProject, makeTicket, makeUser } from "@/test/fixtures";

const navigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return { ...actual, useNavigate: () => navigate };
});

vi.mock("@/context/AppDataContext", () => ({
  useAppData: () => ({
    loading: false,
    tickets: [makeTicket()],
    projects: [makeProject()],
    users: [makeUser(), clientUser],
  }),
}));

vi.mock("@/hooks/useProjectScope", () => ({
  setScopedProject: vi.fn(),
}));

function renderSearch(mode: "console" | "client" = "console") {
  return render(
    <MemoryRouter>
      <GlobalSearch mode={mode} placeholder="Search tickets, projects, people" />
    </MemoryRouter>,
  );
}

describe("GlobalSearch", () => {
  it("finds tickets, projects, and people on the console", async () => {
    const user = userEvent.setup();
    renderSearch("console");
    const input = screen.getByLabelText("Search tickets, projects, people");
    await user.type(input, "CCSHAU");
    expect(await screen.findByText("CCSHAU-2026-00001")).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "OneServe");
    expect(await screen.findByText("OneServe")).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "Arjun");
    expect(await screen.findByText("Arjun Mehta")).toBeInTheDocument();
  });

  it("keeps government search hits inside /client and omits people", async () => {
    const user = userEvent.setup();
    renderSearch("client");
    await user.type(screen.getByLabelText("Search tickets, projects, people"), "CCSHAU");
    const ticket = await screen.findByText("CCSHAU-2026-00001");
    expect(ticket.closest("a")).toHaveAttribute("href", "/client/requests/ticket-1");
    expect(screen.queryByText("Arjun Mehta")).not.toBeInTheDocument();
  });

  it("navigates to the queue search when Enter is pressed with no hit", async () => {
    const user = userEvent.setup();
    renderSearch("console");
    const input = screen.getByLabelText("Search tickets, projects, people");
    await user.type(input, "zzzz{Enter}");
    expect(navigate).toHaveBeenCalledWith("/console/queue?q=zzzz");
  });
});
