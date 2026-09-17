/**
 * All SPA routes. `/console/*` is staff-only; `/client/*` is government-only.
 * Guest sign-in pages sit outside PortalGuard so they can collect credentials.
 */
import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { GuestOnly, PortalGuard } from "@/components/auth/PortalGuard";
import NotFound from "@/pages/NotFound";
import Landing from "@/pages/landing/page";
import ConsoleSignin from "@/pages/console/signin/page";
import ConsoleDashboard from "@/pages/console/dashboard/page";
import ConsoleCreate from "@/pages/console/create/page";
import ConsoleQueue from "@/pages/console/queue/page";
import ConsoleWorkbench from "@/pages/console/tickets/page";
import ConsoleProjects from "@/pages/console/projects/page";
import ConsoleProjectDetail from "@/pages/console/projects/detail/page";
import ConsoleReports from "@/pages/console/reports/page";
import ConsoleUsers from "@/pages/console/users/page";
import ConsoleNotifications from "@/pages/console/notifications/page";
import ConsoleSettings from "@/pages/console/settings/page";
import ClientSignin from "@/pages/client/signin/page";
import ClientDashboard from "@/pages/client/dashboard/page";
import ClientCreate from "@/pages/client/create/page";
import ClientMyRequests from "@/pages/client/requests/page";
import ClientRequestDetail from "@/pages/client/requests/detail/page";
import ClientNotifications from "@/pages/client/notifications/page";
import ClientProfile from "@/pages/client/profile/page";

function consolePage(element: ReactNode) {
  return <PortalGuard portal="console">{element}</PortalGuard>;
}

function clientPage(element: ReactNode) {
  return <PortalGuard portal="client">{element}</PortalGuard>;
}

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/console",
    element: <Navigate to="/console/dashboard" replace />,
  },
  {
    path: "/console/signin",
    element: (
      <GuestOnly portal="console">
        <ConsoleSignin />
      </GuestOnly>
    ),
  },
  {
    path: "/console/dashboard",
    element: consolePage(<ConsoleDashboard />),
  },
  {
    path: "/console/create",
    element: consolePage(<ConsoleCreate />),
  },
  {
    path: "/console/queue",
    element: consolePage(<ConsoleQueue />),
  },
  {
    path: "/console/tickets/:id",
    element: consolePage(<ConsoleWorkbench />),
  },
  {
    path: "/console/projects",
    element: consolePage(<ConsoleProjects />),
  },
  {
    path: "/console/projects/:code",
    element: consolePage(<ConsoleProjectDetail />),
  },
  {
    path: "/console/reports",
    element: consolePage(<ConsoleReports />),
  },
  {
    path: "/console/users",
    element: consolePage(<ConsoleUsers />),
  },
  {
    path: "/console/notifications",
    element: consolePage(<ConsoleNotifications />),
  },
  {
    path: "/console/settings",
    element: consolePage(<ConsoleSettings />),
  },
  {
    path: "/client",
    element: <Navigate to="/client/dashboard" replace />,
  },
  {
    path: "/client/signin",
    element: (
      <GuestOnly portal="client">
        <ClientSignin />
      </GuestOnly>
    ),
  },
  {
    path: "/client/dashboard",
    element: clientPage(<ClientDashboard />),
  },
  {
    path: "/client/create",
    element: clientPage(<ClientCreate />),
  },
  {
    path: "/client/requests",
    element: clientPage(<ClientMyRequests />),
  },
  {
    path: "/client/requests/:id",
    element: clientPage(<ClientRequestDetail />),
  },
  {
    path: "/client/notifications",
    element: clientPage(<ClientNotifications />),
  },
  {
    path: "/client/profile",
    element: clientPage(<ClientProfile />),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;