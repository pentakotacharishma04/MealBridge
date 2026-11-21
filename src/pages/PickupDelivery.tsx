import { useState } from 'react';
import { CheckCircle2, Truck } from 'lucide-react';
import { useNow, useStore } from '../lib/store';
import { haversineKm } from '../lib/matching';
import { nowIso, formatDateTime, formatRemaining, formatTime } from '../lib/time';
import { DONORS, RECEIVERS, VOLUNTEERS } from '../data/seed';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { StatusTracker } from '../components/StatusTracker';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import type { Donation, Rescue } from '../lib/types';

type Tab = 'available' | 'active' | 'completed';

const TABS: { key: Tab; label: string }[] = [
  { key: 'available', label: 'Available tasks' },
  { key: 'active', label: 'My active pickups' },
  { key: 'completed', label: 'Completed' },
];

interface CardProps {
  rescue: Rescue;
  donation: Donation | undefined;
  now: number;
  assignedTo: string;
  onAccept?: () => void;
  onCollected?: () => void;
  onDelivered?: () => void;
}

/** One rescue as a pickup task: where, what, how many, when, who, and its progress. */
function PickupCard({ rescue, donation, now, assignedTo, onAccept, onCollected, onDelivered }: CardProps) {
  const receiver = RECEIVERS.find((r) => r.id === rescue.receiverId);
  const donor = DONORS.find((d) => d.id === donation?.donorId);
  const km = donation && receiver ? haversineKm(donation.location, receiver) : null;
  const deadline = donation ? Date.parse(donation.deadlineAt) : NaN;

  return (
    <article className="card" style={{ marginBottom: 16 }}>
      <div className="card-title">
        <div>
          <h2>{donation?.foodName ?? 'Unknown donation'}</h2>
          <div className="small muted">{donor?.name ?? 'Donor'}</div>
        </div>
        <StatusBadge status={rescue.status} />
      </div>

      <div className="grid grid-2" style={{ gap: 12, marginBottom: 12 }}>
        <div>
          <div className="small muted">Pickup area</div>
          <strong>{donation?.location.area ?? '—'}</strong>
          <div className="small">{donation?.location.label}</div>
        </div>
        <div>
          <div className="small muted">Destination</div>
          <strong>{receiver?.name ?? 'Receiver'}</strong>
          <div className="small">{receiver?.kind}</div>
        </div>
        <div>
          <div className="small muted">Portions to collect</div>
          <strong>{rescue.portions}</strong>
        </div>
        <div>
          <div className="small muted">Distance (estimate)</div>
          <strong>{km === null ? '—' : `${km.toFixed(1)} km`}</strong>
          <div className="small muted">straight-line, not a route</div>
        </div>
        <div>
          <div className="small muted">Pickup deadline</div>
          <strong>{donation ? formatTime(donation.deadlineAt) : '—'}</strong>
          {!Number.isNaN(deadline) && <div className="small">{formatRemaining(deadline, now)}</div>}
        </div>
        <div>
          <div className="small muted">Volunteer</div>
          <strong>{assignedTo}</strong>
        </div>
      </div>

      <StatusTracker current={rescue.status} />

      <div className="row" style={{ marginTop: 16, flexWrap: 'wrap' }}>
        {onAccept && (
          <button className="btn btn-rescue" onClick={onAccept}>
            <Truck size={16} /> Accept pickup
          </button>
        )}
        {onCollected && (
          <button className="btn" onClick={onCollected}>
            Mark food as collected
          </button>
        )}
        {onDelivered && (
          <button className="btn" onClick={onDelivered}>
            <CheckCircle2 size={16} /> Mark delivery as completed
          </button>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="small muted" style={{ marginBottom: 4 }}>Activity timeline</div>
        {rescue.timeline.map((t, i) => (
          <div key={i} className="list-item" style={{ padding: '6px 0' }}>
            <span className="dot rescue" />
            <div className="grow">
              <div className="small">{t.text}</div>
              <div className="hint">
                {formatDateTime(t.at)} · {t.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function PickupDelivery() {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const now = useNow(30000);
  const [tab, setTab] = useState<Tab>('available');
  const [mineOnly, setMineOnly] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignee, setAssignee] = useState<string>('you');

  const donationOf = (id: string) => state.donations.find((d) => d.id === id);
  const nameOf = (id?: string) => {
    if (!id) return 'Unassigned';
    if (id === 'you') return `${state.profile.name} (you)`;
    return VOLUNTEERS.find((v) => v.id === id)?.name ?? 'Volunteer';
  };
  const deadlineOf = (r: Rescue) => {
    const d = donationOf(r.donationId);
    return d ? Date.parse(d.deadlineAt) : Number.POSITIVE_INFINITY;
  };

  const available = state.rescues
    .filter((r) => r.status === 'CLAIMED' && !r.volunteerId)
    .sort((a, b) => deadlineOf(a) - deadlineOf(b));
  const active = state.rescues
    .filter((r) => (r.status === 'CLAIMED' || r.status === 'COLLECTED') && r.volunteerId)
    .filter((r) => !mineOnly || r.volunteerId === 'you')
    .sort((a, b) => deadlineOf(a) - deadlineOf(b));
  const completed = state.rescues
    .filter((r) => r.status === 'DELIVERED')
    .sort((a, b) => Date.parse(b.timeline[b.timeline.length - 1]?.at ?? b.createdAt) - Date.parse(a.timeline[a.timeline.length - 1]?.at ?? a.createdAt));

  const assigning = assigningId ? state.rescues.find((r) => r.id === assigningId) : undefined;

  const openAccept = (id: string) => {
    setAssignee('you');
    setAssigningId(id);
  };

  const confirmAccept = () => {
    if (!assigning) return;
    if (assigning.volunteerId || assigning.status !== 'CLAIMED') {
      toast('This pickup is no longer available.', 'error');
      setAssigningId(null);
      return;
    }
    dispatch({ type: 'acceptPickup', rescueId: assigning.id, volunteerId: assignee, at: nowIso() });
    toast(`Pickup accepted by ${nameOf(assignee)}`, 'success');
    setAssigningId(null);
    setTab('active');
  };

  const markCollected = (id: string) => {
    const r = state.rescues.find((x) => x.id === id);
    if (!r || r.status !== 'CLAIMED') {
      toast('Only claimed pickups can be marked as collected.', 'error');
      return;
    }
    dispatch({ type: 'markCollected', rescueId: id, at: nowIso() });
    toast('Food marked as collected', 'success');
  };

  const markDelivered = (id: string) => {
    const r = state.rescues.find((x) => x.id === id);
    if (!r || r.status !== 'COLLECTED') {
      toast('Only collected food can be marked as delivered.', 'error');
      return;
    }
    dispatch({ type: 'markDelivered', rescueId: id, at: nowIso() });
    toast('Delivery completed. Impact updated.', 'success');
    setTab('completed');
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Pickup & Delivery</h1>
          <p>Volunteers collect claimed food from donors and deliver it to receiving NGOs before it goes to waste.</p>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`tab${tab === t.key ? ' on' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === 'available' && ` (${available.length})`}
            {t.key === 'active' && ` (${active.length})`}
            {t.key === 'completed' && ` (${completed.length})`}
          </button>
        ))}
      </div>

      {tab === 'available' && (
        <>
          {available.length === 0 && (
            <EmptyState
              title="No pickups waiting"
              text="Claimed food that needs a volunteer will appear here. Claim a donation from Smart Matches or Available Food."
            />
          )}
          {available.map((r) => (
            <PickupCard
              key={r.id}
              rescue={r}
              donation={donationOf(r.donationId)}
              now={now}
              assignedTo={nameOf(r.volunteerId)}
              onAccept={() => openAccept(r.id)}
            />
          ))}
        </>
      )}

      {tab === 'active' && (
        <>
          <label className="row small" style={{ marginBottom: 16, gap: 8 }}>
            <input type="checkbox" checked={mineOnly} onChange={(e) => setMineOnly(e.target.checked)} />
            Show only pickups assigned to me
          </label>
          {active.length === 0 && (
            <EmptyState
              title={mineOnly ? 'No pickups assigned to you' : 'No active pickups'}
              text="Accept a pickup from Available tasks to start collecting."
            />
          )}
          {active.map((r) => (
            <PickupCard
              key={r.id}
              rescue={r}
              donation={donationOf(r.donationId)}
              now={now}
              assignedTo={nameOf(r.volunteerId)}
              onCollected={r.status === 'CLAIMED' ? () => markCollected(r.id) : undefined}
              onDelivered={r.status === 'COLLECTED' ? () => markDelivered(r.id) : undefined}
            />
          ))}
        </>
      )}

      {tab === 'completed' && (
        <>
          {completed.length === 0 && (
            <EmptyState title="No completed deliveries yet" text="Delivered rescues will be listed here with their full timeline." />
          )}
          {completed.map((r) => (
            <PickupCard
              key={r.id}
              rescue={r}
              donation={donationOf(r.donationId)}
              now={now}
              assignedTo={nameOf(r.volunteerId)}
            />
          ))}
        </>
      )}

      <Modal
        open={assigning !== undefined}
        title="Accept pickup"
        onClose={() => setAssigningId(null)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setAssigningId(null)}>
              Cancel
            </button>
            <button className="btn btn-rescue" onClick={confirmAccept}>
              Accept pickup
            </button>
          </>
        }
      >
        <p className="small muted">
          {assigning ? `${donationOf(assigning.donationId)?.foodName ?? 'Donation'} · ${assigning.portions} portions` : ''}
        </p>
        <div className="field">
          <label htmlFor="assignee">Assign volunteer</label>
          <select id="assignee" className="select" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <option value="you">You ({state.profile.name})</option>
            {VOLUNTEERS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.vehicle})
              </option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
}
