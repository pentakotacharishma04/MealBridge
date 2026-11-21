import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HandHeart, Leaf, Route, Truck, Users, Utensils } from 'lucide-react';
import { useNow, useStore } from '../lib/store';
import { computeImpact } from '../lib/impact';
import { deriveStatus } from '../lib/status';
import { Logo } from '../components/Logo';
import { InfoDialog, type InfoKey } from '../components/InfoDialog';

export default function Landing() {
  const { state } = useStore();
  const now = useNow(60000);
  const [info, setInfo] = useState<InfoKey | null>(null);
  const impact = computeImpact(state, now);
  const active = state.donations.filter((d) => {
    const s = deriveStatus(d, state.rescues, now);
    return s === 'POSTED' || s === 'CLAIMED' || s === 'COLLECTED';
  }).length;

  return (
    <div className="landing">
      <nav className="landing-nav">
        <Logo />
        <div className="row">
          <Link to="/available" className="btn btn-ghost btn-sm">Find Available Food</Link>
          <Link to="/dashboard" className="btn btn-sm">Open app</Link>
        </div>
      </nav>

      <div className="hero-wrap">
        <section className="hero">
          <p style={{ color: '#f8c9a3', fontWeight: 700, letterSpacing: 0.5 }}>Surplus food. Shortest route. Real impact.</p>
          <h1>Good food deserves a second chance.</h1>
          <p style={{ maxWidth: 680 }}>
            Caterers, restaurants, hostels and canteens post surplus food. MealBridge matches it with a nearby NGO or
            community kitchen, and a volunteer collects and delivers it before the pickup deadline.
          </p>
          <div className="row" style={{ marginTop: 20 }}>
            <Link to="/donate" className="btn btn-rescue">Donate Surplus Food <ArrowRight size={16} /></Link>
            <Link to="/available" className="btn btn-ghost">Find Available Food</Link>
          </div>
          <div className="stat-band" style={{ marginTop: 28 }}>
            <div className="stat">
              <div className="stat-icon"><Utensils size={20} /></div>
              <div><div className="stat-value">{impact.meals}</div><div className="stat-label">Meals rescued</div></div>
            </div>
            <div className="stat">
              <div className="stat-icon"><Leaf size={20} /></div>
              <div><div className="stat-value">{impact.wasteAvoidedKg.toFixed(0)} kg</div><div className="stat-label">Waste avoided (est.)</div></div>
            </div>
            <div className="stat">
              <div className="stat-icon"><HandHeart size={20} /></div>
              <div><div className="stat-value">{active}</div><div className="stat-label">Live donations</div></div>
            </div>
            <div className="stat">
              <div className="stat-icon"><Users size={20} /></div>
              <div><div className="stat-value">{impact.ngos}</div><div className="stat-label">NGOs supported</div></div>
            </div>
          </div>
        </section>
      </div>

      <section className="section">
        <h2 className="section-title">How it works</h2>
        <div className="steps">
          {[
            ['Post surplus food', 'Add the food, portions, storage, allergens and a pickup deadline.'],
            ['Match with a nearby organization', 'Explainable smart matching ranks receivers by distance, capacity, time and need.'],
            ['Collect and deliver food', 'A volunteer accepts the pickup and tracks it to delivery.'],
          ].map(([title, text], i) => (
            <div key={title} className="card">
              <div className="step-num">{i + 1}</div>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="grid grid-3">
          <div className="card">
            <h3>For donors</h3>
            <p className="muted">Caterers, restaurants, hostels and canteens can post a batch in under a minute.</p>
            <Link to="/donate" className="btn btn-sm">Post food <ArrowRight size={14} /></Link>
          </div>
          <div className="card">
            <h3>For NGOs and kitchens</h3>
            <p className="muted">Browse available food, filter by distance and deadline, and claim the portions you can use.</p>
            <Link to="/available" className="btn btn-sm">Browse food <ArrowRight size={14} /></Link>
          </div>
          <div className="card">
            <h3>For volunteers</h3>
            <p className="muted">Accept a pickup, mark it collected and mark it delivered. Every step is tracked.</p>
            <Link to="/delivery" className="btn btn-sm">Volunteer <Truck size={14} /></Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Impact so far</h2>
        <div className="grid grid-4">
          <div className="card stat"><div className="stat-icon"><Utensils size={20} /></div><div><div className="stat-value">{impact.meals}</div><div className="stat-label">Meals rescued</div></div></div>
          <div className="card stat"><div className="stat-icon"><Route size={20} /></div><div><div className="stat-value">{impact.completed}</div><div className="stat-label">Completed rescues</div></div></div>
          <div className="card stat"><div className="stat-icon"><Users size={20} /></div><div><div className="stat-value">{impact.donors}</div><div className="stat-label">Participating donors</div></div></div>
          <div className="card stat"><div className="stat-icon"><Leaf size={20} /></div><div><div className="stat-value">{impact.kg.toFixed(1)} kg</div><div className="stat-label">Food weight (0.45 kg/portion)</div></div></div>
        </div>
        <p className="hint" style={{ textAlign: 'center', marginTop: 12 }}>
          Figures are computed from the fictional demo data. Waste avoided is an estimate, not a verified environmental measurement.
        </p>
      </section>

      <section className="section">
        <h2 className="section-title">Sample testimonials (fictional)</h2>
        <div className="grid grid-3">
          {[
            ['“We used to throw out the day’s extra trays. Now they reach a kitchen within the hour.”', 'Head chef, a fictional caterer'],
            ['“The distance and deadline filters mean we only claim what we can actually collect.”', 'Coordinator, a fictional NGO'],
            ['“Two bike volunteers can cover the whole pilot area on a Saturday evening.”', 'Volunteer, a fictional collective'],
          ].map(([quote, who]) => (
            <figure key={who} className="card" style={{ margin: 0 }}>
              <blockquote style={{ margin: 0 }}>{quote}</blockquote>
              <figcaption className="small muted">{who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="row" style={{ justifyContent: 'center', gap: 24 }}>
          <button onClick={() => setInfo('about')}>About</button>
          <button onClick={() => setInfo('contact')}>Contact</button>
          <button onClick={() => setInfo('safety')}>Safety</button>
          <button onClick={() => setInfo('privacy')}>Privacy</button>
        </div>
        <p className="small" style={{ textAlign: 'center', marginTop: 12 }}>
          MealBridge is a hackathon prototype. All people, organisations and data are fictional.
        </p>
      </footer>

      <InfoDialog kind={info} onClose={() => setInfo(null)} />
    </div>
  );
}
