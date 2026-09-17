/**
 * Shared button variants (primary / ghost / danger). Prefer this over raw buttons.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: string;
  iconRight?: string;
  fullWidth?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary-600 text-background-50 hover:bg-primary-700 focus-visible:ring-primary-400 border border-primary-600",
  secondary:
    "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus-visible:ring-secondary-300 border border-secondary-200",
  outline:
    "bg-background-50 text-foreground-800 hover:bg-background-100 focus-visible:ring-secondary-300 border border-background-300",
  ghost:
    "bg-transparent text-foreground-700 hover:bg-background-100 focus-visible:ring-secondary-300 border border-transparent",
  accent:
    "bg-accent-600 text-background-50 hover:bg-accent-700 focus-visible:ring-accent-300 border border-accent-600",
  danger:
    "bg-[oklch(var(--status-danger))] text-background-50 hover:opacity-90 focus-visible:ring-[oklch(var(--status-danger)/0.4)] border border-[oklch(var(--status-danger))]",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-md",
  lg: "h-11 px-5 text-sm gap-2 rounded-md",
};

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  fullWidth = false,
  children,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-label font-medium whitespace-nowrap transition-colors duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-background-50 disabled:opacity-50 disabled:cursor-not-allowed ${
        VARIANTS[variant]
      } ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {icon ? (
        <span className="w-4 h-4 flex items-center justify-center">
          <i className={`${icon} text-[15px] leading-none`}></i>
        </span>
      ) : null}
      {children}
      {iconRight ? (
        <span className="w-4 h-4 flex items-center justify-center">
          <i className={`${iconRight} text-[15px] leading-none`}></i>
        </span>
      ) : null}
    </button>
  );
}