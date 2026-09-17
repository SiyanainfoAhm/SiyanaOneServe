/**
 * In-app notifications for the signed-in staff user.
 */
import { Link } from "react-router-dom";
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import PageHeader from "@/pages/console/components/PageHeader";
import Card from "@/components/base/Card";
import Button from "@/components/base/Button";
import EmptyState from "@/components/base/EmptyState";
import { useAppData } from "@/context/AppDataContext";

const TONE_BUBBLE: Record<string, string> = {
  danger: "bg-[oklch(var(--status-danger)/0.12)] text-[oklch(var(--status-danger))]",
  warning: "bg-[oklch(var(--status-warning)/0.14)] text-[oklch(var(--status-warning))]",
  accent: "bg-accent-100 text-accent-700",
  primary: "bg-primary-100 text-primary-700",
};

export default function ConsoleNotificationsPage() {
  const { notifications, markNotificationsRead } = useAppData();
  const items = notifications.filter((item) => !item.read);

  return (
    <ConsoleLayout>
      <PageHeader
        title="Notifications"
        subtitle="Tickets and alerts that need the operations team's attention."
        breadcrumb={[{ label: "Dashboard", to: "/console/dashboard" }, { label: "Notifications" }]}
        actions={
          items.length > 0 ? (
            <Button variant="outline" icon="ri-check-double-line" onClick={() => void markNotificationsRead()}>
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <Card className="mt-5" padded={false}>
        {items.length === 0 ? (
          <EmptyState
            icon="ri-notification-off-line"
            title="No new notifications"
            description="You are all caught up. We will notify you here whenever a ticket needs attention."
          />
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id} className="border-b border-background-100 last:border-0">
                <Link
                  to={item.requestId ? `/console/tickets/${item.requestId}` : item.href || "/console/queue"}
                  onClick={() => void markNotificationsRead([item.id])}
                  className="flex items-start gap-3.5 px-5 py-4 hover:bg-background-50 transition-colors cursor-pointer"
                >
                  <span className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${TONE_BUBBLE[item.tone] ?? "bg-background-100 text-foreground-600"}`}>
                    <i className={`${item.icon || "ri-notification-3-line"} text-[18px] leading-none`}></i>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground-950">{item.title}</p>
                      <span className="text-[11px] text-foreground-400">{item.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-foreground-600">{item.detail || item.body}</p>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-background-200 bg-background-50 px-3 py-1.5 text-xs font-medium text-foreground-700 whitespace-nowrap">
                    View
                    <i className="ri-arrow-right-line text-[13px] leading-none"></i>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </ConsoleLayout>
  );
}
