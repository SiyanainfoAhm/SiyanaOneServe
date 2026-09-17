import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge, { PriorityBadge, SlaBadge, TicketStatusBadge, statusTone } from "@/components/base/StatusBadge";

describe("StatusBadge", () => {
  it("maps ticket lifecycle, priority, and SLA to the expected tones", () => {
    expect(statusTone("Need Approval")).toBe("warning");
    expect(statusTone("New")).toBe("info");
    expect(statusTone("Assigned")).toBe("primary");
    expect(statusTone("Resolved")).toBe("success");
    expect(statusTone("Rejected")).toBe("danger");
    expect(statusTone("Unknown")).toBe("neutral");
  });

  it("renders ticket, priority, and SLA labels", () => {
    render(
      <>
        <TicketStatusBadge status="Need Approval" />
        <PriorityBadge priority="Critical" />
        <SlaBadge sla="Breached" />
        <StatusBadge label="Custom" />
      </>,
    );
    expect(screen.getByText("Need Approval")).toBeInTheDocument();
    expect(screen.getByText("Critical")).toBeInTheDocument();
    expect(screen.getByText("Breached")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });
});
