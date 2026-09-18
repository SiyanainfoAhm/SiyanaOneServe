import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotesPanel from "@/components/feature/NotesPanel";

describe("NotesPanel", () => {
  it("shows the empty state then sends a drafted note", async () => {
    const user = userEvent.setup();
    const onDraft = vi.fn();
    const onSend = vi.fn();
    const { rerender } = render(
      <NotesPanel notes={[]} draft="" onDraft={onDraft} onSend={onSend} />,
    );
    expect(screen.getByText("No notes yet")).toBeInTheDocument();

    rerender(
      <NotesPanel
        notes={[
          {
            id: "n1",
            author: "Arjun Mehta",
            initials: "AM",
            role: "Operations Admin",
            body: "Assigned to Content Team",
            time: "10:00",
            side: "team",
          },
        ]}
        draft="follow up"
        onDraft={onDraft}
        onSend={onSend}
      />,
    );
    expect(screen.getByText("Assigned to Content Team")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add Note" }));
    expect(onSend).toHaveBeenCalled();
  });

  it("hides the composer when the ticket is resolved", () => {
    render(
      <NotesPanel
        notes={[
          {
            id: "n1",
            author: "Arjun Mehta",
            initials: "AM",
            role: "Operations Admin",
            body: "Work completed",
            time: "10:00",
            side: "team",
          },
        ]}
        draft=""
        onDraft={vi.fn()}
        onSend={vi.fn()}
        readOnly
        readOnlyHint="This ticket is resolved. Notes are read-only."
      />,
    );
    expect(screen.getByText("Work completed")).toBeInTheDocument();
    expect(screen.getByText("This ticket is resolved. Notes are read-only.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Note" })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Add a note describing/i)).not.toBeInTheDocument();
  });

  it("hides the composer when the ticket is rejected", () => {
    render(
      <NotesPanel
        notes={[
          {
            id: "n1",
            author: "Arjun Mehta",
            initials: "AM",
            role: "Operations Admin",
            body: "Out of scope",
            time: "10:00",
            side: "team",
          },
        ]}
        draft=""
        onDraft={vi.fn()}
        onSend={vi.fn()}
        readOnly
        readOnlyHint="This ticket is rejected. Notes are read-only."
      />,
    );
    expect(screen.getByText("Out of scope")).toBeInTheDocument();
    expect(screen.getByText("This ticket is rejected. Notes are read-only.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add Note" })).not.toBeInTheDocument();
  });
});
