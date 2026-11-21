import { useMemo, useState } from 'react';
import { Route } from 'lucide-react';
import { useNow, useStore } from '../lib/store';
import { useToast } from '../components/Toast';
import { DONORS, RECEIVERS } from '../data/seed';
import { claimError, urgencyLevel } from '../lib/status';
import { rankDonations, WEIGHTS, type MatchResult } from '../lib/matching';
import { formatRemaining, formatTime, minutesUntil, uid } from '../lib/time';
import { Stepper } from '../components/Stepper';
import { EmptyState } from '../components/EmptyState';

const pct = (w: number) => `${Math.round(w * 100)}%`;

export default function SmartMatches() {
  const { state, dispatch } = useStore();
  const now = useNow(30000);
  const { toast } = useToast();

  const ranked = useMemo(
    () => rankDonations(state.donations, RECEIVERS, state.rescues, now),
    [state.donations, state.rescues, now],
  );

  const [pickedId, setPickedId] = useState<string | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const current = ranked.find((r) => r.donation.id === pickedId) ?? ranked[0] ?? null;
  const matches: MatchResult[] = current?.matches ?? [];
  const recommended = matches.find((m) => m.gate === 1) ?? null;
  const chosen = matches.find((m) => m.receiver.id === receiverId) ?? recommended ?? matches[0] ?? null;

  const maxClaim = chosen ? Math.max(0, chosen.claimable) : 0;
  const portions = Math.max(1, Math.min(qty, maxClaim));
  const canClaim = !!current && !!chosen && chosen.gate === 1 && maxClaim >= 1;

  const donorName = (id: string) => DONORS.find((d) => d.id === id)?.name ?? 'Donor';

  const pick = (donationId: string) => {
    setPickedId(donationId);
    setReceiverId(null);
    setQty(1);
  };

  const chooseReceiver = (id: string) => {
    setReceiverId(id);
    setQty(1);
  };

  const claim = () => {
    if (!current || !chosen) return;
    const d = current.donation;
    const at = Date.now();
    if (chosen.gate === 0) {
      toast(`${chosen.receiver.name} cannot take this donation.`, 'error');
      return;
    }
    const err =
      claimError(d, portions, at) ??
      (portions > chosen.capacity ? `${chosen.receiver.name} has only ${chosen.capacity} portions of capacity left.` : null);
    if (err) {
      toast(err, 'error');
      return;
    }
    dispatch({
      type: 'claimDonation',
      now: at,
      rescue: {
        id: uid('r'),
        donationId: d.id,
        receiverId: chosen.receiver.id,
        portions,
        status: 'CLAIMED',
        collectedBy: chosen.receiver.hasVehicle ? 'ngo' : 'volunteer',
        timeline: [],
        createdAt: new Date(at).toISOString(),
      },
    });
    toast(`Claimed ${portions} portions of "${d.foodName}" for ${chosen.receiver.name}`, 'success');
    setQty(1);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Smart matches</h1>
          <p>Rule-based and explainable. Every score shows the factors behind it. This is not AI.</p>
        </div>
      </div>

      <section className="card" style={{ marginBottom: 24 }}>
        <div className="card-title">
          <h2><Route size={18} style={{ verticalAlign: 'text-bottom' }} /> How the score works</h2>
        </div>
        <p>
          <strong>Rescue Priority Score = {pct(WEIGHTS.urgency)} urgency + {pct(WEIGHTS.distance)} distance + {pct(WEIGHTS.quantityFit)} quantity/capacity fit + {pct(WEIGHTS.need)} receiver need</strong>
        </p>
        <p className="small muted">
          Gated to 0 if the receiver does not accept the category, or if the food is refrigerated and the receiver has no cold storage.
          Urgency rises as the pickup deadline nears. Distance falls to 0 at 10 km. Quantity fit penalises receivers with too little capacity.
          Receiver need uses the stated need level and open requests.
        </p>
      </section>

      <div className="grid grid-2">
        <section className="card">
          <div className="card-title"><h2>Claimable donations</h2><span className="hint">Ranked by priority</span></div>
          {ranked.length === 0 && (
            <EmptyState
              title="Nothing claimable right now"
              text="Every donation is expired, cancelled or fully allocated. Post a new donation to see matches."
            />
          )}
          {ranked.map((r) => {
            const d = r.donation;
            const u = urgencyLevel(minutesUntil(Date.parse(d.deadlineAt), now));
            const selected = current?.donation.id === d.id;
            return (
              <button
                type="button"
                key={d.id}
                className="list-item"
                aria-pressed={selected}
                onClick={() => pick(d.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: selected ? 'var(--cream)' : undefined,
                  border: selected ? '2px solid var(--forest)' : undefined,
                  borderRadius: 8,
                  cursor: 'pointer',
                  font: 'inherit',
                  color: 'inherit',
                }}
              >
                <div className="grow">
                  <strong>{d.foodName}</strong>
                  <div className="small muted">{donorName(d.donorId)} · {d.location.label}</div>
                  <div className="small">
                    {d.portionsRemaining} portions · {d.storage} · pickup by {formatTime(d.deadlineAt)} · {formatRemaining(Date.parse(d.deadlineAt), now)}
                  </div>
                </div>
                <div className="stack" style={{ textAlign: 'right' }}>
                  <span className="tag">Priority {r.priority}</span>
                  <span className={`urgency urgency-${u}`}>{u}</span>
                </div>
              </button>
            );
          })}
        </section>

        <section className="card">
          {!current && (
            <EmptyState title="Select a donation" text="Choose a claimable donation to see ranked receivers." />
          )}
          {current && (
            <>
              <div className="card-title">
                <h2>{current.donation.foodName}</h2>
                <span className="tag">Priority {current.priority}</span>
              </div>
              <p className="small muted">
                {current.donation.portionsRemaining} portions left · {current.donation.storage} · pickup by {formatTime(current.donation.deadlineAt)}
              </p>

              {matches.map((m) => {
                const isRecommended = m === recommended;
                const isChosen = chosen?.receiver.id === m.receiver.id;
                const u = urgencyLevel(m.minutesLeft);
                return (
                  <div
                    key={m.receiver.id}
                    className="list-item"
                    style={{
                      alignItems: 'flex-start',
                      opacity: m.gate === 1 ? 1 : 0.6,
                      border: isChosen ? '2px solid var(--forest)' : undefined,
                      borderRadius: 8,
                    }}
                  >
                    <div className="grow">
                      <div className="row" style={{ gap: 8 }}>
                        <strong>{m.receiver.name}</strong>
                        {isRecommended && <span className="tag">Recommended</span>}
                        <span className={`urgency urgency-${u}`}>{u}</span>
                      </div>
                      <div className="small">
                        Match score <strong>{m.match}</strong> · {m.km.toFixed(1)} km away · capacity left {m.capacity} · due {formatTime(current.donation.deadlineAt)}
                      </div>
                      <div className="small muted">
                        Urgency {Math.round(m.urgency)} · Distance {Math.round(m.distanceScore)} · Fit {Math.round(m.quantityFitScore)} · Need {Math.round(m.needScore)}
                      </div>
                      <ul className="small" style={{ margin: '6px 0', paddingLeft: 18 }}>
                        {m.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                      <div className="small"><strong>Recommended action:</strong> {m.action}</div>
                    </div>
                    <button
                      type="button"
                      className={`btn btn-sm ${isChosen ? 'btn-rescue' : 'btn-ghost'}`}
                      disabled={m.gate === 0}
                      aria-pressed={isChosen}
                      onClick={() => chooseReceiver(m.receiver.id)}
                    >
                      {isChosen ? 'Selected' : 'Select'}
                    </button>
                  </div>
                );
              })}

              {chosen && (
                <div className="stack" style={{ marginTop: 16 }}>
                  <div className="row" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <span className="label">Portions to claim</span>
                      <div className="hint">Limit: min({current.donation.portionsRemaining} remaining, {chosen.capacity} receiver capacity) = {maxClaim}</div>
                    </div>
                    <Stepper value={portions} min={1} max={Math.max(1, maxClaim)} onChange={setQty} label="Portions to claim" />
                  </div>
                  <button type="button" className="btn btn-rescue btn-block" disabled={!canClaim} onClick={claim}>
                    Claim {portions} portions for {chosen.receiver.name}
                  </button>
                  {!canClaim && chosen.gate === 0 && (
                    <p className="hint">This receiver is gated to 0 for this donation, so it cannot be claimed.</p>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
