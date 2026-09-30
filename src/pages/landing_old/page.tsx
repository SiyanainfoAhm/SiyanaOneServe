/**
 * Public chooser: Operations Console vs Government Client Portal.
 * Signed-in users bounce to their home dashboard.
 */
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const CONSOLE_POINTS = [
  "Review and triage every incoming request",
  "Assign teams and track SLA in real time",
  "Verify, resolve, and audit against every ticket",
];

const CLIENT_POINTS = [
  "Raise service requests in plain language",
  "Upload documents and track progress",
  "Verify and close completed work",
];

const TRUST_ITEMS = [
  { icon: "ri-shield-check-line", label: "Government-grade security" },
  { icon: "ri-history-line", label: "Full audit trail" },
  { icon: "ri-timer-flash-line", label: "SLA governance" },
  { icon: "ri-wheelchair-line", label: "WCAG-friendly access" },
];

export default function Landing() {
  const { ready, user } = useAuth();
  if (!ready) return null;
  if (user) {
    return <Navigate to={user.portal === "client" ? "/client/dashboard" : "/console/dashboard"} replace />;
  }

  return (
    <div className="relative min-h-screen bg-background-100 flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-primary-100/50 blur-3xl"></div>
        <div className="absolute top-1/3 -left-32 w-[420px] h-[420px] rounded-full bg-accent-100/40 blur-3xl"></div>
      </div>

      <header className="relative z-10 flex h-16 items-center justify-between px-6 md:px-10 border-b border-background-200 bg-background-50/70 backdrop-blur">
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer">
          <span className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
            <i className="ri-government-line text-background-50 text-[18px] leading-none"></i>
          </span>
          <span className="font-heading text-sm font-bold text-foreground-950">Siyana OneServe</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-background-300 bg-background-50 px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
          <span className="text-[11px] font-label font-medium text-foreground-600">
            Secure environment
          </span>
        </span>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-[1080px] cos-animate-in">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary-200 bg-secondary-100 px-3.5 py-1.5">
              <i className="ri-building-line text-secondary-700 text-[14px] leading-none"></i>
              <span className="text-[11px] font-label font-semibold uppercase tracking-wider text-secondary-900">
                Unified Government IT Service Management
              </span>
            </span>
            <h1 className="mt-5 font-heading text-3xl md:text-4xl font-bold text-foreground-950 tracking-tight">
              Choose your Siyana OneServe workspace
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm md:text-base text-foreground-500 leading-relaxed">
              A single platform for government departments to raise and track IT requests, and for
              Siyana teams to review, assign, resolve, and govern every project.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-lg border border-background-200 bg-background-50 p-6 flex flex-col">
              <div className="flex items-start justify-between">
                <span className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <i className="ri-shield-user-line text-primary-700 text-[24px] leading-none"></i>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                  <span className="text-[10px] font-label font-semibold uppercase tracking-wide text-accent-700">
                    Available
                  </span>
                </span>
              </div>
              <h2 className="mt-5 font-heading text-lg font-bold text-foreground-950">
                Siyana Operations Console
              </h2>
              <p className="mt-1.5 text-sm text-foreground-500">
                For Super Admin, Operations, Project Managers, BA, Developers and Testers.
              </p>
              <ul className="mt-5 flex flex-col gap-2.5 flex-1">
                {CONSOLE_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
                      <i className="ri-check-line text-primary-600 text-[15px] leading-none"></i>
                    </span>
                    <span className="text-sm text-foreground-700">{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/console/signin"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary-600 px-5 text-sm font-medium text-background-50 hover:bg-primary-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign in to console
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-right-line text-[15px] leading-none"></i>
                </span>
              </Link>
            </div>

            <div className="rounded-lg border border-background-200 bg-background-50 p-6 flex flex-col">
              <div className="flex items-start justify-between">
                <span className="w-12 h-12 rounded-lg bg-accent-100 flex items-center justify-center">
                  <i className="ri-building-2-line text-accent-700 text-[24px] leading-none"></i>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-500"></span>
                  <span className="text-[10px] font-label font-semibold uppercase tracking-wide text-accent-700">
                    Available
                  </span>
                </span>
              </div>
              <h2 className="mt-5 font-heading text-lg font-bold text-foreground-900">
                Government Client Portal
              </h2>
              <p className="mt-1.5 text-sm text-foreground-500">
                For Government Requesters and Nodal Officers across departments.
              </p>
              <ul className="mt-5 flex flex-col gap-2.5 flex-1">
                {CLIENT_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
                      <i className="ri-check-line text-accent-600 text-[15px] leading-none"></i>
                    </span>
                    <span className="text-sm text-foreground-700">{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/client/signin"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent-600 px-5 text-sm font-medium text-background-50 hover:bg-accent-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign in to client portal
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-arrow-right-line text-[15px] leading-none"></i>
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {TRUST_ITEMS.map((item) => (
              <span key={item.label} className="flex items-center gap-2">
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className={`${item.icon} text-foreground-400 text-[16px] leading-none`}></i>
                </span>
                <span className="text-xs text-foreground-500">{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-background-200 bg-background-50 py-5">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-2 px-6 sm:flex-row">
          <p className="text-[11px] text-foreground-500">
            © 2026 Siyana Info Solutions Pvt. Ltd. · Siyana OneServe
          </p>
          <p className="text-[11px] text-foreground-500">
            Government IT Service Management & Support Portal
          </p>
        </div>
      </footer>
    </div>
  );
}