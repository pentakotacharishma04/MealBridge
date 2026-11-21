import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import { RECEIVERS, VOLUNTEERS, buildSeedState } from '../data/seed';
import { claimError } from './status';
import { uid } from './time';
import type { AppState, Donation, Notification, Profile, Rescue, RescueStatus, Settings } from './types';

export const STORAGE_KEY = 'mealbridge.v1';

export type Action =
  | { type: 'load'; state: AppState }
  | { type: 'resetDemo'; state: AppState }
  | { type: 'createDonation'; donation: Donation }
  | { type: 'updateDonation'; donation: Donation }
  | { type: 'cancelDonation'; id: string; at: string }
  | { type: 'claimDonation'; rescue: Rescue; now: number }
  | { type: 'acceptPickup'; rescueId: string; volunteerId: string; at: string }
  | { type: 'markCollected'; rescueId: string; at: string }
  | { type: 'markDelivered'; rescueId: string; at: string }
  | { type: 'markNotificationsRead' }
  | { type: 'updateProfile'; profile: Profile }
  | { type: 'updateSettings'; settings: Settings };

/** Adds a notification only if the user has that category switched on. */
function addNote(state: AppState, kind: Notification['kind'], text: string, at: string): Notification[] {
  const on =
    kind === 'claim'
      ? state.settings.notifyClaims
      : kind === 'status'
        ? state.settings.notifyStatus
        : state.settings.notifyDonations;
  if (!on) return state.notifications;
  return [{ id: uid('n'), kind, text, at, read: false }, ...state.notifications].slice(0, 50);
}

/** Moves one rescue forward a step (only if it is currently in `from`). */
function advance(
  state: AppState,
  rescueId: string,
  from: RescueStatus,
  to: RescueStatus,
  text: string,
  at: string,
): AppState {
  const r = state.rescues.find((x) => x.id === rescueId);
  if (!r || r.status !== from) return state;
  const food = state.donations.find((d) => d.id === r.donationId)?.foodName ?? 'Donation';
  const updated: Rescue = { ...r, status: to, timeline: [...r.timeline, { status: to, at, text }] };
  return {
    ...state,
    rescues: state.rescues.map((x) => (x.id === rescueId ? updated : x)),
    notifications: addNote(state, 'status', `${food}: ${to.toLowerCase()}. ${text}`, at),
  };
}

/** Pure reducer: every rule that matters (over-claim, status order) is enforced here. */
export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'load':
    case 'resetDemo':
      return action.state;

    case 'createDonation':
      return {
        ...state,
        donations: [action.donation, ...state.donations],
        notifications: addNote(
          state,
          'donation',
          `New donation posted: ${action.donation.foodName} (${action.donation.portionsTotal} portions)`,
          action.donation.createdAt,
        ),
      };

    case 'updateDonation': {
      const old = state.donations.find((d) => d.id === action.donation.id);
      if (!old) return state;
      const claimed = old.portionsTotal - old.portionsRemaining;
      const next: Donation = {
        ...action.donation,
        portionsRemaining: Math.max(0, action.donation.portionsTotal - claimed),
      };
      return { ...state, donations: state.donations.map((d) => (d.id === next.id ? next : d)) };
    }

    case 'cancelDonation': {
      const d = state.donations.find((x) => x.id === action.id);
      if (!d || d.cancelled) return state;
      return {
        ...state,
        donations: state.donations.map((x) => (x.id === action.id ? { ...x, cancelled: true } : x)),
        notifications: addNote(state, 'donation', `Donation cancelled: ${d.foodName}`, action.at),
      };
    }

    case 'claimDonation': {
      const d = state.donations.find((x) => x.id === action.rescue.donationId);
      if (!d) return state;
      if (claimError(d, action.rescue.portions, action.now)) return state; // over-claim rejected
      const recv = RECEIVERS.find((r) => r.id === action.rescue.receiverId)?.name ?? 'a receiver';
      const text = `Claimed ${action.rescue.portions} portions by ${recv}`;
      const rescue: Rescue = {
        ...action.rescue,
        status: 'CLAIMED',
        timeline: [{ status: 'CLAIMED', at: action.rescue.createdAt, text }],
      };
      return {
        ...state,
        donations: state.donations.map((x) =>
          x.id === d.id ? { ...x, portionsRemaining: x.portionsRemaining - rescue.portions } : x,
        ),
        rescues: [rescue, ...state.rescues],
        notifications: addNote(
          state,
          'claim',
          `${recv} claimed ${rescue.portions} portions of "${d.foodName}"`,
          rescue.createdAt,
        ),
      };
    }

    case 'acceptPickup': {
      // 'you' = the signed-in demo user (profile name); otherwise one of the seeded volunteers.
      const name =
        action.volunteerId === 'you'
          ? state.profile.name
          : VOLUNTEERS.find((x) => x.id === action.volunteerId)?.name;
      const r = state.rescues.find((x) => x.id === action.rescueId);
      if (!r || r.volunteerId || r.status === 'DELIVERED' || !name) return state;
      const food = state.donations.find((d) => d.id === r.donationId)?.foodName ?? 'Donation';
      const updated: Rescue = {
        ...r,
        volunteerId: action.volunteerId,
        collectedBy: 'volunteer',
        timeline: [...r.timeline, { status: r.status, at: action.at, text: `Pickup accepted by ${name}` }],
      };
      return {
        ...state,
        rescues: state.rescues.map((x) => (x.id === r.id ? updated : x)),
        notifications: addNote(state, 'status', `${name} accepted pickup of "${food}"`, action.at),
      };
    }

    case 'markCollected':
      return advance(state, action.rescueId, 'CLAIMED', 'COLLECTED', 'Food collected from donor', action.at);

    case 'markDelivered': {
      const r = state.rescues.find((x) => x.id === action.rescueId);
      const recv = RECEIVERS.find((x) => x.id === r?.receiverId)?.name ?? 'receiver';
      return advance(state, action.rescueId, 'COLLECTED', 'DELIVERED', `Delivered to ${recv}`, action.at);
    }

    case 'markNotificationsRead':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    case 'updateProfile':
      return { ...state, profile: action.profile };

    case 'updateSettings':
      return { ...state, settings: action.settings };

    default:
      return state;
  }
}

/** Loads persisted state, or seeds demo data on first run / when storage is corrupt. */
function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (Array.isArray(parsed.donations) && Array.isArray(parsed.rescues) && parsed.profile && parsed.settings) {
        return parsed;
      }
    }
  } catch {
    // ignore corrupt storage and fall back to seed data
  }
  return buildSeedState(Date.now());
}

interface StoreValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full or unavailable; app keeps working in memory
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

/** Current time, refreshed periodically so countdowns stay live. */
export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}
