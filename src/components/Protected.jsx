import { Navigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
export default function Protected({ children, requirePro = false }) {
  const { session, profile, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  if (requirePro && profile?.role !== 'pro') return <Navigate to="/pricing" replace />;
  return children;
}
