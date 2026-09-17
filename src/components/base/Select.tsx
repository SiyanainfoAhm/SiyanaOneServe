/**
 * Labeled native select used by filters, invite/edit forms, and workbench actions.
 */
import type { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
  icon?: string;
  label?: string;
  containerClassName?: string;
}

export default function Select({
  options,
  icon,
  label,
  value,
  onChange,
  className = "",
  containerClassName = "",
  ...rest
}: SelectProps) {
  return (
    <div className={containerClassName}>
      {label ? (
        <label className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className={`${icon} text-foreground-400 text-[15px] leading-none`}></i>
          </span>
        ) : null}
        <select
          value={value}
          onChange={onChange}
          className={`h-10 w-full appearance-none rounded-md border border-background-300 bg-background-50 ${
            icon ? "pl-9" : "pl-3"
          } pr-9 text-sm text-foreground-800 outline-none cursor-pointer transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100 ${className}`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
          <i className="ri-arrow-down-s-line text-foreground-400 text-[16px] leading-none"></i>
        </span>
      </div>
    </div>
  );
}