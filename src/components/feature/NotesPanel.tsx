/**
 * Message thread UI. Console and client both post notes as client-visible
 * so government users and Siyana staff share the same conversation.
 */
import Avatar from "@/components/base/Avatar";
import Button from "@/components/base/Button";
import EmptyState from "@/components/base/EmptyState";

export interface NoteEntry {
  id: string;
  author: string;
  initials: string;
  role: string;
  body: string;
  time: string;
  side: "requester" | "team";
}

interface NotesPanelProps {
  notes: NoteEntry[];
  draft: string;
  onDraft: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  readOnly?: boolean;
  readOnlyHint?: string;
}

export default function NotesPanel({
  notes,
  draft,
  onDraft,
  onSend,
  placeholder = "Add a note describing the issue or sharing an update…",
  readOnly = false,
  readOnlyHint = "Notes are read-only because this ticket is closed.",
}: NotesPanelProps) {
  return (
    <div className="flex flex-col">
      {notes.length === 0 ? (
        <EmptyState
          icon="ri-sticky-note-line"
          title="No notes yet"
          description={
            readOnly
              ? "There are no notes on this request."
              : "Add the first note to describe the issue or share context on this request."
          }
        />
      ) : (
        <div className="flex flex-col divide-y divide-background-100 px-5">
          {notes.map((note) => (
            <div key={note.id} className="flex gap-3 py-4">
              <Avatar
                initials={note.initials}
                size="sm"
                tone={note.side === "requester" ? "accent" : "primary"}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-foreground-900">{note.author}</span>
                  <span className="text-[11px] text-foreground-500">{note.role}</span>
                  <span className="ml-auto text-[11px] text-foreground-400">{note.time}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground-700">{note.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {readOnly ? (
        <div className="border-t border-background-200 px-5 py-4">
          <p className="flex items-start gap-2 text-sm text-foreground-500">
            <i className="ri-lock-line mt-0.5 text-[15px] leading-none"></i>
            <span>{readOnlyHint}</span>
          </p>
        </div>
      ) : (
        <div className="border-t border-background-200 p-4">
          <div className="rounded-lg border border-background-300 bg-background-50 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100 transition-colors">
            <textarea
              value={draft}
              onChange={(event) => onDraft(event.target.value)}
              rows={3}
              maxLength={500}
              placeholder={placeholder}
              className="w-full resize-none rounded-lg bg-transparent px-3.5 py-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none"
            />
            <div className="flex items-center justify-between gap-3 border-t border-background-200 px-3 py-2">
              <span className="hidden text-[11px] text-foreground-400 sm:block">
                Notes are visible to both the department and the Siyana team
              </span>
              <Button
                variant="primary"
                size="sm"
                icon="ri-add-line"
                onClick={onSend}
                disabled={!draft.trim()}
                className="ml-auto"
              >
                Add Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}