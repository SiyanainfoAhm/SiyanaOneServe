/**
 * Require a resolution comment before marking a ticket Resolved.
 * The comment is saved as a client-visible note and included in the status email.
 */
import { useState } from "react";
import Button from "@/components/base/Button";
import ModalOverlay from "@/components/base/ModalOverlay";

interface ResolveTicketModalProps {
  ticketId: string;
  onClose: () => void;
  onConfirm: (comment: string) => void | Promise<void>;
}

export default function ResolveTicketModal({ ticketId, onClose, onConfirm }: ResolveTicketModalProps) {
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    const trimmed = comment.trim();
    if (!trimmed) {
      setError("Please enter a resolution comment. It will be saved as a note and emailed.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onConfirm(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resolve this ticket.");
      setSaving(false);
    }
  }

  return (
    <ModalOverlay>
      <div className="w-full max-w-lg rounded-lg border border-background-200 bg-background-50 shadow-lg">
        <div className="flex items-center justify-between border-b border-background-200 px-5 py-4">
          <div>
            <h3 className="font-heading text-[15px] font-semibold text-foreground-950">Mark Resolved</h3>
            <p className="mt-0.5 text-xs text-foreground-500">
              Add a comment for {ticketId}. It is saved as a note and sent in the status email.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-8 h-8 rounded-md flex items-center justify-center text-foreground-500 hover:bg-background-100 hover:text-foreground-900 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <i className="ri-close-line text-[18px] leading-none"></i>
          </button>
        </div>

        <div className="flex flex-col gap-3 px-5 py-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-label font-medium text-foreground-700">
              Resolution comment <span className="text-[oklch(var(--status-danger))]">*</span>
            </span>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (error) setError("");
              }}
              rows={4}
              placeholder="Describe what was done to resolve this request…"
              className="w-full resize-y rounded-md border border-background-200 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              disabled={saving}
              autoFocus
            />
          </label>
          <p className="flex items-start gap-1.5 text-[11px] text-foreground-500">
            <i className="ri-information-line text-[14px] leading-none mt-0.5"></i>
            Visible in Notes to the department and included in the Resolved email.
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
            icon="ri-checkbox-circle-line"
            onClick={() => void handleConfirm()}
            disabled={saving || !comment.trim()}
          >
            {saving ? "Resolving…" : "Confirm Resolved"}
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
}
