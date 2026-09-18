/**
 * Status-count helpers used by dashboard widgets. Order matches STATUS_ORDER.
 */
import { STATUS_ORDER } from "@/components/base/StatusBadge";

export interface StatusRow {
  status: string;
}

export function countByStatus<T extends StatusRow>(rows: T[]): Record<string, number> {
  const map: Record<string, number> = {};
  STATUS_ORDER.forEach((status) => {
    map[status] = 0;
  });
  rows.forEach((row) => {
    map[row.status] = (map[row.status] ?? 0) + 1;
  });
  return map;
}

export function isClosedStatus(status: string): boolean {
  return ["resolved", "rejected", "closed"].includes((status ?? "").trim().toLowerCase());
}

export function isOpen(status: string): boolean {
  return !isClosedStatus(status);
}

export function rejectionFromEvents(
  status: string,
  events?: Array<{ type?: string; title?: string; note?: string | null; actor?: string; date?: string; time?: string }>,
  fallbackAt = "",
  stored?: { reason?: string | null; by?: string | null; at?: string | null },
) {
  if (status !== "Rejected") return undefined;
  const event = [...(events ?? [])]
    .reverse()
    .find((item) => item.type === "rejected" || /reject/i.test(item.title ?? ""));
  return {
    by: stored?.by || event?.actor || "Siyana Team",
    at: stored?.at || (event ? [event.date, event.time].filter(Boolean).join(" ") : fallbackAt),
    reason: stored?.reason || event?.note || "No reason provided.",
  };
}