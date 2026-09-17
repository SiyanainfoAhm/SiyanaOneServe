/**
 * Date formatters and queue/report date-range matching (today / 7d / 30d / custom).
 */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const year = parts[0];
  const monthIndex = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  return `${day} ${MONTHS[monthIndex] ?? ""} ${year}`;
}

export function daysBetween(iso: string, referenceIso: string): number {
  const a = new Date(iso).getTime();
  const b = new Date(referenceIso).getTime();
  return Math.round((b - a) / 86400000);
}

export function formatRelativeTime(iso: string, referenceIso: string): string {
  const diff = daysBetween(iso, referenceIso);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return formatDisplayDate(iso);
}

export const ALL_TIME = "All Time";
export const CUSTOM_RANGE = "Custom Range";

export interface DateRangeValue {
  preset: string;
  from: string;
  to: string;
}

export function createDateRange(preset: string = ALL_TIME): DateRangeValue {
  return { preset, from: "", to: "" };
}

/** Returns true when the ISO date matches the selected preset or custom range. */
export function matchesDateRange(iso: string, range: DateRangeValue, reference: string): boolean {
  if (!iso) return true;
  const { preset, from, to } = range;
  if (!preset || preset === ALL_TIME) return true;
  if (preset === CUSTOM_RANGE) {
    if (!from && !to) return true;
    if (from && iso < from) return false;
    if (to && iso > to) return false;
    return true;
  }
  const diff = daysBetween(iso, reference);
  switch (preset) {
    case "Today":
      return diff === 0;
    case "Yesterday":
      return diff === 1;
    case "Last 7 Days":
      return diff <= 6;
    case "Last 14 days":
      return diff <= 13;
    case "Last 30 Days":
    case "Last 30 days":
      return diff <= 29;
    case "This quarter":
      return diff <= 90;
    case "Last 6 months":
      return diff <= 180;
    case "This year":
      return iso.slice(0, 4) === reference.slice(0, 4);
    default:
      return true;
  }
}