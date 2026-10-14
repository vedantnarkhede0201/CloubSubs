import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ResourcePage from './components/ResourcePage';
import { resources } from './config/resources';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  const { admin, loading } = useAuth();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={loading ? <main className="auth-loading">Checking your session…</main> : admin ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ResourcePage resource={resources.clients} />} />
            <Route path="/pricing-tiers" element={<ResourcePage resource={resources['pricing-tiers']} />} />
            <Route path="/subscriptions" element={<ResourcePage resource={resources.subscriptions} />} />
            <Route path="/invoices" element={<ResourcePage resource={resources.invoices} />} />
            <Route path="/payments" element={<ResourcePage resource={resources.payments} />} />
            <Route path="/usage" element={<ResourcePage resource={resources['usage-records']} />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
