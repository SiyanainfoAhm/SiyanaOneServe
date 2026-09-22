/**
 * Confirm and preview a resent invitation mail.
 */
import { useState } from "react";
import Button from "@/components/base/Button";
import ModalOverlay from "@/components/base/ModalOverlay";
import type { ConsoleUser } from "@/mocks/consoleUsers";

const GOVERNMENT_ROLES = ["Government Nodal Officer", "Government Requester"];

interface ResendInviteModalProps {
  user: ConsoleUser;
  password: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function ResendInviteModal({ user, password, onClose, onConfirm }: ResendInviteModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleConfirm() {
    setSaving(true);
    setError("");
    try {
      await onConfirm();
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend this invitation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalOverlay>
      <div className="w-full max-w-xl rounded-lg border border-background-200 bg-background-50 shadow-lg">
        <div className="flex items-center justify-between border-b border-background-200 px-5 py-4">
          <div>
            <h3 className="font-heading text-[15px] font-semibold text-foreground-950">
              {sent ? "Invitation Resent" : "Resend Invitation"}
            </h3>
            <p className="mt-0.5 text-xs text-foreground-500">
              {sent
                ? "Login details that have been emailed to the user"
                : "Send this user a fresh invitation email with a new password"}
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
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-accent-100">
                <i className="ri-mail-check-line text-accent-700 text-[20px] leading-none"></i>
              </span>
              <div>
                <p className="text-sm font-medium text-foreground-950">An email was sent to {user.email}</p>
                <p className="text-xs text-foreground-500">They can sign in with the unique password below.</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-background-200 bg-background-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2 border-b border-background-200 pb-3">
                <div>
                  <p className="text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-500">To</p>
                  <p className="text-sm text-foreground-900">{user.email}</p>
                </div>
                <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-[11px] font-medium text-secondary-900">
                  Siyana portal access
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-foreground-500">Name</span>
                  <span className="font-medium text-foreground-900">{user.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-foreground-500">Email</span>
                  <span className="font-medium text-foreground-900">{user.email}</span>
                </div>
                {GOVERNMENT_ROLES.includes(user.role) ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-foreground-500">Organization</span>
                    <span className="font-medium text-foreground-900">{user.organization}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3 rounded-md border border-accent-200 bg-accent-100/70 px-3 py-2">
                  <span className="text-xs font-medium text-accent-900">Unique password</span>
                  <span className="font-mono text-sm font-semibold tracking-wide text-accent-900">{password}</span>
                </div>
              </div>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-foreground-500">
              <i className="ri-information-line text-[14px] leading-none mt-0.5"></i>
              Their previous password will no longer work.
            </p>

            <div className="mt-5 flex justify-end">
              <Button variant="primary" icon="ri-check-line" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 px-5 py-5">
              <p className="text-sm text-foreground-700">
                Resend the invitation mail to <span className="font-medium text-foreground-950">{user.name}</span>{" "}
                ({user.email})? A new unique password will be generated and emailed.
              </p>
              {error ? (
                <p className="flex items-start gap-1.5 rounded-md border border-[oklch(var(--status-danger)/0.3)] bg-[oklch(var(--status-danger)/0.06)] px-3 py-2 text-[11px] text-[oklch(var(--status-danger))]">
                  <i className="ri-error-warning-line text-[14px] leading-none mt-0.5"></i>
                  {error}
                </p>
              ) : null}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-background-200 px-5 py-4">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon="ri-mail-send-line"
                onClick={() => void handleConfirm()}
                disabled={saving}
              >
                Resend Invitation
              </Button>
            </div>
          </>
        )}
      </div>
    </ModalOverlay>
  );
}
