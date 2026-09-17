/**
 * Empty-list placeholder (queue, attachments, notifications, approvals).
 */
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon = "ri-inbox-line",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="w-14 h-14 rounded-lg bg-background-100 border border-background-200 flex items-center justify-center">
        <i className={`${icon} text-foreground-400 text-[26px] leading-none`}></i>
      </span>
      <h3 className="mt-4 font-heading text-sm font-semibold text-foreground-900">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-foreground-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}