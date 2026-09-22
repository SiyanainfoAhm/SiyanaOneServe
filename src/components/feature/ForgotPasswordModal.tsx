/**
 * Resets the custom password and emails it through Power Automate.
 *
 * Do not test against demo logins (arjun.mehta@siyana.in) — reset overwrites siyana@2026.
 * Unknown emails return a real error from the edge function, not a silent ok.
 */
import { useState } from "react";
import Button from "@/components/base/Button";
import ModalOverlay from "@/components/base/ModalOverlay";
import { api } from "@/services/api";

interface ForgotPasswordModalProps {
  email: string;
  onClose: () => void;
}

export default function ForgotPasswordModal({ email, onClose }: ForgotPasswordModalProps) {
  const [value, setValue] = useState(email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [portal, setPortal] = useState<"client" | "console" | "">("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim() || !value.includes("@")) {
      setError("Enter the email address you use to sign in.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const result = await api.forgotPassword(value.trim());
      setPortal(result.portal ?? "");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset this password.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalOverlay>
      <div className="w-full max-w-md rounded-lg border border-background-200 bg-background-50 shadow-lg">
        <div className="flex items-center justify-between border-b border-background-200 px-5 py-4">
          <div>
            <h3 className="font-heading text-[15px] font-semibold text-foreground-950">
              {sent ? "Check your email" : "Forgot password"}
            </h3>
            <p className="mt-0.5 text-xs text-foreground-500">
              {sent
                ? "A new password was emailed from tickets@siyanainfo.com"
                : "We will email a new password from tickets@siyanainfo.com"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <i className="ri-close-line text-[18px] leading-none"></i>
          </button>
        </div>

        {sent ? (
          <div className="px-5 py-5">
            <div className="flex items-start gap-3">
              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-accent-100 shrink-0">
                <i className="ri-mail-check-line text-accent-700 text-[20px] leading-none"></i>
              </span>
              <p className="text-sm text-foreground-700">
                A new password was sent to <span className="font-medium text-foreground-900">{value.trim()}</span>.
                Sign in at the {portal === "client" ? "Government Client Portal" : "Operations Console"}, then change
                it from Settings.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <Button variant="primary" onClick={onClose}>
                Back to sign in
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-5 py-5" noValidate>
            <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
              Email / User ID
            </label>
            <input
              id="forgot-email"
              type="email"
              value={value}
              onChange={(event) => {
                setValue(event.target.value);
                setError("");
              }}
              autoComplete="username"
              className="h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            {error ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-[oklch(var(--status-danger))]">
                <i className="ri-error-warning-line text-[15px] leading-none"></i>
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Sending…" : "Send new password"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </ModalOverlay>
  );
}
