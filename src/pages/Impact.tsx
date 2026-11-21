import { useState } from 'react';
import { CheckCircle2, HandHeart, Package, Truck, Utensils, Building2 } from 'lucide-react';
import { useNow, useStore } from '../lib/store';
import { computeImpact, KG_PER_PORTION } from '../lib/impact';
import { StatCard } from '../components/StatCard';
import { ActivityChart, CategoryDonut, TrendBars } from '../components/Charts';
import { EmptyState } from '../components/EmptyState';

type Board = 'donors' | 'volunteers';

export default function Impact() {
  const { state } = useStore();
  const now = useNow(30000);
  const [board, setBoard] = useState<Board>('donors');
  const impact = computeImpact(state, now);
  const leaders = board === 'donors' ? impact.donorBoard : impact.volunteerBoard;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Impact</h1>
          <p>Every number on this page is calculated live from the rescue records in this browser.</p>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total meals rescued" value={impact.meals} hint="Portions in delivered rescues" icon={<Utensils size={22} />} />
        <StatCard
          label="Total food (kg)"
          value={impact.kg.toFixed(1)}
          hint={`${impact.meals} portions × ${KG_PER_PORTION} kg`}
          icon={<Package size={22} />}
        />
        <StatCard
          label="Waste avoided (kg)"
          value={impact.wasteAvoidedKg.toFixed(1)}
          hint="Estimate, not a verified environmental measurement"
          icon={<HandHeart size={22} />}
        />
        <StatCard label="Completed rescues" value={impact.completed} hint="Status: Delivered" icon={<CheckCircle2 size={22} />} />
        <StatCard label="Participating donors" value={impact.donors} icon={<Building2 size={22} />} />
        <StatCard label="NGOs supported" value={impact.ngos} icon={<Building2 size={22} />} />
        <StatCard label="Volunteer contributions" value={impact.volunteerDeliveries} hint="Deliveries by volunteers" icon={<Truck size={22} />} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <section className="card">
          <div className="card-title">
            <h2>Weekly trend</h2>
            <span className="hint">Portions delivered, last 8 weeks</span>
          </div>
          <TrendBars data={impact.weekly} />
        </section>
        <section className="card">
          <div className="card-title">
            <h2>Monthly trend</h2>
            <span className="hint">Portions delivered, last 6 months</span>
          </div>
          <TrendBars data={impact.monthly} color="#f28b44" />
        </section>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 24 }}>
        <section className="card">
          <div className="card-title">
            <h2>Food categories</h2>
            <span className="hint">Share of delivered portions</span>
          </div>
          {impact.categories.length === 0 ? (
            <EmptyState title="No deliveries yet" text="Category split appears once a rescue is delivered." />
          ) : (
            <CategoryDonut data={impact.categories} />
          )}
        </section>
        <section className="card">
          <div className="card-title">
            <h2>Rescue activity</h2>
            <span className="hint">Last 7 days</span>
          </div>
          <ActivityChart data={impact.activity} />
        </section>
      </div>

      <section className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">
          <h2>Leaderboards</h2>
          <div className="tabs" role="tablist" style={{ marginBottom: 0, borderBottom: 'none' }}>
            <button
              role="tab"
              aria-selected={board === 'donors'}
              className={`tab${board === 'donors' ? ' on' : ''}`}
              onClick={() => setBoard('donors')}
            >
              Donors
            </button>
            <button
              role="tab"
              aria-selected={board === 'volunteers'}
              className={`tab${board === 'volunteers' ? ' on' : ''}`}
              onClick={() => setBoard('volunteers')}
            >
              Volunteers
            </button>
          </div>
        </div>
        {leaders.length === 0 ? (
          <EmptyState
            title={board === 'donors' ? 'No donor rankings yet' : 'No volunteer rankings yet'}
            text="Rankings fill in as rescues are delivered."
          />
        ) : (
          leaders.map((l, i) => (
            <div key={l.id} className="list-item">
              <span className="tag">#{i + 1}</span>
              <div className="grow">
                <strong>{l.name}</strong>
                <div className="small muted">
                  {l.rescues} {l.rescues === 1 ? 'rescue' : 'rescues'}
                </div>
              </div>
              <div>
                <strong>{l.meals}</strong> <span className="small muted">portions</span>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="card">
        <div className="card-title">
          <h2>Assumptions</h2>
        </div>
        <ul className="stack small">
          <li>One meal portion is counted as one meal rescued.</li>
          <li>{KG_PER_PORTION} kg per portion is a sample conversion used for demonstration, not a measured weight.</li>
          <li>Waste avoided is an estimate, not a verified environmental measurement.</li>
          <li>All data is fictional sample data created for this hackathon prototype.</li>
        </ul>
      </section>
    </div>
  );
}
