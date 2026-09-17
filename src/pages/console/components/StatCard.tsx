/**
 * KPI tile used on console dashboard and project detail.
 */
interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  tone: string;
  icon: string;
}

const TONE_BUBBLE: Record<string, string> = {
  primary: "bg-primary-100 text-primary-700",
  accent: "bg-accent-100 text-accent-700",
  info: "bg-[oklch(var(--status-info)/0.12)] text-[oklch(var(--status-info))]",
  warning: "bg-[oklch(var(--status-warning)/0.14)] text-[oklch(var(--status-warning))]",
  danger: "bg-[oklch(var(--status-danger)/0.12)] text-[oklch(var(--status-danger))]",
};

export default function StatCard({ label, value, delta, tone, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-4 transition-colors hover:border-background-300">
      <div className="flex items-start justify-between">
        <p className="text-xs font-label font-medium text-foreground-500">{label}</p>
        <span
          className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
            TONE_BUBBLE[tone] ?? TONE_BUBBLE.primary
          }`}
        >
          <i className={`${icon} text-[18px] leading-none`}></i>
        </span>
      </div>
      <p className="mt-3 font-heading text-3xl font-bold text-foreground-950 tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-[11px] text-foreground-500">{delta}</p>
    </div>
  );
}