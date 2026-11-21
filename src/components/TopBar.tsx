import { useEffect, useRef, useState } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore, useNow } from '../lib/store';
import { timeAgo } from '../lib/time';
import { useToast } from './Toast';
import { Logo } from './Logo';

/** Top bar with logo, notification bell dropdown (unread count, mark all read) and profile menu. */
export function TopBar() {
  const { state, dispatch } = useStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  const now = useNow(60000);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (bellRef.current && !bellRef.current.contains(t)) setBellOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const unread = state.notifications.filter((n) => !n.read).length;
  const initials = state.profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const go = (to: string) => {
    setProfileOpen(false);
    navigate(to);
  };

  return (
    <header className="topbar">
      <div className="row" style={{ gap: 8 }}>
        <span className="mobile-logo">
          <Logo />
        </span>
      </div>
      <div className="row" style={{ gap: 12 }}>
        <div className="rel" ref={bellRef}>
          <button
            className="icon-btn"
            aria-label={`Notifications, ${unread} unread`}
            aria-expanded={bellOpen}
            onClick={() => {
              setBellOpen((o) => !o);
              setProfileOpen(false);
            }}
          >
            <Bell size={18} />
            {unread > 0 && <span className="badge-dot">{unread}</span>}
          </button>
          {bellOpen && (
            <div className="menu" role="dialog" aria-label="Notifications">
              <div className="menu-head">
                <strong>Notifications</strong>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    dispatch({ type: 'markNotificationsRead' });
                    toast('All notifications marked as read', 'success');
                  }}
                >
                  Mark all read
                </button>
              </div>
              <div className="menu-list">
                {state.notifications.length === 0 && <div className="menu-item muted">No notifications yet.</div>}
                {state.notifications.map((n) => (
                  <div key={n.id} className={`menu-item${n.read ? '' : ' unread'}`}>
                    <div>{n.text}</div>
                    <div className="hint">{timeAgo(n.at, now)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rel" ref={profileRef}>
          <button
            className="profile-btn"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((o) => !o);
              setBellOpen(false);
            }}
          >
            <span className="avatar">{initials}</span>
            <span className="small" style={{ fontWeight: 600 }}>{state.profile.name.split(' ')[0]}</span>
            <ChevronDown size={14} />
          </button>
          {profileOpen && (
            <div className="menu" role="menu" style={{ width: 240 }}>
              <div className="menu-head">
                <div>
                  <strong>{state.profile.name}</strong>
                  <div className="hint">
                    {state.profile.role} · {state.profile.area}
                  </div>
                </div>
              </div>
              <button className="menu-action" role="menuitem" onClick={() => go('/profile')}>
                View profile
              </button>
              <button className="menu-action" role="menuitem" onClick={() => go('/profile?tab=notifications')}>
                Notification settings
              </button>
              <button className="menu-action" role="menuitem" onClick={() => go('/profile?tab=data')}>
                Data and reset
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
