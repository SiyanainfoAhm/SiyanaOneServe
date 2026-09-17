/**
 * Maps TicketRecord → QueueTicket for the operations console.
 * Status updates call sosticket_update_ticket, then AppData.replaceTicket.
 */
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { api } from "@/services/api";
import type { QueueTicket } from "@/mocks/consoleQueue";
import type { TicketRecord } from "@/types/oneserve";

export function toQueueTicket(ticket: TicketRecord): QueueTicket {
  return {
    id: ticket.id,
    title: ticket.title,
    organization: ticket.organization,
    project: ticket.project,
    category: ticket.category,
    status: ticket.status,
    priority: ticket.priority,
    assignee: ticket.assignee,
    team: ticket.team,
    created: ticket.created,
    sla: ticket.sla,
    dueInSeconds: Number(ticket.due_in_seconds ?? 0),
    windowSeconds: Number(ticket.window_seconds ?? 0),
  };
}

export function useConsoleTickets(): QueueTicket[] {
  const { tickets } = useAppData();
  return tickets.map(toQueueTicket);
}

export function getConsoleTickets(): QueueTicket[] {
  return [];
}

export async function updateTicketStatus(id: string, status: string) {
  const ticket = await api.updateTicket({ id, status });
  return ticket;
}

export async function assignTicket(id: string, team: string, assignee: string) {
  const ticket = await api.updateTicket({ id, team, assignee });
  return ticket;
}

export async function addConsoleTicket() {
  /* created through api.createTicket */
}

export function createConsoleTicketId() {
  return "";
}

export function useAuthUser() {
  return useAuth().user;
}
