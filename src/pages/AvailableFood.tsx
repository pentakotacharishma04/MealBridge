import { useMemo, useState } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { useNow, useStore } from '../lib/store';
import { useToast } from '../components/Toast';
import { claimError, deriveStatus } from '../lib/status';
import { HUB, haversineKm, remainingCapacity } from '../lib/matching';
import { minutesUntil, nowIso, uid } from '../lib/time';
import { CATEGORIES, type Donation, type DonationCategory, type Receiver, type Rescue } from '../lib/types';
import { DONORS, RECEIVERS } from '../data/seed';
import { DonationCard } from '../components/DonationCard';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { Stepper } from '../components/Stepper';

type DistanceFilter = 'any' | '2' | '5' | '10';
type QuantityFilter = 'any' | '5' | '10' | '20';
type DeadlineFilter = 'any' | '1' | '2' | 'today';
type SortKey = 'urgent' | 'nearest' | 'quantity';
type CollectChoice = 'ngo' | 'volunteer';

interface Filters {
  search: string;
  category: 'all' | DonationCategory;
  distance: DistanceFilter;
  quantity: QuantityFilter;
  deadline: DeadlineFilter;
}

interface ClaimForm {
  qty: number;
  receiverId: string;
  collect: CollectChoice;
}

interface Row {
  donation: Donation;
  donorName: string;
  km: number;
  deadlineMs: number;
  minutesLeft: number;
  /** Expired or cancelled rows are only shown when the user opts in, and never claimable. */
  inactive: boolean;
  cancelled: boolean;
}

const NO_FILTERS: Filters = { search: '', category: 'all', distance: 'any', quantity: 'any', deadline: 'any' };

