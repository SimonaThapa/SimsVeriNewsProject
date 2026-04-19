import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Trash2, Star, Calendar, User, Mail, Search, MessageSquare } from 'lucide-react';
import './AdminPages.css'; // Reusing standard admin styles

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/admin');
      setReviews(res.data || []);
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(reviews.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error deleting review:', err);
      alert('Failed to delete review');
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="admin-page fade-in" style={{padding: '30px'}}>
      <header className="admin-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
          <h1 className="page-title">Manage User Reviews</h1>
          <p className="page-subtitle">Monitor and manage ratings and messages from users.</p>
        </div>
        
        <div className="search-bar" style={{position: 'relative'}}>
          <Search size={18} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)'}} />
          <input 
            type="text" 
            placeholder="Search reviews..." 
            className="form-input"
            style={{paddingLeft: '40px', width: '300px'}}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Rating</th>
                <th>Message</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '40px', color: 'var(--gray-400)'}}>
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map(rev => (
                  <tr key={rev.id}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <div className="avatar-sm" style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold'}}>
                          {rev.userName?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{fontWeight: 'bold', fontSize: '13px'}}>{rev.userName}</div>
                          <div style={{fontSize: '11px', color: 'var(--gray-500)'}}>{rev.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 'bold'}}>
                        <Star size={14} fill="#fbbf24" /> {rev.rating}
                      </div>
                    </td>
                    <td>
                      <div style={{maxWidth: '400px', fontSize: '13px', color: 'var(--gray-600)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={rev.message}>
                        {rev.message}
                      </div>
                    </td>
                    <td style={{fontSize: '12px', color: 'var(--gray-500)'}}>
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{color: 'var(--red-500)', border: 'none'}}
                        onClick={() => handleDelete(rev.id)}
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
