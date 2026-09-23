import { describe, expect, it } from "vitest";
import {
  categoryBreakdown,
  countMap,
  isOpenStatus,
  monthVolumeTrend,
  projectNamesOf,
  slaCounts,
  ticketTrendSeries,
  workloadFromTickets,
} from "@/utils/liveStats";
import { makeTicket } from "@/test/fixtures";

describe("liveStats", () => {
  it("treats Resolved / Closed as not open", () => {
    expect(isOpenStatus("New")).toBe(true);
    expect(isOpenStatus("Assigned")).toBe(true);
    expect(isOpenStatus("Resolved")).toBe(false);
    expect(isOpenStatus("Closed")).toBe(false);
  });

  it("builds a 14-day created/closed trend using the supplied today", () => {
    const tickets = [
      makeTicket({ created: "2026-09-16", created_at: "2026-09-16T00:00:00Z", status: "New" }),
      makeTicket({
        id: "t2",
        created: "2026-09-16",
        status: "Closed",
        updated_at: "2026-09-17T00:00:00Z",
      }),
    ];
    const series = ticketTrendSeries(tickets, 3, "2026-09-17");
    expect(series).toHaveLength(3);
    expect(series[1].created).toBe(2);
    expect(series[2].closed).toBe(1);
  });

  it("counts SLA buckets and on-track percent against open tickets", () => {
    const tickets = [
      makeTicket({ sla: "On Track", status: "New" }),
      makeTicket({ id: "2", sla: "Due Soon", status: "Assigned" }),
      makeTicket({ id: "3", sla: "At Risk", status: "In Progress" }),
      makeTicket({ id: "4", sla: "Breached", status: "Assigned" }),
      makeTicket({ id: "5", sla: "Met", status: "Closed" }),
    ];
    const counts = slaCounts(tickets);
    expect(counts).toMatchObject({ onTrack: 1, dueSoon: 1, atRisk: 1, breached: 1, met: 1, active: 4 });
    expect(counts.onTrackPct).toBe(50);
  });

  it("aggregates workload, categories, and project names", () => {
    const tickets = [
      makeTicket({ assignee: "Arjun Mehta", status: "New", category: "Access" }),
      makeTicket({ id: "2", assignee: "Arjun Mehta", status: "Assigned", category: "Access" }),
      makeTicket({ id: "3", assignee: "Unassigned", status: "New", category: "Content" }),
      makeTicket({ id: "4", assignee: "Priya", status: "Closed", category: "Access" }),
    ];
    expect(workloadFromTickets(tickets)[0]).toMatchObject({ name: "Arjun Mehta", load: 2, initials: "AM" });
    expect(categoryBreakdown(tickets)[0]).toMatchObject({ name: "Access", value: 3, resolved: 1 });
    expect(countMap(tickets, "priority")[0].name).toBe("High");
    expect(projectNamesOf(["OneServe", { name: "MGSU Portal" }])).toEqual(["OneServe", "MGSU Portal"]);
    expect(monthVolumeTrend(tickets).length).toBeGreaterThan(0);
  });
});
