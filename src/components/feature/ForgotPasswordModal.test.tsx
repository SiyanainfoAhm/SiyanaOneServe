import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordModal from "@/components/feature/ForgotPasswordModal";

const forgotPassword = vi.fn();

vi.mock("@/services/api", () => ({
  api: {
    forgotPassword: (...args: unknown[]) => forgotPassword(...args),
  },
}));

describe("ForgotPasswordModal", () => {
  it("rejects an address without @", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordModal email="" onClose={vi.fn()} />);
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Send new password" }));
    expect(screen.getByText("Enter the email address you use to sign in.")).toBeInTheDocument();
    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it("shows the success copy after Power Automate accepts the reset", async () => {
    const user = userEvent.setup();
    forgotPassword.mockResolvedValue({ ok: true, portal: "client" });
    render(<ForgotPasswordModal email="jatin.saksena@siyanainfo.com" onClose={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Send new password" }));
    expect(await screen.findByText(/A new password was sent to/)).toBeInTheDocument();
    expect(screen.getByText(/Government Client Portal/)).toBeInTheDocument();
  });

  it("surfaces unknown-email errors from the edge function", async () => {
    const user = userEvent.setup();
    forgotPassword.mockRejectedValue(new Error("No OneServe account uses this email."));
    render(<ForgotPasswordModal email="missing@example.com" onClose={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Send new password" }));
    expect(await screen.findByText("No OneServe account uses this email.")).toBeInTheDocument();
  });
});
