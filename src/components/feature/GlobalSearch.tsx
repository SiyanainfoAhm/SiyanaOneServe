/**
 * Typeahead over live tickets, projects, and people from AppDataContext.
 *
 * Console hits open workbench / project / users. Client hits stay under /client/*.
 * Queue and My Requests also honor ?q= from the selected hit.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppData } from "@/context/AppDataContext";
import { setScopedProject } from "@/hooks/useProjectScope";

type PortalMode = "console" | "client";

interface SearchHit {
  kind: "ticket" | "project" | "person";
  id: string;
  title: string;
  subtitle: string;
  to: string;
}

const KIND_META: Record<SearchHit["kind"], { icon: string; label: string; tone: string }> = {
  ticket: { icon: "ri-ticket-2-line", label: "Ticket", tone: "bg-primary-100 text-primary-700" },
  project: { icon: "ri-folders-line", label: "Project", tone: "bg-secondary-100 text-secondary-800" },
  person: { icon: "ri-user-line", label: "Person", tone: "bg-accent-100 text-accent-700" },
};

function matches(haystack: string, term: string) {
  return haystack.toLowerCase().includes(term);
}

interface GlobalSearchProps {
  mode: PortalMode;
  placeholder: string;
}

export default function GlobalSearch({ mode, placeholder }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { tickets, projects, users, loading } = useAppData();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const term = query.trim().toLowerCase();

  const results = useMemo<SearchHit[]>(() => {
    if (term.length < 1) return [];

    const ticketHits: SearchHit[] = tickets
      .filter((ticket) =>
        matches(
          `${ticket.id} ${ticket.ticket_id} ${ticket.ticket_no} ${ticket.title} ${ticket.project} ${ticket.assignee} ${ticket.organization} ${ticket.category} ${ticket.requester}`,
          term,
        ),
      )
      .map((ticket) => {
        const ticketNo = ticket.ticket_no || ticket.ticket_id || ticket.id;
        return {
          kind: "ticket" as const,
          id: ticket.id,
          title: ticketNo,
          subtitle: `${ticket.title} · ${ticket.project}`,
          to: mode === "console" ? `/console/tickets/${ticket.id}` : `/client/requests/${ticket.id}`,
        };
      })
      .sort((a, b) => Number(b.title.toLowerCase() === term) - Number(a.title.toLowerCase() === term))
      .slice(0, 6);

    const projectHits: SearchHit[] = projects
      .filter((project) => matches(`${project.name} ${project.code} ${project.organization}`, term))
      .slice(0, 4)
      .map((project) => ({
        kind: "project",
        id: project.id,
        title: project.name,
        subtitle: `${project.code} · ${project.organization}`,
        to: mode === "console" ? `/console/projects/${project.code}` : `/client/requests`,
      }));

    const peopleHits: SearchHit[] =
      mode === "console"
        ? users
            .filter((user) => matches(`${user.full_name} ${user.name} ${user.email} ${user.role} ${user.organization} ${user.team}`, term))
            .slice(0, 4)
            .map((user) => ({
              kind: "person",
              id: user.id,
              title: user.full_name || user.name,
              subtitle: `${user.role} · ${user.organization}`,
              to: `/console/users?q=${encodeURIComponent(user.full_name || user.name)}`,
            }))
        : [];

    const exactTicket = ticketHits.find((hit) => hit.title.toLowerCase() === term);
    const rest = [...ticketHits, ...projectHits, ...peopleHits].filter((hit) => hit !== exactTicket);
    return exactTicket ? [exactTicket, ...rest] : rest;
  }, [term, tickets, projects, users, mode]);

  useEffect(() => {
    setActive(0);
  }, [term]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(hit?: SearchHit) {
    const target = hit ?? results[active] ?? results[0];
    if (!target) {
      if (term) {
        navigate(mode === "console" ? `/console/queue?q=${encodeURIComponent(query.trim())}` : `/client/requests?q=${encodeURIComponent(query.trim())}`);
        setOpen(false);
      }
      return;
    }
    if (target.kind === "project" && mode === "client") setScopedProject(target.title);
    navigate(target.to);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go();
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showMenu = open && term.length > 0;

  return (
    <div className="relative hidden md:flex items-center w-[320px]" ref={rootRef}>
      <span className="absolute left-3 w-4 h-4 flex items-center justify-center pointer-events-none">
        <i className="ri-search-line text-foreground-400 text-[16px] leading-none"></i>
      </span>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        className="w-full h-10 rounded-md border border-background-300 bg-background-50 pl-9 pr-3 text-sm text-foreground-900 placeholder:text-foreground-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-colors"
      />

      {showMenu ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 w-[420px] max-w-[70vw] rounded-lg border border-background-200 bg-background-50 shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-foreground-500">
              {loading ? "Loading results…" : `No tickets, projects or people match “${query.trim()}”.`}
            </p>
          ) : (
            <ul className="max-h-[360px] overflow-y-auto py-1">
              {results.map((hit, index) => {
                const meta = KIND_META[hit.kind];
                return (
                  <li key={`${hit.kind}-${hit.id}`}>
                    <Link
                      to={hit.to}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => {
                        if (hit.kind === "project" && mode === "client") setScopedProject(hit.title);
                        setQuery("");
                        setOpen(false);
                      }}
                      className={`flex items-start gap-3 px-4 py-2.5 transition-colors cursor-pointer ${
                        index === active ? "bg-primary-50" : "hover:bg-background-50"
                      }`}
                    >
                      <span className={`mt-0.5 w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${meta.tone}`}>
                        <i className={`${meta.icon} text-[16px] leading-none`}></i>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground-900">{hit.title}</span>
                          <span className="text-[10px] font-label font-semibold uppercase tracking-wide text-foreground-400">
                            {meta.label}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-foreground-500">{hit.subtitle}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
