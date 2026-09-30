import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { makeUser } from "@/test/fixtures";
import ConsoleSignin from "./page";

const login = vi.fn();
vi.mock("@/services/api", () => ({
  api: { login: (...args: unknown[]) => login(...args) },
}));

describe("shared staff sign-in", () => {
  it.each([
    ["operations_admin", "console"],
    ["government_nodal_officer", "client"],
    ["government_requester", "client"],
  ])("routes %s to its %s dashboard", async (role, portal) => {
    login.mockResolvedValue({ token: "shared-token", user: makeUser({ role_key: role }) });
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/console/signin"]}>
          <Routes>
            <Route path="/console/signin" element={<ConsoleSignin />} />
            <Route path="/console/dashboard" element={<p>Staff dashboard</p>} />
            <Route path="/client/dashboard" element={<p>Government dashboard</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    await user.type(screen.getByLabelText("Email / User ID"), "person@example.com");
    await user.type(screen.getByLabelText("Password", { exact: true }), "password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText(portal === "client" ? "Government dashboard" : "Staff dashboard")).toBeInTheDocument();
    expect(login).toHaveBeenLastCalledWith("person@example.com", "password", true, null);
    expect(localStorage.getItem("sosticket_token")).toBe("shared-token");
  });
});
