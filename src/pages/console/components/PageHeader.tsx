/**
 * Title/subtitle row for console pages.
 */
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; to?: string }[];
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        {breadcrumb && breadcrumb.length ? (
          <nav className="mb-1.5 flex flex-wrap items-center gap-1.5 text-xs text-foreground-500">
            {breadcrumb.map((crumb, index) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <i className="ri-arrow-right-s-line text-[14px] leading-none text-foreground-400"></i>
                ) : null}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-foreground-800 transition-colors cursor-pointer">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground-700">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="font-heading text-xl font-bold text-foreground-950">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-foreground-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}