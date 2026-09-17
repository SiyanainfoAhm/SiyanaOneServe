/**
 * Audit timeline from ticket.events (approve, assign, status, messages).
 */
interface TimelineEvent {
  id: string;
  time: string;
  date: string;
  title: string;
  note: string;
  actor: string;
  tone: string;
}

const DOT_TONE: Record<string, string> = {
  primary: "bg-primary-500",
  accent: "bg-accent-500",
  warning: "bg-[oklch(var(--status-warning))]",
  danger: "bg-[oklch(var(--status-danger))]",
  neutral: "bg-secondary-400",
};

export default function TimelinePanel({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="px-5 py-5">
      <ol className="relative ml-1.5 border-l border-background-200">
        {events.map((event, index) => (
          <li key={event.id} className={`relative pl-6 ${index === events.length - 1 ? "pb-0" : "pb-6"}`}>
            <span
              className={`absolute -left-[6.5px] top-1 w-3 h-3 rounded-full ring-4 ring-background-50 ${
                DOT_TONE[event.tone] ?? DOT_TONE.neutral
              }`}
            ></span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-label font-semibold text-foreground-900">{event.title}</span>
              <span className="text-[11px] text-foreground-400">
                {event.time} · {event.date}
              </span>
            </div>
            <p className="mt-1 text-sm text-foreground-600">{event.note}</p>
            <p className="mt-1 text-[11px] text-foreground-400">by {event.actor}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}