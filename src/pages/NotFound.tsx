import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 80 }}>
      <SearchX size={48} aria-hidden="true" />
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist or has moved.</p>
      <Link to="/" className="btn btn-rescue" style={{ marginTop: 16 }}>
        Back to home
      </Link>
    </div>
  );
}
