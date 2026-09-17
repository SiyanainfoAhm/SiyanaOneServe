/**
 * Fallback SLA countdown when a mock row has no due_in_seconds.
 * Live tickets carry due_in_seconds / window_seconds from the RPC.
 */
export interface SlaTiming {
  dueInSeconds: number;
  windowSeconds: number;
}

const PRIORITY_WINDOW_HOURS: Record<string, number> = {
  Critical: 8,
  High: 24,
  Normal: 48,
  Low: 72,
};

function seedFromId(id: string): number {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) % 100000;
  }
  return hash;
}

/**
 * Derives a stable SLA countdown for a queue row from its SLA state, priority
 * and id. The queue mock does not store per-ticket due timestamps, so this
 * keeps every row realistic and consistent between renders.
 */
export function slaTiming(id: string, priority: string, sla: string): SlaTiming {
  const windowSeconds = (PRIORITY_WINDOW_HOURS[priority] ?? 48) * 3600;
  const seed = seedFromId(id);

  if (sla === "Met") {
    return { dueInSeconds: 0, windowSeconds };
  }
  if (sla === "Breached") {
    return { dueInSeconds: -(900 + (seed % 5400)), windowSeconds };
  }
  if (sla === "At Risk") {
    return { dueInSeconds: 600 + (seed % 2400), windowSeconds };
  }
  if (sla === "Due Soon") {
    return { dueInSeconds: 2700 + (seed % 4500), windowSeconds };
  }
  const half = Math.max(1, Math.round(windowSeconds / 2));
  return { dueInSeconds: Math.round(windowSeconds * 0.5) + (seed % half), windowSeconds };
}

export default slaTiming;