/**
 * From/to date inputs for queue and report filters.
 */
interface CustomDateRangeFieldsProps {
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  className?: string;
}

const DATE_CLASS =
  "h-9 rounded-md border border-background-300 bg-background-50 px-2.5 text-xs text-foreground-800 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 cursor-pointer";

export default function CustomDateRangeFields({
  from,
  to,
  onFrom,
  onTo,
  className = "",
}: CustomDateRangeFieldsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-[11px] font-label font-semibold text-foreground-500 whitespace-nowrap">From</span>
      <input
        type="date"
        value={from}
        max={to || undefined}
        onChange={(event) => onFrom(event.target.value)}
        className={DATE_CLASS}
        aria-label="From date"
      />
      <span className="text-[11px] font-label font-semibold text-foreground-500 whitespace-nowrap">to</span>
      <input
        type="date"
        value={to}
        min={from || undefined}
        onChange={(event) => onTo(event.target.value)}
        className={DATE_CLASS}
        aria-label="To date"
      />
    </div>
  );
}