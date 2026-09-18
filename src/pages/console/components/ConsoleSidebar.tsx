/**
 * Staff nav: dashboard, create, queue, projects, reports, users, settings.
 */
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  label: string;
  to: string;
  icon: string;
}

const NAV_PRIMARY: NavItem[] = [
  { label: "Global Dashboard", to: "/console/dashboard", icon: "ri-dashboard-3-line" },
  { label: "Create Request", to: "/console/create", icon: "ri-add-circle-line" },
  { label: "Ticket Queue", to: "/console/queue", icon: "ri-inbox-archive-line" },
  { label: "Projects", to: "/console/projects", icon: "ri-folders-line" },
  { label: "Reports", to: "/console/reports", icon: "ri-bar-chart-2-line" },
];

const NAV_SECONDARY: NavItem[] = [
  { label: "Users", to: "/console/users", icon: "ri-team-line" },
  { label: "Settings", to: "/console/settings", icon: "ri-settings-3-line" },
];

function NavRow({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 cursor-pointer ${
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-foreground-600 hover:bg-background-100 hover:text-foreground-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full transition-opacity ${
              isActive ? "bg-primary-600 opacity-100" : "opacity-0"
            }`}
          ></span>
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            <i className={`${item.icon} text-[17px] leading-none`}></i>
          </span>
          <span className="truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function ConsoleSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await logout();
    navigate("/console/signin");
  }
  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-foreground-950/40 backdrop-blur-[1px] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      ) : null}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[248px] shrink-0 border-r border-background-200 bg-background-50 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2.5 px-5 border-b border-background-200">
          <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
            <span className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <i className="ri-government-line text-background-50 text-[18px] leading-none"></i>
            </span>
            <span className="min-w-0">
              <span className="block font-heading text-sm font-bold text-foreground-950 leading-tight">
                Siyana OneServe
              </span>
              <span className="block text-[11px] text-foreground-500 leading-tight">
                Operations Console
              </span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto w-8 h-8 rounded-md flex items-center justify-center text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer lg:hidden"
            aria-label="Close navigation"
          >
            <i className="ri-close-line text-[18px] leading-none"></i>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-400">
            Operations
          </p>
          <div className="flex flex-col gap-0.5">
            {NAV_PRIMARY.map((item) => (
              <NavRow key={item.to} item={item} onNavigate={onClose} />
            ))}
          </div>

          <p className="px-3 pb-2 pt-5 text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-400">
            Administration
          </p>
          <div className="flex flex-col gap-0.5">
            {NAV_SECONDARY.map((item) => (
              <NavRow key={item.to} item={item} onNavigate={onClose} />
            ))}
          </div>
        </nav>

        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              void handleSignOut();
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground-600 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
          >
            <span className="w-5 h-5 flex items-center justify-center">
              <i className="ri-logout-box-r-line text-[17px] leading-none"></i>
            </span>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}