import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBriefcase, FaCalendarAlt, FaChartBar, FaIdCard, FaSignOutAlt, FaUserCheck, FaUserShield } from 'react-icons/fa';
import api from '../services/api';
import '../dashboard.css';

function DashboardLayout({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  const pageTitle = (() => {
    if (location.pathname.startsWith('/dashboard/admin/analytics')) return 'Operations Analytics';
    if (location.pathname.startsWith('/dashboard/admin')) return 'Admin Command Center';
    if (location.pathname.startsWith('/dashboard/worker/performance')) return 'Performance Insights';
    if (location.pathname.startsWith('/dashboard/worker')) return 'Worker Dashboard';
    if (location.pathname.startsWith('/dashboard/customer/subscriptions')) return 'Community Subscriptions';
    if (location.pathname.startsWith('/dashboard/customer')) return 'Customer Dashboard';
    if (location.pathname.startsWith('/profile')) return 'Profile Settings';
    return 'Workspace';
  })();

  const pageSubtitle = (() => {
    if (user?.role === 'Admin') return 'Review platform health, verifications, and security controls from one place.';
    if (user?.role === 'Worker') return 'Track current work, availability, and performance signals.';
    if (user?.role === 'Customer') return 'Manage active requests, history, and account preferences.';
    return 'Signed-in workspace';
  })();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await api.post('/auth/logout').catch(() => null);
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <div className={`dashboard-layout ${user?.role === 'Admin' ? 'dashboard-layout-admin' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">{user?.role === 'Admin' ? 'SC' : 'SS'}</div>
        </div>
        <nav className="sidebar-nav" style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="nav-section" style={{ display: 'none' }}>DISCOVER</div>
          {user?.role === 'Customer' && (
            <Link to="/workers" title="Browse Professionals Directory" className={`nav-link ${isActive('/workers')}`}>
              <FaUserCheck /> <span className="nav-text">Find Workers</span>
            </Link>
          )}

          <div className="nav-section" style={{ marginTop: '1.5rem' }}>MY WORKSPACE</div>
          {user?.role === 'Customer' && (
            <>
              <Link to="/dashboard/customer" title="My Active Service Contracts" className={`nav-link ${isActive('/dashboard/customer')}`}>
                <FaCalendarAlt /> <span className="nav-text">My Bookings</span>
              </Link>
              <Link to="/dashboard/customer/subscriptions" title="Manage Recurring Support Agreements" className={`nav-link ${isActive('/dashboard/customer/subscriptions')}`}>
                <FaBriefcase /> <span className="nav-text">Subscriptions</span>
              </Link>
            </>
          )}
          {user?.role === 'Worker' && (
            <>
              <Link to="/dashboard/worker" title="Professional Performance Overview" className={`nav-link ${isActive('/dashboard/worker')}`}>
                <FaBriefcase /> <span className="nav-text">Dashboard</span>
              </Link>
              <Link to="/dashboard/worker/performance" title="Trust Score & Algorithmic Growth Analytics" className={`nav-link ${isActive('/dashboard/worker/performance')}`}>
                <FaChartBar /> <span className="nav-text">Performance Insights</span>
              </Link>
            </>
          )}
          {user?.role === 'Admin' && (
            <>
              <Link to="/dashboard/admin" title="Unified Verification & Moderation Queue" className={`nav-link ${isActive('/dashboard/admin')}`}>
                <FaUserShield /> <span className="nav-text">Verifications</span>
              </Link>
              <Link to="/dashboard/admin/analytics" title="Global City Intelligence Metrics" className={`nav-link ${isActive('/dashboard/admin/analytics')}`}>
                <FaChartBar /> <span className="nav-text">Live Analytics</span>
              </Link>
            </>
          )}

          <div className="nav-section" style={{ marginTop: '2.5rem' }}>ACCOUNT</div>
          <Link to="/profile" title="Identity & Security Controls" className={`nav-link ${isActive('/profile')}`}>
            <FaIdCard /> <span className="nav-text">Profile Settings</span>
          </Link>
        </nav>
      </aside>

      <main className="dashboard-content">
        <div className={`dashboard-shell ${user?.role === 'Admin' ? 'dashboard-shell-admin' : ''}`}>
          <header className="dashboard-topbar">
            <div>
              <div className="dashboard-eyebrow">{user?.role === 'Admin' ? 'Administration' : 'Workspace'}</div>
              <h1 className="dashboard-title">{pageTitle}</h1>
              <p className="dashboard-subtitle">{pageSubtitle}</p>
            </div>
            <div className="dashboard-topbar-actions">
              <div className="dashboard-user-chip">
                <span className="dashboard-user-name">{user?.name || 'User'}</span>
                <span className="dashboard-user-role">{user?.role || 'Member'}</span>
              </div>
              <button type="button" className="dashboard-logout" onClick={handleLogout} disabled={isLoggingOut}>
                {isLoggingOut ? <span className="loading-spinner dark" /> : <FaSignOutAlt />}
                {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
              </button>
            </div>
          </header>

          <div style={{ padding: '2rem 2rem 2.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
