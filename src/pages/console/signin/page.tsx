/**
 * Operations Console sign-in.
 *
 * login(..., "console") — government nodal/requester roles are rejected by sosticket_login.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "@/components/base/Button";
import ForgotPasswordModal from "@/components/feature/ForgotPasswordModal";
import { useAuth } from "@/context/AuthContext";

const HIGHLIGHTS = [
  { icon: "ri-shield-keyhole-line", text: "Role-based access for every Siyana team" },
  { icon: "ri-timer-flash-line", text: "Real-time SLA tracking across all projects" },
  { icon: "ri-history-line", text: "Complete audit history on every ticket" },
];

export default function ConsoleSignin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter both your User ID and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Hard-lock: staff cannot use this form; RPC also rejects government roles on /console/signin.
      await login(email.trim(), password, keepSignedIn, "console");
      navigate("/console/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background-50">
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-[420px]">
          <Link to="/" className="inline-flex items-center gap-2.5 cursor-pointer">
            <span className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <i className="ri-government-line text-background-50 text-[20px] leading-none"></i>
            </span>
            <span>
              <span className="block font-heading text-base font-bold text-foreground-950 leading-tight">
                Siyana OneServe
              </span>
              <span className="block text-[11px] text-foreground-500 leading-tight">
                Internal Operations Console
              </span>
            </span>
          </Link>

          <h1 className="mt-8 font-heading text-2xl font-bold text-foreground-950">
            Siyana staff sign in
          </h1>
          <p className="mt-2 text-sm text-foreground-500">
            Access the operations console to manage government projects, tickets, and SLA.
          </p>

          <form className="mt-7 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="console-email" className="block text-xs font-label font-semibold text-foreground-800 mb-1.5">
                Email / User ID
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                  <i className="ri-user-line text-foreground-400 text-[16px] leading-none"></i>
                </span>
                <input
                  id="console-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@siyana.in"
                  className="w-full h-11 rounded-md border border-background-300 bg-background-50 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="console-password" className="block text-xs font-label font-semibold text-foreground-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                  <i className="ri-lock-2-line text-foreground-400 text-[16px] leading-none"></i>
                </span>
                <input
                  id="console-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 rounded-md border border-background-300 bg-background-50 pl-9 pr-10 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-foreground-400 hover:text-foreground-700 hover:bg-background-100 transition-colors cursor-pointer"
                >
                  <i className={`${showPassword ? "ri-eye-off-line" : "ri-eye-line"} text-[16px] leading-none`}></i>
                </button>
              </div>
            </div>

            {error ? (
              <p className="flex items-center gap-1.5 text-xs text-[oklch(var(--status-danger))]">
                <i className="ri-error-warning-line text-[15px] leading-none"></i>
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-foreground-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(event) => setKeepSignedIn(event.target.checked)}
                  className="w-4 h-4 rounded border-background-300 accent-primary-600 cursor-pointer"
                />
                Keep me signed in
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs font-medium text-primary-700 hover:text-primary-800 cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-background-200 bg-background-100 p-3.5">
            <span className="w-4 h-4 flex items-center justify-center mt-0.5 shrink-0">
              <i className="ri-shield-keyhole-line text-accent-700 text-[16px] leading-none"></i>
            </span>
            <p className="text-[11px] leading-relaxed text-foreground-600">
              Authorized personnel only. All activity on this portal is logged and audited in line
              with government IT security policy. Never share your credentials.
            </p>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block lg:w-1/2 overflow-hidden">
        <img
          src="https://readdy.ai/api/search-image?query=Abstract%20stylized%20government%20architecture%20facade%20with%20tall%20vertical%20columns%2C%20deep%20navy%20and%20steel%20blue%20tones%2C%20soft%20geometric%20light%20and%20shadow%2C%20minimal%20editorial%20photography%2C%20calm%20trustworthy%20institutional%20mood%2C%20high%20detail&width=1200&height=1600&seq=siyana-console-portrait-01&orientation=portrait"
          alt="Abstract government architecture facade"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-950/85 via-primary-900/70 to-primary-950/90"></div>

        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2 rounded-full border border-primary-200/30 bg-primary-900/40 px-3.5 py-1.5 self-start backdrop-blur">
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-government-line text-primary-100 text-[15px] leading-none"></i>
            </span>
            <span className="text-xs font-label font-medium text-primary-100">
              Siyana Info Solutions Pvt. Ltd.
            </span>
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold text-background-50 leading-tight">
              One console for every government project.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-100/85">
              Review incoming requests, assign teams, resolve issues, track SLA, and maintain a
              complete audit trail — all from a single operational workspace.
            </p>

            <div className="mt-8 flex flex-col gap-3.5">
              {HIGHLIGHTS.map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-md bg-background-50/10 border border-background-50/15 flex items-center justify-center shrink-0">
                    <i className={`${item.icon} text-background-50 text-[17px] leading-none`}></i>
                  </span>
                  <span className="text-sm text-primary-100/90">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-primary-100/60">
            © 2026 Siyana Info Solutions Pvt. Ltd. · Government IT Service Management Platform
          </p>
        </div>
      </div>
      {forgotOpen ? <ForgotPasswordModal email={email} onClose={() => setForgotOpen(false)} /> : null}
    </div>
  );
}