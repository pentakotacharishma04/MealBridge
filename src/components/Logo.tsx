import { Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link to={to} className="logo" aria-label="MealBridge home">
      <span className="logo-mark">
        <Leaf size={20} color="#ffffff" aria-hidden="true" />
      </span>
      MealBridge
    </Link>
  );
}
