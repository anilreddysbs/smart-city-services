import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaRocket, FaSearch } from 'react-icons/fa';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
         <div style={{ background: 'var(--primary)', color: 'white', padding: '0.4rem 0.6rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '0.4rem' }}>
          G
        </div>
        <span style={{ color: '#202020', letterSpacing: '-0.02em', fontSize: '1.4rem' }}>SmartCity</span>
      </Link>
      <div className="navbar-links">
        <Link to="/workers" style={{ color: isActive('/workers') ? 'var(--primary)' : 'var(--text-muted)' }}>
          Professionals
        </Link>
        <Link to="/" style={{ color: isActive('/') ? 'var(--primary)' : 'var(--text-muted)' }}>
          Community
        </Link>
        
        <div style={{ width: '1px', height: '20px', background: 'var(--border)', margin: '0 0.5rem' }}></div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text)', fontWeight: '700' }}>
              <FaUserCircle size={22} color="var(--primary)" />
              <span>{user?.name?.split(' ')[0]}</span>
            </Link>
            <button 
              onClick={handleLogout} 
              style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '99px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-light)' }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" style={{ fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sign In</Link>
            <Link to="/register" className="btn" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', borderRadius: '4px' }}>Join Now</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
