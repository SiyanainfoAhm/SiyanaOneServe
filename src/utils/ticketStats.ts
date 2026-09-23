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
  return ["resolved", "closed"].includes((status ?? "").trim().toLowerCase());
}

export function isOpen(status: string): boolean {
  return !isClosedStatus(status);
}