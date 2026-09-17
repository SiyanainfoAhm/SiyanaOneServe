import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "@/components/base/Button";
import EmptyState from "@/components/base/EmptyState";

describe("Button", () => {
  it("renders children and fires click unless disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(
      <Button onClick={onClick} variant="danger">
        Delete
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    rerender(
      <Button onClick={onClick} disabled>
        Delete
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("EmptyState", () => {
  it("shows title, description, and optional action", () => {
    render(
      <EmptyState title="No tickets" description="Queue is empty" action={<button type="button">Create</button>} />,
    );
    expect(screen.getByText("No tickets")).toBeInTheDocument();
    expect(screen.getByText("Queue is empty")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });
});
