import type { Donation } from '../lib/types';
import { urgencyLevel } from '../lib/status';
import { formatRemaining, formatTime, minutesUntil } from '../lib/time';
import { CategoryIllustration } from './CategoryIllustration';

interface DonationCardProps {
  donation: Donation;
  donorName: string;
  now: number;
  distanceKm?: number;
  view: 'grid' | 'list';
  /** Reason the claim button is disabled, if any. */
  disabledReason?: string;
  onClaim?: () => void;
}

export function DonationCard({ donation: d, donorName, now, distanceKm, view, disabledReason, onClaim }: DonationCardProps) {
  const deadline = Date.parse(d.deadlineAt);
  const mins = minutesUntil(deadline, now);
  const urgency = urgencyLevel(mins);
  const pct = Math.round(((d.portionsTotal - d.portionsRemaining) / d.portionsTotal) * 100);
  return (
    <article className={`card donation-card${view === 'list' ? ' list' : ''}`} aria-label={d.foodName}>
      <div className="illus">
        <CategoryIllustration category={d.category} />
      </div>
      <div className="donation-body">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
          <span className={`urgency urgency-${urgency}`}>{urgency === 'Passed' ? 'Passed' : `${urgency} urgency`}</span>
          <span className="tag">{d.category}</span>
        </div>
        <h3 style={{ marginBottom: 4 }}>{d.foodName}</h3>
        <p className="small muted" style={{ marginBottom: 8 }}>
          {donorName} · {d.location.label}
        </p>
        <div className="meta" style={{ marginBottom: 8 }}>
          <span>
            <b>{d.portionsRemaining}</b> of {d.portionsTotal} portions left
          </span>
          <span>
            Pickup by <b>{formatTime(deadline)}</b>
          </span>
          <span>{formatRemaining(deadline, now)}</span>
          <span>
            Storage: <b>{d.storage}</b>
          </span>
          <span>
            Allergens: <b>{d.allergens.join(', ')}</b>
          </span>
          <span>{distanceKm !== undefined ? `${distanceKm.toFixed(1)} km from hub` : d.location.area}</span>
        </div>
        <div className="progress" aria-hidden="true" style={{ marginBottom: 12 }}>
          <div style={{ width: `${pct}%` }} />
        </div>
        {onClaim && (
          <button className="btn btn-rescue btn-block" onClick={onClaim} disabled={!!disabledReason} title={disabledReason}>
            {disabledReason ? 'Unavailable' : 'Claim'}
          </button>
        )}
        {disabledReason && <p className="hint" style={{ marginTop: 6 }}>{disabledReason}</p>}
      </div>
    </article>
  );
}
