/**
 * Standard page panel. Most console and client screens compose content inside Card.
 */
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export default function Card({ children, className = "", padded = true }: CardProps) {
  return (
    <div
      className={`bg-background-50 border border-background-200 rounded-lg ${
        padded ? "p-5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = "" }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h3 className="font-heading text-[15px] font-semibold text-foreground-950">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-foreground-500">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}