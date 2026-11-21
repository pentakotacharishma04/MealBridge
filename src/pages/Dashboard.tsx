import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, HandHeart, Package, Truck, Utensils } from 'lucide-react';
import { useNow, useStore } from '../lib/store';
import { computeImpact } from '../lib/impact';
import { deriveStatus, urgencyLevel, type Urgency } from '../lib/status';
import { rankDonations } from '../lib/matching';
import { DONORS, RECEIVERS } from '../data/seed';
import { formatRemaining, formatTime, minutesUntil, timeAgo } from '../lib/time';
import { StatCard } from '../components/StatCard';
import { ActivityChart } from '../components/Charts';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { useEffect, useState } from 'react';
import type { DerivedStatus } from '../lib/types';

const PIPELINE: DerivedStatus[] = ['POSTED', 'CLAIMED', 'COLLECTED', 'DELIVERED', 'EXPIRED', 'CANCELLED'];

export default function Dashboard() {
  const { state } = useStore();
  const now = useNow(30000);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(t);
  }, []);

  const impact = computeImpact(state, now);
  const statusOf = (id: string) => {
    const d = state.donations.find((x) => x.id === id);
    return d ? deriveStatus(d, state.rescues, now) : 'POSTED';
  };
  const statuses = state.donations.map((d) => deriveStatus(d, state.rescues, now));
  const activeCount = statuses.filter((s) => s === 'POSTED' || s === 'CLAIMED' || s === 'COLLECTED').length;
  const urgent = state.donations
    .filter((d) => {
      const s = statusOf(d.id);
      return (s === 'POSTED' || s === 'CLAIMED' || s === 'COLLECTED') && d.portionsRemaining > 0;
    })
    .sort((a, b) => Date.parse(a.deadlineAt) - Date.parse(b.deadlineAt))
    .slice(0, 4);
  const recommended = rankDonations(state.donations, RECEIVERS, state.rescues, now).slice(0, 3);
  const recent = [...state.rescues]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 6);
  const firstName = state.profile.name.split(' ')[0];
  const donorName = (id: string) => DONORS.find((d) => d.id === id)?.name ?? 'Donor';
  const receiverName = (id: string) => RECEIVERS.find((r) => r.id === id)?.name ?? 'Receiver';

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Welcome back, {firstName}</h1>
          <p>Here is what is moving through the Hyderabad pilot today.</p>
        </div>
        <div className="row">
          <Link to="/donate" className="btn btn-rescue">Donate Food</Link>
          <Link to="/available" className="btn btn-ghost">Find Food</Link>
          <Link to="/delivery" className="btn btn-ghost">Volunteer for Pickup</Link>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total meals rescued" value={impact.meals} icon={<Utensils size={22} />} />
        <StatCard label="Active donations" value={activeCount} icon={<Package size={22} />} />
        <StatCard label="Completed rescues" value={impact.completed} icon={<CheckCircle2 size={22} />} />
        <StatCard label="Food waste avoided (est. kg)" value={impact.wasteAvoidedKg.toFixed(1)} hint="Estimate, not verified" icon={<HandHeart size={22} />} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <section className="card">
          <div className="card-title"><h2>Donation activity</h2><span className="hint">Last 7 days</span></div>
          {loading ? <div className="skeleton" style={{ height: 260 }} /> : <ActivityChart data={impact.activity} />}
        </section>

        <section className="card">
          <div className="card-title"><h2>Pipeline overview</h2><Link to="/delivery" className="small">Open pickups</Link></div>
          <div className="grid grid-3" style={{ gap: 12 }}>
            {PIPELINE.map((s) => (
              <div key={s} className="card" style={{ padding: 12, boxShadow: 'none' }}>
                <div className="stat-value">{statuses.filter((x) => x === s).length}</div>
                <StatusBadge status={s} />
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <section className="card">
          <div className="card-title"><h2>Urgent: pickup soon</h2><Link to="/available" className="small">See all</Link></div>
          {urgent.length === 0 && <EmptyState title="Nothing urgent" text="No open donations are close to their deadline." />}
          {urgent.map((d) => {
            const mins = minutesUntil(Date.parse(d.deadlineAt), now);
            const u: Urgency = urgencyLevel(mins);
            return (
              <div key={d.id} className="list-item">
                <div className="grow">
                  <strong>{d.foodName}</strong>
                  <div className="small muted">{donorName(d.donorId)} · {d.location.label}</div>
                  <div className="small">Pickup by {formatTime(d.deadlineAt)} · {formatRemaining(Date.parse(d.deadlineAt), now)} · {d.portionsRemaining} portions</div>
                </div>
                <span className={`urgency urgency-${u}`}>{u}</span>
              </div>
            );
          })}
        </section>

        <section className="card">
          <div className="card-title"><h2>Recommended matches</h2><Link to="/matches" className="small">Why these?</Link></div>
          {recommended.length === 0 && <EmptyState title="No matches right now" text="Post or wait for a donation with open capacity." />}
          {recommended.map((r) => (
            <div key={r.donation.id} className="list-item">
              <div className="grow">
                <strong>{r.donation.foodName}</strong>
                <div className="small muted">Best receiver: {r.matches[0] ? r.matches[0].receiver.name : '—'}</div>
                <div className="small">{r.matches[0]?.reasons[0]}</div>
              </div>
              <span className="tag">Priority {r.priority}</span>
            </div>
          ))}
        </section>
      </div>

      <div className="grid grid-2">
        <section className="card">
          <div className="card-title"><h2>Recent rescue activity</h2></div>
          {recent.length === 0 && <EmptyState title="No rescues yet" text="Claim a donation to start a rescue." />}
          {recent.map((r) => {
            const last = r.timeline[r.timeline.length - 1];
            return (
              <div key={r.id} className="list-item">
                <span className="dot rescue" />
                <div className="grow">
                  <div><strong>{receiverName(r.receiverId)}</strong> · {r.portions} portions</div>
                  <div className="small muted">{last?.text ?? 'Claimed'} · {timeAgo(r.createdAt, now)}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            );
          })}
        </section>

        <section className="card">
          <div className="card-title"><h2>Quick actions</h2></div>
          <div className="stack">
            <Link to="/donate" className="btn btn-block">Donate Food <ArrowRight size={16} /></Link>
            <Link to="/available" className="btn btn-block btn-ghost">Find Food <ArrowRight size={16} /></Link>
            <Link to="/delivery" className="btn btn-block btn-ghost">Volunteer for Pickup <Truck size={16} /></Link>
          </div>
          <p className="hint" style={{ marginTop: 16 }}>Last update {formatTime(now)}. Statuses are derived from the rescue records.</p>
        </section>
      </div>
    </div>
  );
}
