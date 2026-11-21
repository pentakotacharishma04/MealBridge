import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { useStore } from '../lib/store';
import { LOCATIONS, buildSeedState } from '../data/seed';
import { useToast } from '../components/Toast';
import { Modal } from '../components/Modal';
import { InfoDialog, type InfoKey } from '../components/InfoDialog';
import type { Profile as ProfileData, Settings } from '../lib/types';

type Tab = 'profile' | 'notifications' | 'data';

const TABS: { key: Tab; label: string }[] = [
  { key: 'profile', label: 'Profile' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'data', label: 'Data' },
];

const ROLES: ProfileData['role'][] = ['Donor', 'Receiving NGO', 'Volunteer'];
const AREAS = Array.from(new Set(LOCATIONS.map((l) => l.area)));

const TOGGLES: { key: keyof Settings; label: string; hint: string }[] = [
  { key: 'notifyClaims', label: 'Claims', hint: 'When a receiver claims part of your donation.' },
  { key: 'notifyStatus', label: 'Status updates', hint: 'When a pickup is accepted, collected or delivered.' },
  { key: 'notifyDonations', label: 'New donations', hint: 'When a new donation is posted or cancelled.' },
];

export default function Profile() {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState(state.profile.name);
  const [role, setRole] = useState<ProfileData['role']>(state.profile.role);
  const [area, setArea] = useState(state.profile.area);
  const [resetOpen, setResetOpen] = useState(false);
  const [info, setInfo] = useState<InfoKey | null>(null);

  const saveProfile = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast('Please enter a name.', 'error');
      return;
    }
    dispatch({ type: 'updateProfile', profile: { name: trimmed, role, area } });
    setName(trimmed);
    toast('Profile saved', 'success');
  };

  const setToggle = (key: keyof Settings, on: boolean) => {
    dispatch({ type: 'updateSettings', settings: { ...state.settings, [key]: on } });
    toast(on ? 'Notifications turned on' : 'Notifications turned off', 'info');
  };

  const confirmReset = () => {
    const seed = buildSeedState(Date.now());
    dispatch({ type: 'resetDemo', state: seed });
    setName(seed.profile.name);
    setRole(seed.profile.role);
    setArea(seed.profile.area);
    setResetOpen(false);
    toast('Demo data reset to the sample dataset', 'success');
  };

  const exportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      note: 'Fictional sample data from the MealBridge hackathon prototype.',
      donations: state.donations,
      rescues: state.rescues,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mealbridge-rescues-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast('Export downloaded', 'success');
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Profile & settings</h1>
          <p>Your details, notification preferences and demo data controls.</p>
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
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <section className="card" style={{ maxWidth: 560 }}>
          <div className="field">
            <label htmlFor="pname">Name</label>
            <input id="pname" className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </div>
          <div className="field">
            <label htmlFor="prole">Role</label>
            <select id="prole" className="select" value={role} onChange={(e) => setRole(e.target.value as ProfileData['role'])}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="parea">Area</label>
            <select id="parea" className="select" value={area} onChange={(e) => setArea(e.target.value)}>
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-rescue" onClick={saveProfile} disabled={!name.trim()}>
            Save profile
          </button>
        </section>
      )}

      {tab === 'notifications' && (
        <section className="card" style={{ maxWidth: 560 }}>
          <p className="small muted">Choose which events add an entry to your notifications. Turned-off types are not recorded.</p>
          {TOGGLES.map((t) => {
            const on = state.settings[t.key];
            return (
              <div key={t.key} className="list-item" style={{ alignItems: 'center' }}>
                <div className="grow">
                  <strong>{t.label}</strong>
                  <div className="small muted">{t.hint}</div>
                </div>
                <button
                  role="switch"
                  aria-checked={on}
                  aria-label={`${t.label} notifications`}
                  className={`toggle${on ? ' on' : ''}`}
                  onClick={() => setToggle(t.key, !on)}
                />
              </div>
            );
          })}
          <div className="small muted" style={{ marginTop: 16 }}>
            {state.notifications.length} notification(s) stored.
          </div>
        </section>
      )}

      {tab === 'data' && (
        <section className="card" style={{ maxWidth: 560 }}>
          <div className="stack">
            <div>
              <strong>Export rescue data</strong>
              <p className="small muted">Downloads donations and rescues as a JSON file. Nothing is uploaded.</p>
              <button className="btn btn-ghost" onClick={exportData}>
                <Download size={16} /> Export rescue data (JSON)
              </button>
            </div>
            <div>
              <strong>Reset demo data</strong>
              <p className="small muted">Replaces everything in this browser with the original sample dataset.</p>
              <button className="btn btn-danger" onClick={() => setResetOpen(true)}>
                <RotateCcw size={16} /> Reset demo data
              </button>
            </div>
          </div>
        </section>
      )}

      <p className="small muted" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setInfo('safety')}>
          Safety
        </button>{' '}
        <button className="btn btn-ghost btn-sm" onClick={() => setInfo('privacy')}>
          Privacy
        </button>
        <br />
        MealBridge does not certify food safety.
      </p>

      <InfoDialog kind={info} onClose={() => setInfo(null)} />

      <Modal
        open={resetOpen}
        title="Reset demo data?"
        onClose={() => setResetOpen(false)}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={confirmReset}>
              Yes, reset everything
            </button>
          </>
        }
      >
        <p>This removes all donations, rescues, notifications and profile edits made in this browser and restores the sample data.</p>
      </Modal>
    </div>
  );
}
