/**
 * Compact select used in console/client top bars (project scope).
 */
import { useEffect, useRef, useState } from "react";

interface TopbarSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  icon?: string;
  menuLabel?: string;
}

export default function TopbarSelect({
  options,
  value,
  onChange,
  icon = "ri-folders-line",
  menuLabel,
}: TopbarSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as Node;
      if (ref.current && !ref.current.contains(target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="hidden md:flex items-center gap-2 h-10 rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-800 hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap"
      >
        <span className="w-4 h-4 flex items-center justify-center">
          <i className={`${icon} text-foreground-500 text-[16px] leading-none`}></i>
        </span>
        <span className="max-w-[150px] truncate">{value}</span>
        <span className="w-4 h-4 flex items-center justify-center">
          <i className="ri-arrow-down-s-line text-foreground-400 text-[16px] leading-none"></i>
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 z-30 w-60 rounded-lg border border-background-200 bg-background-50 p-1.5 shadow-lg">
          {menuLabel ? (
            <p className="px-3 pb-1.5 pt-1 text-[11px] font-label font-semibold uppercase tracking-wider text-foreground-400">
              {menuLabel}
            </p>
          ) : null}
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                option === value
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-foreground-700 hover:bg-background-100"
              }`}
            >
              {option}
              {option === value ? (
                <span className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-check-line text-[15px] leading-none"></i>
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}