const DISTANCE_OPTIONS: { value: DistanceFilter; label: string }[] = [
  { value: 'any', label: 'Any distance' },
  { value: '2', label: 'Within 2 km' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
];

const QUANTITY_OPTIONS: { value: QuantityFilter; label: string }[] = [
  { value: 'any', label: 'Any quantity' },
  { value: '5', label: '5+ portions' },
  { value: '10', label: '10+ portions' },
  { value: '20', label: '20+ portions' },
];

const DEADLINE_OPTIONS: { value: DeadlineFilter; label: string }[] = [
  { value: 'any', label: 'Any deadline' },
  { value: '1', label: 'Within 1 h' },
  { value: '2', label: 'Within 2 h' },
  { value: 'today', label: 'Today' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'urgent', label: 'Most urgent' },
  { value: 'nearest', label: 'Nearest' },
  { value: 'quantity', label: 'Largest quantity' },
];

const donorNameOf = (id: string) => DONORS.find((x) => x.id === id)?.name ?? 'Donor';

const isSameDay = (ms: number, now: number) => new Date(ms).toDateString() === new Date(now).toDateString();

/** Why a receiver cannot take this many portions of this donation, or null when it can. */
function receiverProblem(r: Receiver, d: Donation, qty: number, rescues: Rescue[]): string | null {
  if (!r.accepts.includes(d.category)) return `${r.name} does not accept ${d.category.toLowerCase()}.`;
  if (d.storage === 'Refrigerated' && !r.coldStorage) return `${r.name} has no cold storage for refrigerated food.`;
  const free = remainingCapacity(r, rescues);
  if (qty > free) return `${r.name} has only ${free} portions of capacity free.`;
  return null;
}

/** First receiver that can take the donation as-is, used as the default selection. */
function defaultReceiverId(d: Donation, rescues: Rescue[]): string {
  const fit = RECEIVERS.find((r) => receiverProblem(r, d, 1, rescues) === null);
  return (fit ?? RECEIVERS[0])?.id ?? '';
}

export default function AvailableFood() {
  const { state, dispatch } = useStore();
  const now = useNow(30000);
  const { toast } = useToast();

  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sort, setSort] = useState<SortKey>('urgent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showInactive, setShowInactive] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [form, setForm] = useState<ClaimForm>({ qty: 1, receiverId: '', collect: 'ngo' });

  const target = claimId ? state.donations.find((d) => d.id === claimId) : undefined;

  /** Donations with portions left that are either claimable now or (on opt-in) expired/cancelled. */
  const rows = useMemo<Row[]>(
    () =>
      state.donations.flatMap((d): Row[] => {
        if (d.portionsRemaining <= 0) return [];
        const deadlineMs = Date.parse(d.deadlineAt);
        const expired = now > deadlineMs;
        const status = deriveStatus(d, state.rescues, now);
        const open = !d.cancelled && !expired && (status === 'POSTED' || status === 'CLAIMED');
        const inactive = d.cancelled || expired;
        if (!open && !(inactive && showInactive)) return [];
        return [
          {
            donation: d,
            donorName: donorNameOf(d.donorId),
            km: haversineKm(d.location, HUB),
            deadlineMs,
            minutesLeft: minutesUntil(deadlineMs, now),
            inactive,
            cancelled: d.cancelled,
          },
        ];
      }),
    [state.donations, state.rescues, now, showInactive],
  );

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const { donation: d } = row;
      if (q && ![d.foodName, row.donorName, d.location.area].some((s) => s.toLowerCase().includes(q))) return false;
      if (filters.category !== 'all' && d.category !== filters.category) return false;
      if (filters.distance !== 'any' && row.km > Number(filters.distance)) return false;
      if (filters.quantity !== 'any' && d.portionsRemaining < Number(filters.quantity)) return false;
      if (filters.deadline === '1' && row.minutesLeft > 60) return false;
      if (filters.deadline === '2' && row.minutesLeft > 120) return false;
      if (filters.deadline === 'today' && !isSameDay(row.deadlineMs, now)) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      if (sort === 'nearest') return a.km - b.km;
      if (sort === 'quantity') return b.donation.portionsRemaining - a.donation.portionsRemaining;
      return a.deadlineMs - b.deadlineMs;
    });
  }, [rows, filters, sort, now]);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const openClaim = (d: Donation) => {
    setForm({ qty: Math.min(1, d.portionsRemaining), receiverId: defaultReceiverId(d, state.rescues), collect: 'ngo' });
    setClaimId(d.id);
  };

  const closeClaim = () => setClaimId(null);

  // Live validation for the open claim (the reducer re-checks and rejects over-claims too).
  const qty = target ? Math.max(1, Math.min(form.qty, target.portionsRemaining)) : 1;
  const receiver = RECEIVERS.find((r) => r.id === form.receiverId);
  const problem = target
    ? !receiver
      ? 'Choose a receiving organisation.'
      : claimError(target, qty, now) ?? receiverProblem(receiver, target, qty, state.rescues)
    : null;

  const confirmClaim = () => {
    if (!target || !receiver) return;
    if (problem) {
      toast(problem, 'error');
      return;
    }
    const rescue: Rescue = {
      id: uid('r'),
      donationId: target.id,
      receiverId: receiver.id,
      portions: qty,
      status: 'CLAIMED',
      collectedBy: form.collect === 'volunteer' ? 'volunteer' : 'ngo',
      timeline: [],
      createdAt: nowIso(),
    };
    dispatch({ type: 'claimDonation', rescue, now: Date.now() });
    const remaining = target.portionsRemaining - qty;
    toast(
      `Claimed ${qty} portion${qty === 1 ? '' : 's'} of "${target.foodName}" for ${receiver.name}. ${remaining} remaining.`,
      'success',
    );
    closeClaim();
  };

  const remainingAfter = target && receiver ? target.portionsRemaining - qty : target?.portionsRemaining ?? 0;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Available food</h1>
          <p>Claim surplus food near you before the pickup deadline.</p>
        </div>
      </div>

      <section className="card" style={{ marginBottom: 16 }}>
        <div className="grid grid-3" style={{ gap: 12 }}>
          <label style={{ display: 'grid', gap: 4 }}>
            <span className="small muted">Search</span>
            <input
              className="input"
              type="search"
              placeholder="Food, donor or area"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
            />
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span className="small muted">Category</span>
            <select
              className="input"
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value as Filters['category'])}
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span className="small muted">Distance from hub</span>
            <select
              className="input"
              value={filters.distance}
              onChange={(e) => setFilter('distance', e.target.value as DistanceFilter)}
            >
              {DISTANCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span className="small muted">Minimum quantity</span>
            <select
              className="input"
              value={filters.quantity}
              onChange={(e) => setFilter('quantity', e.target.value as QuantityFilter)}
            >
              {QUANTITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span className="small muted">Pickup deadline</span>
            <select
              className="input"
              value={filters.deadline}
              onChange={(e) => setFilter('deadline', e.target.value as DeadlineFilter)}
            >
              {DEADLINE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: 'grid', gap: 4 }}>
            <span className="small muted">Sort by</span>
            <select className="input" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <span className="small muted">
              {visible.length} donation{visible.length === 1 ? '' : 's'} shown
            </span>
            <label className="small" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
              Show expired and cancelled (not claimable)
            </label>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button
              type="button"
              className={`btn ${view === 'grid' ? 'btn-rescue' : 'btn-ghost'}`}
              onClick={() => setView('grid')}
              aria-pressed={view === 'grid'}
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button
              type="button"
              className={`btn ${view === 'list' ? 'btn-rescue' : 'btn-ghost'}`}
              onClick={() => setView('list')}
              aria-pressed={view === 'list'}
            >
              <List size={16} /> List
            </button>
          </div>
        </div>
      </section>

      {visible.length === 0 ? (
        <EmptyState
          title="No matching food"
          text={
            rows.length === 0
              ? 'There are no claimable donations right now. Check back soon.'
              : 'No donations match these filters. Try widening your search.'
          }
          action={
            <button className="btn btn-ghost" onClick={() => setFilters(NO_FILTERS)}>
              Clear filters
            </button>
          }
        />
      ) : (
        <div className={view === 'grid' ? 'grid grid-3' : undefined} style={{ gap: 16 }}>
          {visible.map((row) => {
            const { donation: d } = row;
            const reason = row.inactive
              ? row.cancelled
                ? 'Cancelled by the donor, so it cannot be claimed.'
                : 'The pickup deadline has passed, so it cannot be claimed.'
              : undefined;
            return (
              <div key={d.id} style={row.inactive ? { opacity: 0.6 } : undefined}>
                {row.inactive && (
                  <span className="tag" style={{ marginBottom: 6, display: 'inline-block' }}>
                    {row.cancelled ? 'Cancelled' : 'Expired'}
                  </span>
                )}
                <DonationCard
                  donation={d}
                  donorName={row.donorName}
                  now={now}
                  distanceKm={row.km}
                  view={view}
                  disabledReason={reason}
                  onClaim={() => openClaim(d)}
                />
              </div>
            );
          })}
        </div>
      )}

      {target && (
        <Modal
          open
          title={`Claim: ${target.foodName}`}
          onClose={closeClaim}
          footer={
            <>
              <button className="btn btn-ghost" onClick={closeClaim}>
                Cancel
              </button>
              <button className="btn btn-rescue" onClick={confirmClaim}>
                Confirm claim
              </button>
            </>
          }
        >
          <p className="small muted" style={{ marginBottom: 12 }}>
            {donorNameOf(target.donorId)} · {target.location.label} · {target.portionsRemaining} of{' '}
            {target.portionsTotal} portions left
          </p>

          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'grid', gap: 6 }}>
              <span className="small muted">Portions to claim</span>
              <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                <Stepper
                  label="Portions to claim"
                  value={qty}
                  min={1}
                  max={Math.max(1, target.portionsRemaining)}
                  onChange={(v) => setForm((f) => ({ ...f, qty: v }))}
                />
                <span className="small">
                  Remaining after claim: <b>{remainingAfter}</b>
                </span>
              </div>
            </div>

            <label style={{ display: 'grid', gap: 6 }}>
              <span className="small muted">Receiving organisation</span>
              <select
                className="input"
                value={form.receiverId}
                onChange={(e) => setForm((f) => ({ ...f, receiverId: e.target.value }))}
              >
                {RECEIVERS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.kind})
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span className="small muted">Collection</span>
              <select
                className="input"
                value={form.collect}
                onChange={(e) => setForm((f) => ({ ...f, collect: e.target.value as CollectChoice }))}
              >
                <option value="ngo">NGO collects</option>
                <option value="volunteer">Volunteer will collect</option>
              </select>
            </label>

            {problem && (
              <p className="small" role="alert" style={{ color: '#b91c1c' }}>
                {problem}
              </p>
            )}

            <div
              role="note"
              style={{
                background: '#fff7ed',
                border: '1px solid #fdba74',
                borderRadius: 8,
                padding: 10,
                fontSize: 13,
              }}
            >
              <strong>Food safety reminder:</strong> handling and allergen information is the donor's responsibility.
              MealBridge does not certify food safety. Check the allergen and storage details before you collect.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
