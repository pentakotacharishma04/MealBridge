import { NavLink, Outlet } from 'react-router-dom';
import { Sidebar, NAV_ITEMS } from './Sidebar';
import { TopBar } from './TopBar';

/** App shell: sidebar (desktop), top bar, page outlet, and bottom tab bar (below 1024px). */
export function Layout() {
  return (
    <div className="app">
      <Sidebar />
      <div style={{ minWidth: 0 }}>
        <TopBar />
        <main className="main">
          <Outlet />
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Main tabs">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <Icon size={20} aria-hidden="true" />
              {item.short}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
