import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaBriefcase, FaStar } from 'react-icons/fa';
import api from '../services/api';
import WorkerCard from '../components/WorkerCard';

function WorkerListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [minRating, setMinRating] = useState('');
  const [location, setLocation] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Location access denied:", error)
      );
    }
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['workers', filter, search, location],
    queryFn: async () => {
      const geoParams = location ? `&lat=${location.lat}&lng=${location.lng}` : '';
      const url = `/workers?limit=50&page=1${filter ? `&category=${filter}` : ''}${search ? `&search=${search}` : ''}${geoParams}`;
      const res = await api.get(url);
      return res.data.data ? res.data.data.workers : res.data;
    },
    refetchInterval: 60000
  });

  const handleReset = () => {
    setFilter('');
    setSearch('');
    setMinRating('');
    setSearchParams({});
  };

  return (
    <div style={{ background: 'var(--background-alt)', minHeight: '100vh' }}>
      
      {/* Search/Filter Bar */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(10px)',
        padding: '1rem 0', 
        borderBottom: '1px solid var(--border)', 
        position: 'sticky', 
        top: '72px', 
        zIndex: 950 
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '300px' }}>
            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Job title, keywords, or company" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.95rem' }}
            />
          </div>
          
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', minWidth: '150px', fontWeight: 'bold', fontSize: '0.9rem' }}>
            <option value="">All Services</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Painter">Painter</option>
            <option value="Maintenance Worker">Maintenance</option>
          </select>

          <select value={minRating} onChange={(e) => setMinRating(e.target.value)} style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', minWidth: '150px', fontSize: '0.9rem' }}>
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4.0">4.0+ Stars</option>
          </select>

          <button className="btn" style={{ padding: '0.75rem 2rem', borderRadius: '8px', fontSize: '0.9rem' }}>Update Search</button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        <div style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '2rem' }}>
           <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text)', letterSpacing: '-0.02em' }}>
                {search || filter ? `Results for "${search || filter}"` : 'Top Professionals in your area'}
              </h1>
              <p style={{ color: 'var(--text-light)', fontSize: '1rem', marginTop: '0.5rem' }}>
                Verified experts matched by geographic proximity and performance metrics.
              </p>
           </div>
           {(filter || search || minRating) && (
             <div style={{ marginTop: '1.5rem' }}>
               <button onClick={handleReset} style={{ background: 'var(--primary-light)', border: 'none', color: 'var(--primary)', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', padding: '0.5rem 1rem', borderRadius: '4px' }}>
                 Reset all filters
               </button>
             </div>
           )}
        </div>

        {isLoading ? (
          <div className="grid">
            {[1,2,3,4].map(i => (
              <div key={i} className="card" style={{ height: '300px', background: 'white', opacity: 0.5 }}></div>
            ))}
          </div>
        ) : isError ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--danger)', padding: '4rem' }}>
             <h3>Handshake failure in directory service.</h3>
             <p>Our global workforce ledger is currently under maintenance. Please try again shortly.</p>
          </div>
        ) : (data?.filter(w => w.user_id !== user?.id && (!minRating || Number(w.averageRating || 0) >= Number(minRating))) || []).length > 0 ? (
          <div className="grid">
            {data.filter(w => w.user_id !== user?.id && (!minRating || Number(w.averageRating || 0) >= Number(minRating))).map(worker => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <FaFilter size={48} color="var(--border)" style={{ marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>No professionals found matching your criteria.</h2>
            <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Try broadening your search or resetting the filters.</p>
            <button onClick={handleReset} className="btn btn-outline">Explore All Professionals</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkerListing;
