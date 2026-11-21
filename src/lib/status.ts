import type { Donation, DerivedStatus, Rescue } from './types';

/**
 * Single source of truth for donation status.
 * Order: CANCELLED -> EXPIRED -> POSTED -> DELIVERED -> COLLECTED -> CLAIMED.
 */
export function deriveStatus(d: Donation, rescues: Rescue[], now: number): DerivedStatus {
  if (d.cancelled) return 'CANCELLED';
  const mine = rescues.filter((r) => r.donationId === d.id);
  const active = mine.filter((r) => r.status !== 'DELIVERED');
  if (now > Date.parse(d.deadlineAt) && d.portionsRemaining > 0 && active.length === 0) {
    return 'EXPIRED';
  }
  if (mine.length === 0) return 'POSTED';
  const allDelivered = mine.every((r) => r.status === 'DELIVERED');
  if (allDelivered && d.portionsRemaining === 0) return 'DELIVERED';
  if (allDelivered) return 'POSTED'; // partially delivered, remainder open again
  if (mine.some((r) => r.status === 'COLLECTED') && !mine.some((r) => r.status === 'CLAIMED')) {
    return 'COLLECTED';
  }
  return 'CLAIMED';
}

/** Returns a human reason if a claim of `portions` is not allowed, else null. */
export function claimError(d: Donation, portions: number, now: number): string | null {
  if (d.cancelled) return 'This donation was cancelled.';
  if (now > Date.parse(d.deadlineAt)) return 'The pickup deadline has passed.';
  if (d.portionsRemaining <= 0) return 'All portions are already allocated.';
  if (!Number.isInteger(portions) || portions < 1) return 'Choose at least 1 portion.';
  if (portions > d.portionsRemaining) {
    return `Only ${d.portionsRemaining} portions remain.`;
  }
  return null;
}

/** Urgency bands from minutes left until the deadline. */
export type Urgency = 'High' | 'Medium' | 'Low' | 'Passed';
export function urgencyLevel(minutesLeft: number): Urgency {
  if (minutesLeft <= 0) return 'Passed';
  if (minutesLeft < 60) return 'High';
  if (minutesLeft < 180) return 'Medium';
  return 'Low';
}
