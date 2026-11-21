import { Check } from 'lucide-react';
import type { DerivedStatus, RescueStatus } from '../lib/types';

const STEPS: { key: RescueStatus; label: string }[] = [
  { key: 'POSTED', label: 'Posted' },
  { key: 'CLAIMED', label: 'Claimed' },
  { key: 'COLLECTED', label: 'Collected' },
  { key: 'DELIVERED', label: 'Delivered' },
];

/** POSTED -> CLAIMED -> COLLECTED -> DELIVERED, with the current step highlighted. */
export function StatusTracker({ current }: { current: DerivedStatus }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="tracker" aria-label={`Progress: ${current}`}>
      {STEPS.map((s, i) => {
        const done = idx >= 0 && i <= idx;
        const isCurrent = i === idx;
        return (
          <div key={s.key} className={`tracker-step${done ? ' done' : ''}${isCurrent ? ' current' : ''}`}>
            <div className="tracker-dot">{i < idx ? <Check size={14} /> : i + 1}</div>
            {s.label}
          </div>
        );
      })}
    </div>
  );
}
