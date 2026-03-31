import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPaperPlane, FaQuoteLeft, FaUserCircle, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

function Community() {
  const [newPost, setNewPost] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => api.get('/community').then(res => res.data)
  });

  const mutation = useMutation({
    mutationFn: (content) => api.post('/community', { content }),
    onSuccess: () => {
      queryClient.invalidateQueries(['community-posts']);
      setNewPost('');
      toast.success('Your experience has been shared with the community.');
    },
    onError: () => {
      toast.error('Failed to post your experience.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    mutation.mutate(newPost);
  };

  return (
    <div className="container" style={{ maxWidth: '800px', marginTop: '3rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text)' }}>Community Feed</h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>Share your experiences and insights with fellow citizens.</p>
      </header>

      {user ? (
        <div className="card" style={{ marginBottom: '3rem', padding: '2rem', border: '2px solid var(--primary-light)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: '800' }}>Share your experience</h3>
          <form onSubmit={handleSubmit}>
            <textarea 
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's your story today?"
              style={{ 
                width: '100%', 
                height: '120px', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                fontFamily: 'inherit',
                fontSize: '1rem',
                marginBottom: '1rem',
                resize: 'none'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn" 
                disabled={mutation.isPending || !newPost.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 2rem' }}
              >
                <FaPaperPlane size={14} /> 
                {mutation.isPending ? 'Sharing...' : 'Post Experience'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: '3rem', textAlign: 'center', padding: '2rem' }}>
           <p style={{ color: 'var(--text-light)' }}>Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800' }}>Sign In</Link> to share your experiences.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Fetching community stories...</div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <div key={post.id} className="card animate-in" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaUserCircle size={24} color="var(--primary)" />
                   </div>
                   <div>
                      <div style={{ fontWeight: '800', color: 'var(--text)' }}>{post.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                         <FaClock size={10} /> {new Date(post.created_at).toLocaleString()}
                      </div>
                   </div>
                </div>
                <FaQuoteLeft size={24} color="var(--border-light)" />
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                {post.content}
              </p>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-light)' }}>
            <p style={{ fontSize: '1.2rem' }}>No stories shared yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Community;
