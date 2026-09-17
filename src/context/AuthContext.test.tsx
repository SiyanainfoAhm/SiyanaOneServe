import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { makeUser } from "@/test/fixtures";

const login = vi.fn();
const logout = vi.fn();
const session = vi.fn();

vi.mock("@/services/api", () => ({
  api: {
    login: (...args: unknown[]) => login(...args),
    logout: (...args: unknown[]) => logout(...args),
    session: (...args: unknown[]) => session(...args),
  },
}));

function Probe() {
  const auth = useAuth();
  return (
    <div>
      <p>ready:{String(auth.ready)}</p>
      <p>portal:{auth.portal ?? "none"}</p>
      <p>user:{auth.user?.email ?? "guest"}</p>
      <button type="button" onClick={() => void auth.login("a@b.c", "pw", true, "console")}>
        sign-in
      </button>
      <button type="button" onClick={() => void auth.logout()}>
        sign-out
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  it("hydrates as guest when no token is stored", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText("ready:true")).toBeInTheDocument());
    expect(screen.getByText("user:guest")).toBeInTheDocument();
    expect(session).not.toHaveBeenCalled();
  });

  it("stores the custom token after a console login", async () => {
    const user = userEvent.setup();
    const staff = makeUser();
    login.mockResolvedValue({ token: "tok-1", user: staff });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByText("ready:true")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "sign-in" }));
    expect(login).toHaveBeenCalledWith("a@b.c", "pw", true, "console");
    await waitFor(() => expect(screen.getByText("user:arjun.mehta@siyana.in")).toBeInTheDocument());
    expect(screen.getByText("portal:console")).toBeInTheDocument();
    expect(localStorage.getItem("sosticket_token")).toBe("tok-1");
  });
});
