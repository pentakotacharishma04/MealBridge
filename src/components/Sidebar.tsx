import { NavLink } from 'react-router-dom';
import { BarChart3, LayoutDashboard, PlusCircle, Sparkles, Truck, UserRound, Utensils, type LucideIcon } from 'lucide-react';
import { Logo } from './Logo';

export interface NavItem {
  to: string;
  label: string;
  short: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard },
  { to: '/available', label: 'Available Food', short: 'Food', icon: Utensils },
  { to: '/donate', label: 'Quick Donate', short: 'Donate', icon: PlusCircle },
  { to: '/matches', label: 'Smart Matches', short: 'Matches', icon: Sparkles },
  { to: '/delivery', label: 'Pickup & Delivery', short: 'Pickup', icon: Truck },
  { to: '/impact', label: 'Impact', short: 'Impact', icon: BarChart3 },
  { to: '/profile', label: 'Profile', short: 'Profile', icon: UserRound },
];

/** Fixed left sidebar, shown on desktop (>= 1024px). */
export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Main navigation">
      <Logo to="/dashboard" />
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
      <div className="sidebar-foot">Synthetic demo data. Hyderabad pilot area.</div>
    </aside>
  );
}
