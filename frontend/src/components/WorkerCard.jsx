import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaStar, FaShieldAlt, FaBriefcase, FaUserCheck, FaCheckCircle } from 'react-icons/fa';

function WorkerCard({ worker }) {
  const isNearest = worker.matchScore && worker.matchScore > 50; 

  return (
    <div className="card animate-in" style={{ 
      position: 'relative', 
      borderTop: isNearest ? '4px solid var(--primary)' : '1px solid var(--border)',
      padding: '2rem'
    }}>
      {isNearest && (
        <div style={{ 
          position: 'absolute', top: '-14px', left: '20px', 
          background: 'var(--primary)', color: 'white', 
          padding: '0.2rem 0.8rem', borderRadius: '4px', 
          fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' 
        }}>
          Top Match
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
            {worker.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>{worker.category}</span>
            {worker.verification_status === 'Verified' && <FaCheckCircle color="var(--primary)" size={14} title="Verified Professional" />}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text)', fontWeight: '800', fontSize: '1.1rem' }}>
              <FaStar color="var(--warning)" size={16} /> {worker.averageRating || 'New'}
           </div>
           <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '600' }}>{worker.total_jobs || 0} reviews</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <FaShieldAlt color="var(--secondary)" size={14} /> 
          <span>Trust Visibility: <strong>{Number(worker.trust_score).toFixed(0)}%</strong></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <FaBriefcase color="var(--text-light)" size={14} /> 
          <span>Experience: <strong>{worker.experience} Years</strong></span>
        </div>

        <div style={{ marginTop: '0.5rem', padding: '0.75rem 1rem', background: 'var(--background-alt)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text)' }}>
            <FaMapMarkerAlt color="var(--danger)" size={14} />
            <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{worker.location}</span>
          </div>
          {worker.distance !== null && worker.distance !== undefined && (
            <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', marginLeft: '1.5rem', marginTop: '0.2rem' }}>
              {worker.distance.toFixed(1)} km from your location
            </div>
          )}
        </div>
      </div>

      <Link to={`/worker/${worker.id}`} className="btn btn-outline" style={{ borderRadius: '4px', width: '100%', fontSize: '0.9rem' }}>
        View Full Profile
      </Link>
    </div>
  );
}

export default WorkerCard;
