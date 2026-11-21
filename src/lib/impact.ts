import { DONORS, VOLUNTEERS } from '../data/seed';
import type { AppState } from './types';
import { CATEGORIES } from './types';

export const KG_PER_PORTION = 0.45;
const DAY = 24 * 60 * 60 * 1000;

export interface Leader {
  id: string;
  name: string;
  meals: number;
  rescues: number;
}

export interface ImpactSummary {
  meals: number;
  kg: number;
  wasteAvoidedKg: number;
  completed: number;
  donors: number;
  ngos: number;
  volunteerDeliveries: number;
  weekly: { label: string; value: number }[];
  monthly: { label: string; value: number }[];
  categories: { name: string; value: number }[];
  activity: { label: string; donations: number; delivered: number }[];
  donorBoard: Leader[];
  volunteerBoard: Leader[];
}

const dayStart = (ms: number) => {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** All impact numbers are derived from state, so they update when a rescue is DELIVERED. */
export function computeImpact(state: AppState, now: number): ImpactSummary {
  const delivered = state.rescues.filter((r) => r.status === 'DELIVERED');
  const meals = delivered.reduce((s, r) => s + r.portions, 0);
  const kg = meals * KG_PER_PORTION;
  const donationOf = (id: string) => state.donations.find((d) => d.id === id);

  const donorIds = new Set(
    state.donations.filter((d) => state.rescues.some((r) => r.donationId === d.id)).map((d) => d.donorId),
  );
  const ngoIds = new Set(state.rescues.map((r) => r.receiverId));

  const weekly = Array.from({ length: 8 }, (_, i) => {
    const start = now - (7 - i) * 7 * DAY;
    return {
      label: new Date(start).toLocaleDateString([], { day: 'numeric', month: 'short' }),
      value: 0,
    };
  });
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() - (5 - i), 1);
    return { label: d.toLocaleDateString([], { month: 'short' }), value: 0, key: d.getMonth() + '-' + d.getFullYear() };
  });
  const categoryTotals = new Map<string, number>(CATEGORIES.map((c) => [c, 0]));
  const donorTotals = new Map<string, Leader>();
  const volTotals = new Map<string, Leader>();

  for (const r of delivered) {
    const t = Date.parse(r.createdAt);
    const weekIdx = 7 - Math.floor((now - t) / (7 * DAY));
    if (weekIdx >= 0 && weekIdx < 8) weekly[weekIdx].value += r.portions;
    const dt = new Date(t);
    const mIdx = monthly.findIndex((m) => m.key === dt.getMonth() + '-' + dt.getFullYear());
    if (mIdx >= 0) monthly[mIdx].value += r.portions;

    const d = donationOf(r.donationId);
    if (d) categoryTotals.set(d.category, (categoryTotals.get(d.category) ?? 0) + r.portions);
    if (d) {
      const dl = donorTotals.get(d.donorId) ?? {
        id: d.donorId,
        name: DONORS.find((x) => x.id === d.donorId)?.name ?? 'Unknown donor',
        meals: 0,
        rescues: 0,
      };
      dl.meals += r.portions;
      dl.rescues += 1;
      donorTotals.set(d.donorId, dl);
    }
    if (r.volunteerId) {
      const v = VOLUNTEERS.find((x) => x.id === r.volunteerId);
      const volName = r.volunteerId === 'you' ? state.profile.name : v?.name ?? 'Volunteer';
      const vl = volTotals.get(r.volunteerId) ?? {
        id: r.volunteerId,
        name: volName,
        meals: 0,
        rescues: 0,
      };
      vl.meals += r.portions;
      vl.rescues += 1;
      volTotals.set(r.volunteerId, vl);
    }
  }

  const activity = Array.from({ length: 7 }, (_, i) => {
    const start = dayStart(now - (6 - i) * DAY);
    const end = start + DAY;
    return {
      label: new Date(start).toLocaleDateString([], { weekday: 'short' }),
      donations: state.donations.filter((d) => {
        const t = Date.parse(d.createdAt);
        return t >= start && t < end;
      }).length,
      delivered: delivered
        .filter((r) => {
          const t = Date.parse(r.createdAt);
          return t >= start && t < end;
        })
        .reduce((s, r) => s + r.portions, 0),
    };
  });

  const byMeals = (a: Leader, b: Leader) => b.meals - a.meals;
  return {
    meals,
    kg,
    wasteAvoidedKg: kg,
    completed: delivered.length,
    donors: donorIds.size,
    ngos: ngoIds.size,
    volunteerDeliveries: delivered.filter((r) => r.volunteerId).length,
    weekly,
    monthly: monthly.map(({ label, value }) => ({ label, value })),
    categories: CATEGORIES.map((c) => ({ name: c, value: categoryTotals.get(c) ?? 0 })).filter((c) => c.value > 0),
    activity,
    donorBoard: [...donorTotals.values()].sort(byMeals),
    volunteerBoard: [...volTotals.values()].sort(byMeals),
  };
}
