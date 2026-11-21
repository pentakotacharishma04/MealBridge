import { deriveStatus } from './status';
import type { Donation, Receiver, Rescue } from './types';

/**
 * Explainable smart matching (rule-based, NOT machine learning).
 *
 * Per donation-receiver pair, each factor is scored 0-100:
 *   Urgency      : minutes until deadline. <=60 min -> 100, >=240 min -> 10, linear in between.
 *   Distance     : 100 * (1 - km / 10), 0 at or beyond 10 km (haversine distance).
 *   QuantityFit  : claimable = min(portions remaining, receiver's remaining capacity).
 *                  100 when everything fits, otherwise 100 * capacity / remaining (shortfall penalty).
 *   ReceiverNeed : 70 * need/5 + 30 if the receiver has an open request for the category.
 *
 * Gate (0 or 1): receiver accepts the category AND (food is not Refrigerated OR the receiver has
 * cold storage) AND claimable > 0.
 *
 * Match score (receiver)  = round(gate * (0.35*Urgency + 0.25*Distance + 0.20*QuantityFit + 0.20*ReceiverNeed))
 * Rescue Priority (donation) = the best match score among its receivers.
 *
 * Ability: receivers with a vehicle collect themselves; others receive volunteer delivery.
 */

export const WEIGHTS = { urgency: 0.35, distance: 0.25, quantityFit: 0.2, need: 0.2 } as const;
export const HUB = { lat: 17.4156, lng: 78.4347 };

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Receiver capacity not yet taken by open (non-delivered) rescues. */
export function remainingCapacity(r: Receiver, rescues: Rescue[]): number {
  const taken = rescues
    .filter((x) => x.receiverId === r.id && x.status !== 'DELIVERED')
    .reduce((sum, x) => sum + x.portions, 0);
  return Math.max(0, r.capacity - taken);
}

export function urgencyScore(minutesLeft: number): number {
  if (minutesLeft <= 60) return 100;
  if (minutesLeft >= 240) return 10;
  return 100 - ((minutesLeft - 60) / 180) * 90;
}

export interface MatchResult {
  receiver: Receiver;
  km: number;
  distanceScore: number;
  capacity: number;
  claimable: number;
  quantityFitScore: number;
  urgency: number;
  minutesLeft: number;
  needScore: number;
  categoryOk: boolean;
  coldOk: boolean;
  gate: 0 | 1;
  match: number;
  reasons: string[];
  action: string;
}

export function scoreDonationReceiver(
  d: Donation,
  r: Receiver,
  rescues: Rescue[],
  now: number,
): MatchResult {
  const minutesLeft = (Date.parse(d.deadlineAt) - now) / 60000;
  const km = haversineKm(d.location, r);
  const distanceScore = clamp(100 * (1 - km / 10));
  const capacity = remainingCapacity(r, rescues);
  const claimable = Math.min(d.portionsRemaining, capacity);
  const quantityFitScore =
    d.portionsRemaining <= 0 || capacity <= 0
      ? 0
      : d.portionsRemaining <= capacity
        ? 100
        : clamp((100 * capacity) / d.portionsRemaining);
  const urgency = clamp(urgencyScore(minutesLeft));
  const openRequest = r.openRequests.includes(d.category);
  const needScore = clamp((r.need / 5) * 70 + (openRequest ? 30 : 0));
  const categoryOk = r.accepts.includes(d.category);
  const coldOk = d.storage !== 'Refrigerated' || r.coldStorage;
  const gate: 0 | 1 = categoryOk && coldOk && claimable > 0 ? 1 : 0;
  const weighted =
    WEIGHTS.urgency * urgency +
    WEIGHTS.distance * distanceScore +
    WEIGHTS.quantityFit * quantityFitScore +
    WEIGHTS.need * needScore;
  const match = Math.round(gate * weighted);

  const reasons: string[] = [`Pickup ${km.toFixed(1)} km away`];
  if (claimable > 0) {
    reasons.push(
      `Fits ${claimable} of ${d.portionsRemaining} portions into ${capacity}-portion remaining capacity`,
    );
  } else {
    reasons.push(`No remaining capacity (${r.capacity} portions in use)`);
  }
  reasons.push(
    minutesLeft < 60
      ? `Pickup due in ${Math.max(0, Math.round(minutesLeft))} min (urgent)`
      : `Pickup due in ${Math.round(minutesLeft / 60)} h ${Math.round(minutesLeft % 60)} min`,
  );
  reasons.push(
    `Stated need ${r.need}/5${openRequest ? `, open request for ${d.category.toLowerCase()}` : ''}`,
  );
  reasons.push(r.hasVehicle ? 'Has its own vehicle' : 'Collected by volunteer bike or cycle');
  if (!categoryOk) reasons.push('Does not accept this category (gated to 0)');
  if (!coldOk) reasons.push('No cold storage for refrigerated food (gated to 0)');

  let action: string;
  if (gate === 0) action = 'Not recommended for this donation';
  else if (minutesLeft < 60) action = `Claim ${claimable} now, pickup is urgent`;
  else if (match >= 60) action = `Claim ${claimable} to reserve this pickup`;
  else action = 'Viable backup receiver';

  return {
    receiver: r,
    km,
    distanceScore,
    capacity,
    claimable,
    quantityFitScore,
    urgency,
    minutesLeft,
    needScore,
    categoryOk,
    coldOk,
    gate,
    match,
    reasons,
    action,
  };
}

/** Ranks all receivers for one donation, best match first. */
export function rankReceivers(
  d: Donation,
  receivers: Receiver[],
  rescues: Rescue[],
  now: number,
): MatchResult[] {
  return receivers
    .map((r) => scoreDonationReceiver(d, r, rescues, now))
    .sort((a, b) => b.match - a.match || a.km - b.km);
}

export interface DonationRank {
  donation: Donation;
  priority: number;
  matches: MatchResult[];
}

/** Only active, claimable donations (not expired, cancelled, delivered or empty). */
export function isMatchable(d: Donation, rescues: Rescue[], now: number): boolean {
  if (d.portionsRemaining <= 0) return false;
  const s = deriveStatus(d, rescues, now);
  return s === 'POSTED' || s === 'CLAIMED' || s === 'COLLECTED';
}

/** Donations ranked by Rescue Priority (best receiver's match score), highest first. */
export function rankDonations(
  donations: Donation[],
  receivers: Receiver[],
  rescues: Rescue[],
  now: number,
): DonationRank[] {
  return donations
    .filter((d) => isMatchable(d, rescues, now))
    .map((d) => {
      const matches = rankReceivers(d, receivers, rescues, now);
      return { donation: d, priority: matches[0]?.match ?? 0, matches };
    })
    .sort((a, b) => b.priority - a.priority);
}
