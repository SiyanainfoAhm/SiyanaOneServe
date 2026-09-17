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
});
