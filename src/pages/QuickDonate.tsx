import { useMemo, useState, type FormEvent } from 'react';
import { Eye, Pencil, XCircle } from 'lucide-react';
import { useNow, useStore } from '../lib/store';
import { useToast } from '../components/Toast';
import { DONORS, LOCATIONS } from '../data/seed';
import { deriveStatus, urgencyLevel } from '../lib/status';
import {
  ALLERGENS,
  CATEGORIES,
  STORAGES,
  type Allergen,
  type Donation,
  type DonationCategory,
  type Storage,
} from '../lib/types';
import { formatDateTime, formatRemaining, formatTime, fromLocalInputValue, minutesUntil, nowIso, toLocalInputValue, todayAt, uid } from '../lib/time';
import { Modal } from '../components/Modal';
import { FoodSafetyNotice } from '../components/FoodSafetyNotice';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';

interface FormState {
  foodName: string;
  category: DonationCategory;
  portions: number;
  description: string;
  preparedAt: string;
  readyAt: string;
  deadlineAt: string;
  storage: Storage;
  allergens: Allergen[];
  location: string;
  donorId: string;
  notes: string;
}

type Field = 'foodName' | 'portions' | 'preparedAt' | 'readyAt' | 'deadlineAt' | 'allergens' | 'location' | 'donorId';

const EMPTY: FormState = {
  foodName: '',
  category: 'Cooked meals',
  portions: 1,
  description: '',
  preparedAt: '',
  readyAt: '',
  deadlineAt: '',
  storage: 'Ambient',
  allergens: [],
  location: '',
  donorId: '',
  notes: '',
};

/** Event buffet scenario: 40 hot-held meal boxes, deadline 9:30 PM today. */
function eventBuffetPreset(): FormState {
  return {
    foodName: 'Event buffet meal boxes',
    category: 'Cooked meals',
    portions: 40,
    description: 'Mixed vegetable pulao, paneer curry, dal and sweets packed in 40 boxes after a banquet.',
    preparedAt: toLocalInputValue(todayAt(18, 0)),
    readyAt: toLocalInputValue(todayAt(20, 45)),
    deadlineAt: toLocalInputValue(todayAt(21, 30)),
    storage: 'Hot-held',
    allergens: ['Dairy', 'Gluten'],
    location: 'Madhapur Event Lawn',
    donorId: 'd-saffron',
    notes: 'Boxes are sealed. Collect from the loading bay.',
  };
}

/** Inline validation. Returns one message per invalid field. */
function validate(f: FormState, now: number, claimed: number): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  if (!f.foodName.trim()) e.foodName = 'Food name is required.';
  if (!Number.isInteger(f.portions) || f.portions < 1) {
    e.portions = 'Quantity must be at least 1 portion.';
  } else if (f.portions < claimed) {
    e.portions = `Cannot be below the ${claimed} portions already claimed.`;
  }
  const prep = fromLocalInputValue(f.preparedAt);
  const ready = fromLocalInputValue(f.readyAt);
  const deadline = fromLocalInputValue(f.deadlineAt);
  if (Number.isNaN(prep)) e.preparedAt = 'Preparation time is required.';
  if (Number.isNaN(ready)) {
    e.readyAt = 'Ready-for-pickup time is required.';
  } else if (!Number.isNaN(prep) && ready < prep) {
    e.readyAt = 'Ready time cannot be before the preparation time.';
  }
  if (Number.isNaN(deadline)) {
    e.deadlineAt = 'Pickup deadline is required.';
  } else if (deadline <= now) {
    e.deadlineAt = 'Pickup deadline must be in the future.';
  } else if (!Number.isNaN(ready) && deadline <= ready) {
    e.deadlineAt = 'Pickup deadline must be after the ready time.';
  }
  if (f.allergens.length === 0) e.allergens = 'Select at least one allergen, or "None known".';
  if (!f.location) e.location = 'Pickup location is required.';
  if (!f.donorId) e.donorId = 'Donor organisation is required.';
  return e;
}

