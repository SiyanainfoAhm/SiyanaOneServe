/**
 * Horizontal status counts for dashboards. Order matches STATUS_ORDER.
 */
import { STATUS_ORDER, STATUS_ICONS, statusTone } from "@/components/base/StatusBadge";

const TONE_BUBBLE: Record<string, string> = {
  neutral: "bg-secondary-100 text-secondary-800",
  info: "bg-[oklch(var(--status-info)/0.12)] text-[oklch(var(--status-info))]",
  warning: "bg-[oklch(var(--status-warning)/0.14)] text-[oklch(var(--status-warning))]",
  primary: "bg-primary-100 text-primary-700",
  success: "bg-[oklch(var(--status-success)/0.12)] text-[oklch(var(--status-success))]",
  danger: "bg-[oklch(var(--status-danger)/0.12)] text-[oklch(var(--status-danger))]",
};

interface StatusStatRowProps {
  counts: Record<string, number>;
}

/**
 * The shared status KPI row. Both the department portal and the admin console
 * render this exact component so the two dashboards always look identical.
 */
export default function StatusStatRow({ counts }: StatusStatRowProps) {
  const total = STATUS_ORDER.reduce((sum, status) => sum + (counts[status] ?? 0), 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-lg border border-background-200 bg-background-50 p-3.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-primary-100 text-primary-700">
            <i className="ri-stack-line text-[15px] leading-none"></i>
          </span>
          <span className="min-w-0 truncate text-[11px] font-label font-medium text-foreground-500">
            Total Requests
          </span>
        </div>
        <p className="mt-2.5 font-heading text-2xl font-bold text-foreground-950 tracking-tight">{total}</p>
      </div>

      {STATUS_ORDER.map((status) => (
        <div key={status} className="rounded-lg border border-background-200 bg-background-50 p-3.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                TONE_BUBBLE[statusTone(status)] ?? TONE_BUBBLE.primary
              }`}
            >
              <i className={`${STATUS_ICONS[status] ?? "ri-price-tag-3-line"} text-[15px] leading-none`}></i>
            </span>
            <span className="min-w-0 truncate text-[11px] font-label font-medium text-foreground-500">
              {status}
            </span>
          </div>
          <p className="mt-2.5 font-heading text-2xl font-bold text-foreground-950 tracking-tight">
            {counts[status] ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}