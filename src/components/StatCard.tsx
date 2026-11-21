import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="card stat">
      <div className="stat-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {hint && <div className="hint">{hint}</div>}
      </div>
    </div>
  );
}
