import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShieldAlt, FaBriefcase, FaUserCheck, FaStar, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';

function Home() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/workers?search=${encodeURIComponent(search)}`);
    else navigate('/workers');
  };

  const services = [
    { name: 'Electrician', icon: <FaBuilding color="#00a264" /> },
    { name: 'Plumber', icon: <FaBuilding color="#1861bf" /> },
    { name: 'Painter', icon: <FaBuilding color="#f9ab00" /> },
    { name: 'Maintenance', icon: <FaBuilding color="#d93025" /> },
    { name: 'General Construction', icon: <FaBuilding color="#707070" /> }
  ];

  const isWorker = user?.role === 'Worker';
  const isCustomer = user?.role === 'Customer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* ── Hero Section ── */}
      {isWorker ? (
        /* Worker hero: simplified, action-oriented */
        <section style={{ padding: '4rem 2rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', textAlign: 'center' }}>
          <p style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '1rem' }}>Professional Portal</p>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.04em', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2.5rem' }}>
            Check your incoming job requests and manage your active assignments.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard/worker" className="btn" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem' }}>View My Jobs</Link>
            <Link to="/community" className="btn btn-outline" style={{ padding: '0.85rem 2.5rem', fontSize: '1rem', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Community Feed</Link>
          </div>
        </section>
      ) : (
        /* Customer / guest hero: full search */
        <section className="hero">
          <div className="container" style={{ padding: 0 }}>
            <h1 className="animate-in">Find the right professional.<br />Right now.</h1>
            <p className="animate-in" style={{ animationDelay: '0.1s' }}>
              {isCustomer ? `Welcome back, ${user?.name?.split(' ')[0]}! Search thousands of verified city service providers.` : 'Search thousands of verified city service providers, reviewed by citizens like you.'}
            </p>
            <form onSubmit={handleSearch} className="search-bar animate-in" style={{ animationDelay: '0.2s' }}>
              <FaSearch color="#707070" style={{ marginLeft: '1.5rem' }} />
              <input
                type="text"
                placeholder="Search by service or professional name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn">Search</button>
            </form>
          </div>
        </section>
      )}

      {/* ── Main Content ── */}
      <main className="container" style={{ marginTop: '5rem' }}>

        {/* Popular Services — only for customers & guests; workers already know the categories */}
        {!isWorker && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'rgb(30, 41, 59)', marginBottom: '1rem' }}>Popular Services</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Get connected with the top professionals in these high-demand categories.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '6rem' }}>
              {services.map((service, idx) => (
                <div key={idx}
                  className="card"
                  style={{ cursor: 'pointer', textAlign: 'center', alignItems: 'center', minWidth: '180px', transition: 'transform 0.2s, box-shadow 0.2s', padding: '2rem 1.5rem' }}
                  onClick={() => navigate(`/workers?category=${encodeURIComponent(service.name)}`)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1.25rem' }}>{service.icon}</div>
                  <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{service.name}</h3>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', marginTop: 'auto' }}>Browse &rarr;</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Worker stats block — only relevant for workers */}
        {isWorker && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            {[
              { label: 'Your Active Jobs', value: 'View Dashboard', link: '/dashboard/worker', icon: '⚡' },
              { label: 'Performance Insights', value: 'Trust Score & Analytics', link: '/dashboard/worker/performance', icon: '📊' },
              { label: 'Community Feed', value: 'Share & Read Stories', link: '/community', icon: '💬' },
              { label: 'Your Profile', value: 'Update details', link: '/profile', icon: '👤' },
            ].map(item => (
              <Link key={item.label} to={item.link} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', padding: '1.75rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                  <h4 style={{ fontWeight: '900', color: 'var(--text)', marginBottom: '0.25rem' }}>{item.label}</h4>
                  <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem' }}>{item.value} &rarr;</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Community / Network block */}
        <div style={{ marginTop: isWorker ? '2rem' : '2rem', padding: '4rem', background: 'var(--background-alt)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>
              {isWorker ? 'Grow with the community' : 'Join the SmartCity Network'}
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
              {isWorker
                ? 'Share your expertise and experiences with fellow professionals. Build trust and reputation through the community.'
                : 'Are you a professional looking to grow? Join thousands of experts who trust SmartCity to connect with local customers.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/community" className="btn">Share Your Story</Link>
              {!isWorker && <Link to="/workers" className="btn btn-outline">Explore Directory</Link>}
              {isWorker && <Link to="/dashboard/worker/performance" className="btn btn-outline">View My Stats</Link>}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: '300px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <FaUserCheck size={32} color="var(--primary)" />
              <h4 style={{ marginTop: '1rem' }}>15k+ Pros</h4>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <FaStar size={32} color="var(--warning)" />
              <h4 style={{ marginTop: '1rem' }}>4.9 Rating</h4>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <FaShieldAlt size={32} color="var(--secondary)" />
              <h4 style={{ marginTop: '1rem' }}>100% Secure</h4>
            </div>
            <div className="card" style={{ padding: '1.5rem' }}>
              <FaBriefcase size={32} color="#8b5cf6" />
              <h4 style={{ marginTop: '1rem' }}>250k Jobs</h4>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid var(--border)', padding: '5rem 2rem 3rem' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', padding: 0 }}>
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--text)' }}>SmartCity Dashboard</h4>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', lineHeight: '1.8' }}>The transparent platform for municipal and residential service excellence globally.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <Link to="/workers">Browse Professionals</Link>
              <Link to="/">Cities & Locations</Link>
              <Link to="/register">Register Professional</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <span style={{ cursor: 'pointer' }}>About Us</span>
              <span style={{ cursor: 'pointer' }}>Community Standards</span>
              <span style={{ cursor: 'pointer' }}>Trust & Safety</span>
            </div>
          </div>
        </div>
        <div className="container" style={{ borderTop: '1px solid var(--border-light)', marginTop: '4rem', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', color: 'var(--text-light)', fontSize: '0.85rem', padding: 0 }}>
          <span>&copy; {new Date().getFullYear()} SmartCity Intelligence Platform.</span>
          <div style={{ display: 'flex', gap: '2rem' }}>
             <span style={{ cursor: 'pointer' }}>Privacy</span>
             <span style={{ cursor: 'pointer' }}>Terms</span>
             <span style={{ cursor: 'pointer' }}>Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
