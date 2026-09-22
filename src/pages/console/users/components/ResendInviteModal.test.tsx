import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResendInviteModal from "@/pages/console/users/components/ResendInviteModal";
import type { ConsoleUser } from "@/mocks/consoleUsers";

const user: ConsoleUser = {
  id: "u1",
  name: "Mihir Shah",
  initials: "MS",
  email: "mihir@siyanainfo.com",
  role: "Developer",
  team: "Development Team",
  organization: "Siyana",
  type: "staff",
  status: "Active",
  openTickets: 0,
  lastActive: "Never",
};

describe("ResendInviteModal", () => {
  it("confirms then shows the resent invitation details", async () => {
    const clicker = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ResendInviteModal user={user} password="SiyMih@16" onClose={() => undefined} onConfirm={onConfirm} />,
    );

    expect(screen.getByRole("heading", { name: "Resend Invitation" })).toBeInTheDocument();
    await clicker.click(screen.getByRole("button", { name: "Resend Invitation" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("heading", { name: "Invitation Resent" })).toBeInTheDocument();
    expect(screen.getByText("SiyMih@16")).toBeInTheDocument();
    expect(screen.getByText("An email was sent to mihir@siyanainfo.com")).toBeInTheDocument();
  });
});
