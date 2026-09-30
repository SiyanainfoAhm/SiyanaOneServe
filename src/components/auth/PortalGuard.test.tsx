import { describe, expect, it, vi } from "vitest";
import type { ReactElement } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { GuestOnly, PortalGuard } from "@/components/auth/PortalGuard";
import { clientUser, makeUser } from "@/test/fixtures";

const authState: {
  ready: boolean;
  user: ReturnType<typeof makeUser> | null;
} = {
  ready: true,
  user: null,
};

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => authState,
}));

function renderAt(path: string, ui: ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={path} element={ui} />
        <Route path="/signin" element={<p>shared-signin</p>} />
        <Route path="/console/dashboard" element={<p>console-home</p>} />
        <Route path="/client/dashboard" element={<p>client-home</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("PortalGuard", () => {
  it("shows a loading screen until the session hydrates", () => {
    authState.ready = false;
    authState.user = null;
    renderAt("/console/queue", <PortalGuard portal="console">queue</PortalGuard>);
    expect(screen.getByText("Loading workspace…")).toBeInTheDocument();
  });

  it.each(["console", "client"] as const)("sends %s guests to the shared sign-in page", (portal) => {
    authState.ready = true;
    authState.user = null;
    renderAt(`/${portal}/dashboard`, <PortalGuard portal={portal}>dashboard</PortalGuard>);
    expect(screen.getByText("shared-signin")).toBeInTheDocument();
  });

  it("renders children when the signed-in portal matches", () => {
    authState.ready = true;
    authState.user = makeUser();
    renderAt("/console/queue", <PortalGuard portal="console">queue</PortalGuard>);
    expect(screen.getByText("queue")).toBeInTheDocument();
  });

  it("bounces a government user off the console shell", () => {
    authState.ready = true;
    authState.user = clientUser;
    renderAt("/console/queue", <PortalGuard portal="console">queue</PortalGuard>);
    expect(screen.getByText("client-home")).toBeInTheDocument();
  });
});

describe("GuestOnly", () => {
  it("renders sign-in when there is no session", () => {
    authState.ready = true;
    authState.user = null;
    renderAt("/signin", <GuestOnly>signin-form</GuestOnly>);
    expect(screen.getByText("signin-form")).toBeInTheDocument();
  });

  it("sends a signed-in staff user to the console dashboard", () => {
    authState.ready = true;
    authState.user = makeUser();
    renderAt("/signin", <GuestOnly>signin-form</GuestOnly>);
    expect(screen.getByText("console-home")).toBeInTheDocument();
  });
});
