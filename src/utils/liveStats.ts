/**
 * Client-side aggregates (status counts, SLA buckets) from TicketRecord[].
 */
import { todayIso } from "@/utils/date";
import type { TicketRecord } from "@/types/oneserve";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CATEGORY_TONES = ["primary", "accent", "secondary"] as const;
const CATEGORY_ICONS = ["ri-global-line", "ri-code-s-slash-line", "ri-customer-service-2-line", "ri-file-text-line"];

export function isOpenStatus(status: string) {
  return !["Resolved", "Closed", "Rejected"].includes(status);
}

export function ticketTrendSeries(tickets: TicketRecord[], days = 14, today = todayIso()) {
  const map = new Map<string, { day: string; created: number; closed: number }>();
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(`${today}T00:00:00`);
    date.setDate(date.getDate() - offset);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    map.set(iso, { day: `${date.getDate()} ${MONTHS[date.getMonth()]}`, created: 0, closed: 0 });
  }
  tickets.forEach((ticket) => {
    const created = ticket.created?.slice(0, 10);
    if (created && map.has(created)) {
      map.get(created)!.created += 1;
    }
    if ((ticket.status === "Resolved" || ticket.status === "Closed") && ticket.updated_at) {
      const closed = ticket.updated_at.slice(0, 10);
      if (map.has(closed)) map.get(closed)!.closed += 1;
    }
  });
  return Array.from(map.values());
}

export function monthVolumeTrend(tickets: TicketRecord[]) {
  const map = new Map<string, { month: string; created: number; closed: number; raised: number; resolved: number; order: number }>();
  tickets.forEach((ticket) => {
    const created = new Date(ticket.created_at || `${ticket.created}T00:00:00`);
    if (Number.isNaN(created.getTime())) return;
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const entry = map.get(key) ?? {
      month: MONTHS[created.getMonth()],
      created: 0,
      closed: 0,
      raised: 0,
      resolved: 0,
      order: created.getFullYear() * 12 + created.getMonth(),
    };
    entry.created += 1;
    entry.raised += 1;
    if (ticket.status === "Resolved" || ticket.status === "Closed") {
      entry.closed += 1;
      entry.resolved += 1;
    }
    map.set(key, entry);
  });
  return Array.from(map.values())
    .sort((a, b) => a.order - b.order)
    .slice(-9);
}

export function countMap(tickets: TicketRecord[], key: keyof TicketRecord) {
  const map = new Map<string, number>();
  tickets.forEach((ticket) => {
    const value = String(ticket[key] || "Other");
    map.set(value, (map.get(value) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function slaCounts(tickets: TicketRecord[]) {
  const rows = {
    onTrack: tickets.filter((ticket) => ticket.sla === "On Track").length,
    dueSoon: tickets.filter((ticket) => ticket.sla === "Due Soon").length,
    atRisk: tickets.filter((ticket) => ticket.sla === "At Risk").length,
    breached: tickets.filter((ticket) => ticket.sla === "Breached").length,
    met: tickets.filter((ticket) => ticket.sla === "Met").length,
  };
  const active = Math.max(1, tickets.filter((ticket) => isOpenStatus(ticket.status)).length);
  const onTrackPct = Math.round(((rows.onTrack + rows.dueSoon) / active) * 100);
  return { ...rows, active, onTrackPct };
}

export function workloadFromTickets(tickets: TicketRecord[]) {
  const map = new Map<string, number>();
  tickets
    .filter((ticket) => isOpenStatus(ticket.status) && ticket.assignee && ticket.assignee !== "Unassigned")
    .forEach((ticket) => map.set(ticket.assignee, (map.get(ticket.assignee) ?? 0) + 1));
  return Array.from(map.entries())
    .map(([name, load]) => ({
      name,
      load,
      initials: name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    }))
    .sort((a, b) => b.load - a.load)
    .slice(0, 8);
}

export function categoryBreakdown(tickets: TicketRecord[]) {
  const map = new Map<string, { name: string; value: number; resolved: number }>();
  tickets.forEach((ticket) => {
    const entry = map.get(ticket.category) ?? { name: ticket.category, value: 0, resolved: 0 };
    entry.value += 1;
    if (ticket.status === "Resolved" || ticket.status === "Closed") entry.resolved += 1;
    map.set(ticket.category, entry);
  });
  return Array.from(map.values())
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({
      ...item,
      key: item.name,
      tone: CATEGORY_TONES[index % CATEGORY_TONES.length],
      icon: CATEGORY_ICONS[index % CATEGORY_ICONS.length],
    }));
}

export function projectNamesOf(projects: Array<string | { name: string }> | undefined): string[] {
  return (projects ?? []).map((item) => (typeof item === "string" ? item : item.name));
}
