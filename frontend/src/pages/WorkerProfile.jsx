import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaMapMarkerAlt, FaStar, FaShieldAlt, FaBriefcase, FaArrowLeft, FaClock, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';

function WorkerProfile() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const { data: worker, isLoading, isError } = useQuery({
    queryKey: ['workerProfile', id],
    queryFn: () => api.get(`/workers/${id}`).then(res => res.data.data)
  });

  if (isLoading) return <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>Loading profile metrics...</div>;
  if (isError || !worker) return <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
    <h3>Profile Not Found</h3>
    <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>This worker may have been deactivated or never existed.</p>
    <Link to="/workers" className="btn btn-outline">Back to Directory</Link>
  </div>;

  return (
    <div className="container" style={{ maxWidth: '1000px', marginTop: '3rem' }}>
      <Link to="/workers" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', color: 'var(--secondary)', fontWeight: '700', textDecoration: 'none' }}>
        <FaArrowLeft /> Browse all professionals
      </Link>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ height: '120px', background: 'var(--primary-light)', borderBottom: '1px solid var(--border-light)' }}></div>
        
        <div style={{ padding: '0 3rem 3rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', marginBottom: '3rem', marginTop: '-60px' }}>
            <div style={{ width: '120px', height: '120px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--primary)', fontWeight: '900' }}>
               {worker.name.charAt(0)}
            </div>
            <div style={{ paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', color: 'var(--text)' }}>{worker.name}</h1>
                {worker.verification_status === 'Verified' && <FaCheckCircle color="var(--primary)" size={24} title="Verified Professional" />}
              </div>
              <p style={{ margin: '0.5rem 0 0', fontWeight: '800', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.9rem' }}>{worker.category}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
             <div style={{ padding: '1.5rem', background: 'var(--background-alt)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  <FaStar color="var(--warning)" /> Rating
               </div>
               <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{worker.averageRating || 'New'} <span style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontWeight: '400' }}>/ 5.0</span></div>
             </div>
             <div style={{ padding: '1.5rem', background: 'var(--background-alt)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  <FaShieldAlt color="var(--secondary)" /> Trust Score
               </div>
               <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{worker.trust_score}%</div>
             </div>
             <div style={{ padding: '1.5rem', background: 'var(--background-alt)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  <FaBriefcase color="var(--text-light)" /> Experience
               </div>
               <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{worker.experience} Years</div>
             </div>
             <div style={{ padding: '1.5rem', background: 'var(--background-alt)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  <FaMapMarkerAlt color="var(--danger)" /> Location
               </div>
               <div style={{ fontSize: '1.1rem', fontWeight: '900' }}>{worker.location || 'Global'}</div>
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '4rem' }}>
             <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   Performance Reviews <span style={{ fontSize: '0.9rem', fontWeight: '400', color: 'var(--text-light)' }}>({worker.reviews?.length || 0})</span>
                </h3>
                {worker.reviews && worker.reviews.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {worker.reviews.map((r, i) => (
                      <div key={i} style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: '800', color: 'var(--text)' }}>{r.customer_name}</span>
                          <span style={{ color: 'var(--warning)', fontWeight: '800' }}>⭐ {r.rating}</span>
                        </div>
                        <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>"{r.review}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--background-alt)', borderRadius: '8px' }}>
                    <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No reviews recorded for this professional yet.</p>
                  </div>
                )}
             </div>

             <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
                <div className="card" style={{ padding: '2rem', border: '1px solid var(--border)', background: 'white', textAlign: 'center' }}>
                   <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Service availability</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '800' }}>
                         <FaClock /> Available for Hire
                      </div>
                   </div>
                   {user ? (
                     <Link to={`/book/${worker.id}`} className="btn" style={{ width: '100%', padding: '1rem', borderRadius: '4px', display: 'block' }}>Book Consultation</Link>
                   ) : (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                       <Link to="/login" className="btn btn-outline" style={{ width: '100%', padding: '1rem', borderRadius: '4px', display: 'block' }}>Login to Book</Link>
                       <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Verification required to protect labor contracts.</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerProfile;
