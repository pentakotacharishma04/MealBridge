import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  text: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, text, icon, action }: EmptyStateProps) {
  return (
    <div className="empty">
      {icon && <div style={{ marginBottom: 8 }}>{icon}</div>}
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
