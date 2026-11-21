/** Formats an ISO timestamp as a short clock time, e.g. "9:30 PM". */
export function formatTime(iso: string | number): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Formats an ISO timestamp as "12 Mar, 9:30 PM". */
export function formatDateTime(iso: string | number): string {
  return new Date(iso).toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Human "time remaining" text for a deadline. */
export function formatRemaining(deadlineMs: number, now: number): string {
  const diff = deadlineMs - now;
  if (diff <= 0) return 'Deadline passed';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins} min left`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  return rest === 0 ? `${hours} h left` : `${hours} h ${rest} min left`;
}

/** Minutes between now and a deadline (can be negative). */
export function minutesUntil(deadlineMs: number, now: number): number {
  return (deadlineMs - now) / 60000;
}

/** Formats a Date for <input type="datetime-local"> (local time). */
export function toLocalInputValue(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parses a datetime-local value into epoch ms; NaN when empty/invalid. */
export function fromLocalInputValue(value: string): number {
  if (!value) return NaN;
  return new Date(value).getTime();
}

/** Today at a given local hour and minute, as epoch ms. */
export function todayAt(hour: number, minute: number, base: number = Date.now()): number {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function timeAgo(iso: string, now: number): string {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
