import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaStar, FaTools, FaTint, FaPaintBrush, FaWrench, FaBolt } from 'react-icons/fa';
import api from '../services/api';
import WorkerCard from '../components/WorkerCard';

const CATEGORIES = [
  { value: '', label: 'All Services' },
  { value: 'Electrician', label: 'Electrician', icon: <FaBolt /> },
  { value: 'Plumber', label: 'Plumber', icon: <FaTint /> },
  { value: 'Painter', label: 'Painter', icon: <FaPaintBrush /> },
  { value: 'Maintenance Worker', label: 'Maintenance', icon: <FaWrench /> },
  { value: 'Construction Worker', label: 'Construction', icon: <FaTools /> }
];

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
        (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => null
      );
    }
  }, []);

  const applySearch = () => {
    const nextParams = {};
    if (filter) nextParams.category = filter;
    if (search.trim()) nextParams.search = search.trim();
    setSearchParams(nextParams);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['workers', searchParams.toString(), location],
    queryFn: async () => {
      const category = searchParams.get('category') || '';
      const keyword = searchParams.get('search') || '';
      const geoParams = location ? `&lat=${location.lat}&lng=${location.lng}` : '';
      const url = `/workers?limit=50&page=1${category ? `&category=${encodeURIComponent(category)}` : ''}${keyword ? `&search=${encodeURIComponent(keyword)}` : ''}${geoParams}`;
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

  const filteredWorkers = (data || []).filter(
    (worker) => worker.user_id !== user?.id && (!minRating || Number(worker.averageRating || 0) >= Number(minRating))
  );

  return (
    <div style={{ background: 'var(--background-alt)', minHeight: '100vh' }}>
      <div
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: '72px',
          zIndex: 950
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1rem 2rem' }}>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              background: 'var(--background-alt)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '0.75rem',
              alignItems: 'center'
            }}
          >
            <div style={{ position: 'relative', flex: 3, minWidth: '220px' }}>
              <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search by name, service, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.6rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem', background: '#fff' }}
              />
            </div>

            <div style={{ width: '1px', height: '32px', background: 'var(--border)', flexShrink: 0 }} />

            <div style={{ position: 'relative', flex: 1.5, minWidth: '150px' }}>
              <FaTools style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none', fontSize: '0.8rem' }} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.2rem', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', background: '#fff', appearance: 'none', cursor: 'pointer' }}
              >
                {CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative', flex: 1, minWidth: '130px' }}>
              <FaStar style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#f9ab00', pointerEvents: 'none', fontSize: '0.8rem' }} />
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.2rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem', background: '#fff', appearance: 'none', cursor: 'pointer' }}
              >
                <option value="">Any Rating</option>
                <option value="4.5">★ 4.5+</option>
                <option value="4.0">★ 4.0+</option>
                <option value="3.0">★ 3.0+</option>
              </select>
            </div>

            <button className="btn" onClick={applySearch} style={{ padding: '0.7rem 1.75rem', borderRadius: '8px', fontSize: '0.85rem', flexShrink: 0 }}>
              Search
            </button>
          </div>

          {(filter || search || minRating) && (
            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Active filters:</span>
              {filter ? <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '800' }}>{filter}</span> : null}
              {search ? <span style={{ background: '#eff6ff', color: 'var(--secondary)', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '800' }}>"{search}"</span> : null}
              {minRating ? <span style={{ background: '#fffbeb', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.78rem', fontWeight: '800' }}>★ {minRating}+</span> : null}
              <button onClick={handleReset} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: '800', cursor: 'pointer', fontSize: '0.78rem', marginLeft: '0.25rem' }}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text)', letterSpacing: '-0.02em' }}>
            {searchParams.get('search') || searchParams.get('category') ? `Results for "${searchParams.get('search') || searchParams.get('category')}"` : 'Top professionals in your area'}
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            {isLoading ? 'Searching...' : `${filteredWorkers.length} verified professional${filteredWorkers.length !== 1 ? 's' : ''} found`}
            {location ? ' · sorted by proximity' : ''}
          </p>
        </div>

        {isLoading ? (
          <div className="grid">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="card skeleton" style={{ height: '320px' }} />
            ))}
          </div>
        ) : isError ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <h3 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Could not load professionals</h3>
            <p style={{ color: 'var(--text-light)' }}>Our directory service is temporarily unavailable. Please try again shortly.</p>
          </div>
        ) : filteredWorkers.length > 0 ? (
          <div className="grid">
            {filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <div style={{ fontSize: '2.4rem', marginBottom: '1rem', fontWeight: '800', color: 'var(--text-light)' }}>No matches</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '0.75rem' }}>No professionals match your criteria</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '1rem', margin: '0 auto 2rem', maxWidth: '480px' }}>
              Try broadening your search by removing the category filter or clearing the rating requirement.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
              <button onClick={handleReset} className="btn" style={{ padding: '0.75rem 2rem' }}>
                Clear All Filters
              </button>
              <button onClick={handleReset} className="btn btn-outline" style={{ padding: '0.75rem 2rem' }}>
                Browse All Professionals
              </button>
            </div>

            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontWeight: '800', marginBottom: '1.5rem', fontSize: '1.15rem', color: 'var(--text-muted)' }}>
                Top rated in all categories
              </h3>
              <TopFallback user={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TopFallback({ user }) {
  const { data = [] } = useQuery({
    queryKey: ['workers-fallback'],
    queryFn: () => api.get('/workers?limit=4&page=1').then((response) => (response.data.data ? response.data.data.workers : response.data))
  });

  const topWorkers = data.filter((worker) => worker.user_id !== user?.id).slice(0, 4);
  if (topWorkers.length === 0) return null;

  return (
    <div className="grid">
      {topWorkers.map((worker) => (
        <WorkerCard key={worker.id} worker={worker} />
      ))}
    </div>
  );
}

export default WorkerListing;
