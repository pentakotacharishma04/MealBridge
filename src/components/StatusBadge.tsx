import type { DerivedStatus } from '../lib/types';

const LABELS: Record<DerivedStatus, string> = {
  POSTED: 'Posted',
  CLAIMED: 'Claimed',
  COLLECTED: 'Collected',
  DELIVERED: 'Delivered',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

/** The one status badge used everywhere (donations and rescues). */
export function StatusBadge({ status }: { status: DerivedStatus }) {
  return <span className={`status status-${status}`}>{LABELS[status]}</span>;
}

export function statusLabel(status: DerivedStatus): string {
  return LABELS[status];
}
