import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaCity, FaBriefcase, FaCalendarAlt, FaComments } from 'react-icons/fa';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isWorker = user?.role === 'Worker';
  const isCustomer = user?.role === 'Customer';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
          color: 'white',
          width: '38px', height: '38px',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: '0.75rem',
          boxShadow: '0 4px 12px rgba(0, 162, 100, 0.25)'
        }}>
          <FaCity size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ color: 'var(--text)', letterSpacing: '-0.03em', fontSize: '1.25rem', fontWeight: '900' }}>SmartCity</span>
          <span style={{ color: 'var(--primary)', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>Services</span>
        </div>
      </Link>

      {/* Nav Links — role-aware */}
      <div className="navbar-links">

        {/* Not a worker: show Professionals directory */}
        {!isWorker && (
          <Link to="/workers" style={{ color: isActive('/workers') ? 'var(--primary)' : 'var(--text-muted)', fontWeight: '600', fontSize: '0.92rem' }}>
            Professionals
          </Link>
        )}

        {/* Worker shortcut: go straight to their dashboard */}
        {isWorker && (
          <Link to="/dashboard/worker" style={{ color: isActive('/dashboard/worker') ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.92rem' }}>
            <FaBriefcase size={13} /> My Jobs
          </Link>
        )}

        {/* Customer shortcut to their bookings */}
        {isCustomer && (
          <Link to="/dashboard/customer" style={{ color: isActive('/dashboard/customer') ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.92rem' }}>
            <FaCalendarAlt size={13} /> My Bookings
          </Link>
        )}

        <Link to="/community" style={{ color: isActive('/community') ? 'var(--primary)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.92rem' }}>
          <FaComments size={13} /> Community
        </Link>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-light)', margin: '0 0.5rem' }} />

        {/* Auth area */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text)', fontWeight: '800', fontSize: '0.88rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FaUserCircle size={18} color="var(--primary)" />
              </div>
              <span>{user?.name?.split(' ')[0]}</span>
              <span style={{ fontSize: '0.7rem', background: isWorker ? 'var(--primary-light)' : '#eff6ff', color: isWorker ? 'var(--primary)' : 'var(--secondary)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '800', textTransform: 'uppercase' }}>
                {user?.role}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: 'var(--background-alt)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.8rem', fontWeight: '700',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'var(--text-light)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-light)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--background-alt)'}
            >
              <FaSignOutAlt size={12} /> Sign Out
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/login" style={{ fontWeight: '800', color: 'var(--text)', fontSize: '0.9rem' }}>Sign In</Link>
            <Link to="/register" className="btn" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', borderRadius: '8px' }}>Join Now</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
