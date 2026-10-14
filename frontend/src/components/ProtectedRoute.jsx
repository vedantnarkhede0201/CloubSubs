import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { admin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <main className="auth-loading" aria-live="polite">Checking your session…</main>;
  }

  if (!admin) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
