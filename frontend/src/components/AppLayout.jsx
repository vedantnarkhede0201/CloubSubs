import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const navigation = [
  { to: '/dashboard', label: 'Overview', icon: '◫' },
  { to: '/clients', label: 'Clients', icon: '◉' },
  { to: '/pricing-tiers', label: 'Pricing tiers', icon: '◇' },
  { to: '/subscriptions', label: 'Subscriptions', icon: '↻' },
  { to: '/invoices', label: 'Invoices', icon: '▤' },
  { to: '/payments', label: 'Payments', icon: '⇄' },
  { to: '/usage', label: 'Usage records', icon: '⌁' },
  { to: '/reports', label: 'Reports', icon: '▥' }
];

export default function AppLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [databaseConnected, setDatabaseConnected] = useState(null);
  const [logoutError, setLogoutError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function checkHealth() {
      try {
        const { data } = await api.get('/health');
        if (mounted) setDatabaseConnected(data.success === true);
      } catch {
        if (mounted) setDatabaseConnected(false);
      }
    }
    checkHealth();
    const intervalId = window.setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const connectionLabel = databaseConnected === null
    ? 'Checking database'
    : databaseConnected
      ? 'Database connected'
      : 'Database unavailable';
  const pageTitle = navigation.find((item) => item.to === location.pathname)?.label || 'Workspace';
  const adminInitials = admin?.Admin_Name
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'AD';

  async function handleLogout() {
    setLogoutError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch {
      setLogoutError('The server could not confirm logout. Please try again after reconnecting.');
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="workspace-identity">
          <NavLink className="brand" to="/" aria-label="CloudSubs home">
            <span className="brand-mark" aria-hidden="true">C</span>
            <span>CloudSubs</span>
          </NavLink>
          <span>Billing administration</span>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.label}
              title={item.label}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className={`connection-indicator ${databaseConnected === false ? 'connection-error' : ''}`}><span aria-hidden="true" />{connectionLabel}</div>
          <p>CloudSubs Billing</p>
          <small>Subscription management</small>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark" aria-hidden="true">C</span>
            <strong>CloudSubs</strong>
          </div>
          <div className="breadcrumb"><span>CloudSubs</span><span aria-hidden="true">/</span><strong>{pageTitle}</strong></div>
          <div className="topbar-spacer" />
          <span className={`topbar-status ${databaseConnected === false ? 'connection-error' : ''}`}><span aria-hidden="true" /> {connectionLabel}</span>
          <span className="admin-name">{admin?.Admin_Name}</span>
          <div className="avatar" aria-label={`Administrator ${admin?.Admin_Name || ''}`}>{adminInitials}</div>
          <button type="button" className="button button-secondary logout-button" onClick={handleLogout}>Log out</button>
        </header>
        <main className="page-content">
          {logoutError && <div className="alert alert-error" role="alert">{logoutError}</div>}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
