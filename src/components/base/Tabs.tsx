/**
 * Underline tabs for queue status, workbench, project detail, and reports.
 */
export interface TabItem {
  key: string;
  label: string;
  count?: number;
  icon?: string;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function Tabs({ items, value, onChange, className = "" }: TabsProps) {
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 rounded-full border border-background-200 bg-background-100 px-1 py-1 ${className}`}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-label font-medium whitespace-nowrap transition-colors cursor-pointer ${
              active
                ? "bg-background-50 text-foreground-950 border border-background-200"
                : "text-foreground-500 hover:text-foreground-800"
            }`}
          >
            {item.icon ? (
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                <i className={`${item.icon} text-[14px] leading-none`}></i>
              </span>
            ) : null}
            {item.label}
            {typeof item.count === "number" ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold font-label ${
                  active ? "bg-primary-600 text-background-50" : "bg-background-200 text-foreground-600"
                }`}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}