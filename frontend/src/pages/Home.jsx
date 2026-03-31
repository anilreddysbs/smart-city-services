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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Hero Section */}
      <section className="hero">
        <div className="container" style={{ padding: 0 }}>
          <h1 className="animate-in">Find the right professional.<br />Right now.</h1>
          <p className="animate-in" style={{ animationDelay: '0.1s' }}>Search thousands of verified city service providers, reviewed by citizens like you.</p>
          
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

      {/* Main Content */}
      <main className="container" style={{ marginTop: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
           <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Expertise for every urban challenge</h2>
           <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Select a category to view the top-rated professionals in your city.</p>
        </div>

        <div className="grid">
          {services.map((service, idx) => (
            <div key={idx} className="card" style={{ cursor: 'pointer', textAlign: 'center', alignItems: 'center' }} onClick={() => navigate(`/workers?category=${encodeURIComponent(service.name)}`)}>
               <div style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.8 }}>{service.icon}</div>
               <h3 className="card-title">{service.name}</h3>
               <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Verified professionals with average 4.8/5 rating.</p>
               <div style={{ marginTop: '1.5rem', fontWeight: '700', color: 'var(--secondary)' }}>View Professionals &rarr;</div>
            </div>
          ))}
        </div>

        {/* Community Block */}
        <div style={{ marginTop: '6rem', padding: '4rem', background: 'var(--background-alt)', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
           <div style={{ flex: 1, minWidth: '300px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1.5rem' }}>Join the SmartCity Network</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Are you a professional looking to grow your business? Join thousands of experts who trust SmartCity to connect with local customers.</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                 <Link to="/register" className="btn">Register as Professional</Link>
                 <Link to="/workers" className="btn btn-outline">Explore Directory</Link>
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
