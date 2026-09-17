/**
 * Route guards.
 *
 * PortalGuard: must be signed in AND `user.portal` must match this shell.
 * GuestOnly: bounce signed-in users to their home dashboard.
 * Login itself also enforces portal vs role in `sosticket_login`.
 */
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Portal } from "@/types/oneserve";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background-100 flex items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-foreground-600">
        <span className="w-5 h-5 rounded-full border-2 border-primary-200 border-t-primary-600 animate-spin" />
        Loading workspace…
      </div>
    </div>
  );
}

export function PortalGuard({ portal, children }: { portal: Portal; children: ReactNode }) {
  const { ready, user } = useAuth();
  const location = useLocation();

  if (!ready) return <LoadingScreen />;
  if (!user) {
    return <Navigate to={portal === "console" ? "/console/signin" : "/client/signin"} replace state={{ from: location.pathname }} />;
  }
  if (user.portal !== portal) {
    // Wrong shell (e.g. staff token hitting /client/*) — send them home, do not render.
    return <Navigate to={user.portal === "client" ? "/client/dashboard" : "/console/dashboard"} replace />;
  }
  return <>{children}</>;
}

export function GuestOnly({ portal, children }: { portal: Portal; children: ReactNode }) {
  const { ready, user } = useAuth();
  if (!ready) return <LoadingScreen />;
  if (user) {
    return <Navigate to={user.portal === "client" ? "/client/dashboard" : "/console/dashboard"} replace />;
  }
  return <>{children}</>;
}
