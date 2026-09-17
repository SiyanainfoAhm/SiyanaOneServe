import { useEffect, useState } from "react";

/**
 * Returns the number of whole seconds elapsed since the hook mounted.
 * Ticks once per second and cleans up on unmount.
 */
export function useTicker(intervalMs = 1000): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed((value) => value + Math.round(intervalMs / 1000));
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return elapsed;
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.abs(Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h ${String(minutes).padStart(2, "0")}m`;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  return `${minutes}m ${String(secs).padStart(2, "0")}s`;
}

export default useTicker;