/**
 * Maps TicketRecord → ClientRequest for the government portal.
 * Mutations go through api.* then AppData.replaceTicket.
 */
import { useAppData } from "@/context/AppDataContext";
import { api } from "@/services/api";
import type { ClientRequest, ClientRequestDetail } from "@/mocks/client";
import type { TicketRecord } from "@/types/oneserve";

export function toClientRequest(ticket: TicketRecord): ClientRequest {
  return {
    id: ticket.id,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    project: ticket.project,
    created: ticket.created,
    updated: ticket.updated,
    submittedBy: ticket.submitted_by ?? undefined,
  };
}

export function toClientDetail(ticket: TicketRecord): ClientRequestDetail {
  return {
    description: ticket.description,
    referenceLink: ticket.reference_url || "",
    assignedTeam: ticket.team === "Unassigned" ? "Siyana Support Team" : ticket.team,
    assignee: ticket.assignee,
    assigneeInitials: ticket.assignee_initials || "—",
    slaDue: ticket.sla_due || "",
    messages: (ticket.messages ?? []).map((message) => ({
      id: message.id,
      author: message.author,
      initials: message.initials,
      kind: message.kind === "client" ? "client" : "agent",
      role: message.role,
      body: message.body,
      time: message.time,
    })),
    events: (ticket.events ?? []).map((event) => ({
      id: event.id,
      time: event.time,
      date: event.date,
      title: event.title,
      note: event.note ?? "",
      actor: event.actor,
      tone: (event.tone as "primary" | "accent" | "warning" | "danger") || "primary",
    })),
    attachments: (ticket.attachments ?? []).map((file) => ({
      id: file.id,
      name: file.name,
      size: file.size,
      kind: file.kind,
      filePath: file.file_path,
    })),
  };
}

export function useClientRequests(): ClientRequest[] {
  const { tickets } = useAppData();
  return tickets.map(toClientRequest);
}

export function useClientRequestDetails(): Record<string, ClientRequestDetail> {
  const { tickets } = useAppData();
  return Object.fromEntries(tickets.filter((ticket) => ticket.messages || ticket.events).map((ticket) => [ticket.id, toClientDetail(ticket)]));
}

export function getClientRequests() {
  return [];
}

export function getClientRequestDetails() {
  return {};
}

export async function addClientRequest() {
  /* created through api.createTicket */
}

export async function updateRequestStatus(id: string, status: string) {
  return api.updateTicket({ id, status });
}

export async function addRequestNote(id: string, body: string) {
  return api.addMessage(id, body, "client");
}

export async function addRequestEvent() {
  /* events are written by RPCs */
}

export function createClientRequestId() {
  return "";
}