export default function QuickDonate() {
  const { state, dispatch } = useStore();
  const now = useNow(30000);
  const { toast } = useToast();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Donation | null>(null);
  const [scope, setScope] = useState<'donor' | 'all'>('donor');

  const editing = editingId ? (state.donations.find((d) => d.id === editingId) ?? null) : null;
  const claimed = editing ? editing.portionsTotal - editing.portionsRemaining : 0;
  const errors = useMemo(() => validate(form, now, claimed), [form, now, claimed]);
  const hasErrors = Object.keys(errors).length > 0;
  const showErr = (k: Field) => (attempted || touched[k] ? errors[k] : undefined);

  const donorName = (id: string) => DONORS.find((d) => d.id === id)?.name ?? 'Donor';

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setTouched((t) => ({ ...t, [key]: true }));
  };

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setTouched({});
    setAttempted(false);
  };

  /** Quick-add buttons. Prep counts from now, ready from prep, deadline from ready. */
  const addMinutes = (key: 'preparedAt' | 'readyAt' | 'deadlineAt', mins: number) => {
    const base =
      key === 'preparedAt'
        ? now
        : fromLocalInputValue(key === 'readyAt' ? form.preparedAt : form.readyAt);
    const start = Number.isNaN(base) ? now : base;
    set(key, toLocalInputValue(start + mins * 60000));
  };

  const toggleAllergen = (a: Allergen) => {
    let next: Allergen[];
    if (a === 'None known') {
      next = form.allergens.includes('None known') ? [] : ['None known'];
    } else {
      const without = form.allergens.filter((x) => x !== 'None known' && x !== a);
      next = form.allergens.includes(a) ? without : [...without, a];
    }
    set('allergens', next);
  };

  const loadForEdit = (d: Donation) => {
    setEditingId(d.id);
    setForm({
      foodName: d.foodName,
      category: d.category,
      portions: d.portionsTotal,
      description: d.description,
      preparedAt: toLocalInputValue(Date.parse(d.preparedAt)),
      readyAt: toLocalInputValue(Date.parse(d.readyAt)),
      deadlineAt: toLocalInputValue(Date.parse(d.deadlineAt)),
      storage: d.storage,
      allergens: d.allergens,
      location: d.location.label,
      donorId: d.donorId,
      notes: d.notes,
    });
    setTouched({});
    setAttempted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadPreset = () => {
    setEditingId(null);
    setForm(eventBuffetPreset());
    setTouched({});
    setAttempted(false);
    toast('Event buffet preset loaded. Review the times, then preview.', 'info');
  };

  const buildDonation = (): Donation => {
    const location = LOCATIONS.find((l) => l.label === form.location) ?? LOCATIONS[0];
    const iso = (v: string) => new Date(fromLocalInputValue(v)).toISOString();
    const base = {
      foodName: form.foodName.trim(),
      category: form.category,
      portionsTotal: form.portions,
      description: form.description.trim(),
      preparedAt: iso(form.preparedAt),
      readyAt: iso(form.readyAt),
      deadlineAt: iso(form.deadlineAt),
      storage: form.storage,
      allergens: form.allergens,
      location,
      donorId: form.donorId,
      notes: form.notes.trim(),
    };
    if (editing) {
      // The reducer recalculates portionsRemaining from what is already claimed.
      return { ...editing, ...base };
    }
    return {
      ...base,
      id: uid('don'),
      portionsRemaining: form.portions,
      cancelled: false,
      createdAt: nowIso(),
      createdBy: 'me',
    };
  };

  const onReview = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (hasErrors) {
      toast('Please fix the highlighted fields.', 'error');
      return;
    }
    setPreviewOpen(true);
  };

  const confirmPost = () => {
    const donation = buildDonation();
    if (editing) {
      dispatch({ type: 'updateDonation', donation });
      toast(`Updated "${donation.foodName}"`, 'success');
    } else {
      dispatch({ type: 'createDonation', donation });
      toast(`Donation posted: ${donation.foodName}`, 'success');
    }
    setPreviewOpen(false);
    resetForm();
  };

  const confirmCancel = () => {
    if (!cancelTarget) return;
    dispatch({ type: 'cancelDonation', id: cancelTarget.id, at: nowIso() });
    toast(`Cancelled "${cancelTarget.foodName}"`, 'info');
    if (editingId === cancelTarget.id) resetForm();
    setCancelTarget(null);
  };

  const listed = state.donations
    .filter((d) => scope === 'all' || !form.donorId || d.donorId === form.donorId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  const previewLocation = LOCATIONS.find((l) => l.label === form.location);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{editing ? `Edit "${editing.foodName}"` : 'Quick donate'}</h1>
          <p>Post surplus food so nearby NGOs and volunteers can claim it before it goes to waste.</p>
        </div>
        <div className="row">
          <button type="button" className="btn btn-ghost" onClick={loadPreset}>
            Event buffet: 40 meal boxes
          </button>
        </div>
      </div>

      <FoodSafetyNotice />

      <div className="grid grid-2" style={{ marginTop: 16, marginBottom: 24 }}>
        <section className="card">
          <div className="card-title">
            <h2>{editing ? 'Edit donation' : 'New donation'}</h2>
            {editing && <span className="hint">Editing</span>}
          </div>

          <form onSubmit={onReview} noValidate>
            <div className="field">
              <label htmlFor="qd-food">Food name</label>
              <input
                id="qd-food"
                value={form.foodName}
                onChange={(e) => set('foodName', e.target.value)}
                placeholder="e.g. Vegetable biryani boxes"
              />
              {showErr('foodName') && <span className="error">{showErr('foodName')}</span>}
            </div>

            <div className="field">
              <span className="label">Category</span>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                {CATEGORIES.map((c) => {
                  const on = form.category === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      className={`chip${on ? ' on' : ''}`}
                      aria-pressed={on}
                      onClick={() => set('category', c)}
                      style={{ justifyContent: 'center', padding: '10px 12px' }}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="field">
              <span className="label">Quantity (portions)</span>
              <div className="row">
                <div className="stepper" role="group" aria-label="Portions">
                  <button type="button" onClick={() => set('portions', Math.max(1, form.portions - 1))} disabled={form.portions <= 1} aria-label="Decrease">−</button>
                  <span>{form.portions}</span>
                  <button type="button" onClick={() => set('portions', Math.min(500, form.portions + 1))} disabled={form.portions >= 500} aria-label="Increase">+</button>
                </div>
              </div>
              {showErr('portions') && <span className="error">{showErr('portions')}</span>}
            </div>

            <div className="field">
              <label htmlFor="qd-desc">Description</label>
              <textarea
                id="qd-desc"
                rows={2}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What is in it, portion size, packaging"
              />
            </div>

            {(
              [
                ['preparedAt', 'Preparation time'],
                ['readyAt', 'Ready for pickup'],
                ['deadlineAt', 'Pickup deadline'],
              ] as const
            ).map(([key, label]) => (
              <div className="field" key={key}>
                <label htmlFor={`qd-${key}`}>{label}</label>
                <input
                  id={`qd-${key}`}
                  type="datetime-local"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                />
                <div className="row" style={{ gap: 6 }}>
                  {[30, 60, 120].map((m) => (
                    <button type="button" key={m} className="btn btn-sm btn-ghost" onClick={() => addMinutes(key, m)}>
                      +{m === 60 ? '1 h' : m === 120 ? '2 h' : `${m} min`}
                    </button>
                  ))}
                </div>
                {showErr(key) && <span className="error">{showErr(key)}</span>}
              </div>
            ))}

            <div className="field">
              <span className="label">Storage</span>
              <div className="chips">
                {STORAGES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`chip${form.storage === s ? ' on' : ''}`}
                    aria-pressed={form.storage === s}
                    onClick={() => set('storage', s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="label">Allergens</span>
              <div className="chips">
                {ALLERGENS.map((a) => {
                  const on = form.allergens.includes(a);
                  return (
                    <button
                      type="button"
                      key={a}
                      className={`chip${on ? ' on' : ''}`}
                      aria-pressed={on}
                      onClick={() => toggleAllergen(a)}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              {showErr('allergens') && <span className="error">{showErr('allergens')}</span>}
            </div>

            <div className="field">
              <label htmlFor="qd-location">Pickup location</label>
              <select id="qd-location" value={form.location} onChange={(e) => set('location', e.target.value)}>
                <option value="">Select a location</option>
                {LOCATIONS.map((l) => (
                  <option key={l.label} value={l.label}>{l.label} ({l.area})</option>
                ))}
              </select>
              {showErr('location') && <span className="error">{showErr('location')}</span>}
            </div>

            <div className="field">
              <label htmlFor="qd-donor">Donor organisation</label>
              <select id="qd-donor" value={form.donorId} onChange={(e) => set('donorId', e.target.value)}>
                <option value="">Select a donor</option>
                {DONORS.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.kind})</option>
                ))}
              </select>
              {showErr('donorId') && <span className="error">{showErr('donorId')}</span>}
            </div>

            <div className="field">
              <label htmlFor="qd-notes">Notes (optional)</label>
              <textarea
                id="qd-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Access instructions, contact person, etc."
              />
            </div>

            <div className="row" style={{ justifyContent: 'space-between' }}>
              <button type="button" className="btn btn-ghost" onClick={resetForm}>
                {editing ? 'Cancel edit' : 'Clear form'}
              </button>
              <button type="submit" className="btn btn-rescue">
                <Eye size={16} /> Preview donation
              </button>
            </div>
          </form>
        </section>

        <section className="card">
          <div className="card-title">
            <h2>My donations</h2>
            <div className="row" style={{ gap: 6 }}>
              <button type="button" className={`chip${scope === 'donor' ? ' on' : ''}`} aria-pressed={scope === 'donor'} onClick={() => setScope('donor')}>
                Selected donor
              </button>
              <button type="button" className={`chip${scope === 'all' ? ' on' : ''}`} aria-pressed={scope === 'all'} onClick={() => setScope('all')}>
                All donors
              </button>
            </div>
          </div>
          {scope === 'donor' && !form.donorId && <p className="hint">Select a donor in the form to filter. Showing all donations.</p>}
          {listed.length === 0 && <EmptyState title="No donations here yet" text="Post a donation with the form to see it listed here." />}
          {listed.map((d) => {
            const s = deriveStatus(d, state.rescues, now);
            const active = s === 'POSTED' || s === 'CLAIMED' || s === 'COLLECTED';
            const u = urgencyLevel(minutesUntil(Date.parse(d.deadlineAt), now));
            return (
              <div key={d.id} className="list-item" style={editingId === d.id ? { outline: '2px solid var(--forest)', borderRadius: 8 } : undefined}>
                <div className="grow">
                  <div className="row" style={{ gap: 8 }}>
                    <strong>{d.foodName}</strong>
                    <StatusBadge status={s} />
                    {active && <span className={`urgency urgency-${u}`}>{u}</span>}
                  </div>
                  <div className="small muted">{donorName(d.donorId)} · {d.location.label}</div>
                  <div className="small">
                    {d.portionsRemaining} of {d.portionsTotal} portions left · Pickup by {formatTime(d.deadlineAt)}
                    {active && ` · ${formatRemaining(Date.parse(d.deadlineAt), now)}`}
                  </div>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => loadForEdit(d)} disabled={d.cancelled} aria-label={`Edit ${d.foodName}`}>
                    <Pencil size={14} /> Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => setCancelTarget(d)} disabled={d.cancelled} aria-label={`Cancel ${d.foodName}`}>
                    <XCircle size={14} /> Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      <Modal
        open={previewOpen}
        title="Preview donation"
        onClose={() => setPreviewOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setPreviewOpen(false)}>Back to edit</button>
            <button type="button" className="btn btn-rescue" onClick={confirmPost}>
              {editing ? 'Save changes' : 'Confirm and post'}
            </button>
          </>
        }
      >
        <dl className="small" style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px' }}>
          <dt>Food</dt><dd>{form.foodName.trim()} ({form.category})</dd>
          <dt>Portions</dt><dd>{form.portions}</dd>
          <dt>Donor</dt><dd>{donorName(form.donorId)}</dd>
          <dt>Storage</dt><dd>{form.storage}</dd>
          <dt>Allergens</dt><dd>{form.allergens.join(', ')}</dd>
          <dt>Prepared</dt><dd>{formatDateTime(fromLocalInputValue(form.preparedAt))}</dd>
          <dt>Ready</dt><dd>{formatDateTime(fromLocalInputValue(form.readyAt))}</dd>
          <dt>Pickup by</dt><dd>{formatDateTime(fromLocalInputValue(form.deadlineAt))}</dd>
          <dt>Location</dt><dd>{previewLocation ? `${previewLocation.label} (${previewLocation.area})` : form.location}</dd>
          {form.description.trim() && (<><dt>Description</dt><dd>{form.description.trim()}</dd></>)}
          {form.notes.trim() && (<><dt>Notes</dt><dd>{form.notes.trim()}</dd></>)}
        </dl>
        <div style={{ marginTop: 16 }}>
          <FoodSafetyNotice />
        </div>
      </Modal>

      <Modal
        open={cancelTarget !== null}
        title="Cancel donation?"
        onClose={() => setCancelTarget(null)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setCancelTarget(null)}>Keep it</button>
            <button type="button" className="btn btn-danger" onClick={confirmCancel}>Yes, cancel donation</button>
          </>
        }
      >
        <p>
          "{cancelTarget?.foodName}" will be marked cancelled and removed from matching and available food.
          This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
