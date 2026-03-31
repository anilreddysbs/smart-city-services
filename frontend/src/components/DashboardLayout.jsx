import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaChartBar, FaUserCheck, FaBriefcase, FaIdCard, FaUserShield } from 'react-icons/fa';
import '../dashboard.css';

function DashboardLayout({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav className="sidebar-nav" style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="nav-section" style={{ display: 'none' }}>DISCOVER</div>
          <Link to="/workers" title="Browse Professionals Directory" className={`nav-link ${isActive('/workers') ? 'active' : ''}`}><FaUserCheck /> <span className="nav-text">Find Workers</span></Link>

          <div className="nav-section" style={{ marginTop: '1.5rem' }}>MY WORKSPACE</div>
          {user?.role === 'Customer' && (
            <>
              <Link to="/dashboard/customer" title="My Active Service Contracts" className={`nav-link ${isActive('/dashboard/customer') ? 'active' : ''}`}><FaCalendarAlt /> <span className="nav-text">My Bookings</span></Link>
              <Link to="/dashboard/customer/subscriptions" title="Manage Recurring Support Agreements" className={`nav-link ${isActive('/dashboard/customer/subscriptions') ? 'active' : ''}`}><FaBriefcase /> <span className="nav-text">Subscriptions</span></Link>
            </>
          )}
          {user?.role === 'Worker' && (
            <>
              <Link to="/dashboard/worker" title="Professional Performance Overview" className={`nav-link ${isActive('/dashboard/worker') ? 'active' : ''}`}><FaBriefcase /> <span className="nav-text">Dashboard</span></Link>
              <Link to="/dashboard/worker/performance" title="Trust Score & Algorithmic Growth Analytics" className={`nav-link ${isActive('/dashboard/worker/performance') ? 'active' : ''}`}><FaChartBar /> <span className="nav-text">Performance Insights</span></Link>
            </>
          )}
          {user?.role === 'Admin' && (
            <>
              <Link to="/dashboard/admin" title="Unified Verification & Moderation Queue" className={`nav-link ${isActive('/dashboard/admin') ? 'active' : ''}`}><FaUserShield /> <span className="nav-text">Verifications</span></Link>
              <Link to="/dashboard/admin/analytics" title="Global City Intelligence Metrics" className={`nav-link ${isActive('/dashboard/admin/analytics') ? 'active' : ''}`}><FaChartBar /> <span className="nav-text">Live Analytics</span></Link>
            </>
          )}
          
          <div className="nav-section" style={{ marginTop: '2.5rem' }}>ACCOUNT</div>
          <Link to="/profile" title="Identity & Cryptographic Security Controls" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}><FaIdCard /> <span className="nav-text">Profile Settings</span></Link>
        </nav>
      </aside>
      <main className="dashboard-content">
        <div style={{ padding: '2.5rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
