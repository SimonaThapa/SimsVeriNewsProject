import React, { useState, useEffect } from 'react';
import { Star, Send, User as UserIcon, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext.jsx';
import './ReviewsSection.css';

export default function ReviewsSection({ showForm = true, limit = 0 }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ total: 0, average: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [newMessage, setNewMessage] = useState('');
  const [guestName, setGuestName] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/');
      setReviews(res.data.reviews || []);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Could not load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await api.post('/reviews/', { 
        rating: newRating, 
        message: newMessage,
        userName: !isAuthenticated ? guestName : undefined
      });
      setSuccess(true);
      setNewMessage('');
      setGuestName('');
      setNewRating(5);
      fetchReviews();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, size = 16) => {
    return (
      <div className="section-stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s} size={size}
            className={s <= rating ? 'star-icon-fill' : 'star-icon-empty'}
            fill={s <= rating ? 'currentColor' : 'transparent'}
          />
        ))}
      </div>
    );
  };

  const displayReviews = limit > 0 ? reviews.slice(0, limit) : reviews;

  if (loading && reviews.length === 0) {
    return <div className="section-loading"><Loader2 className="spinner" /></div>;
  }

  return (
    <div className="reviews-ui-container">
      {/* ── Summary Stats ── */}
      <div className="reviews-stats-row">
        <div className="stat-main">
          <div className="stat-val">{summary.average.toFixed(1)}</div>
          {renderStars(Math.round(summary.average), 24)}
          <div className="stat-label">Based on {summary.total} reviews</div>
        </div>
        
        <div className="stat-bars">
          {[5, 4, 3, 2, 1].map(num => {
            const count = summary.breakdown[num] || 0;
            const percent = summary.total > 0 ? (count / summary.total) * 100 : 0;
            return (
              <div key={num} className="stat-bar-row">
                <span className="bar-num">{num}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${percent}%`, background: num >= 4 ? '#10b981' : num >= 3 ? '#fbbf24' : '#f43f5e' }} /></div>
                <span className="bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Submission Form ── */}
      {showForm && (
        <div className="review-form-box">
          <form onSubmit={handleSubmitReview}>
            <h3>Share Your Experience</h3>
            
            {!isAuthenticated && (
              <div className="guest-input-row">
                <input 
                  type="text" 
                  className="review-input" 
                  placeholder="Your Name (Optional)"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
              </div>
            )}

            <div className="rating-input-row">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setNewRating(s)} className="rating-star-btn">
                  <Star size={28} className={s <= newRating ? 'star-icon-fill' : 'star-icon-empty'} fill={s <= newRating ? 'currentColor' : 'transparent'} />
                </button>
              ))}
            </div>
            
            <textarea 
              className="review-textarea" 
              placeholder="How has TruthGuard helped you? What can we improve?"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              maxLength={500}
              required
            />
            
            <div className="review-form-footer">
              <span className="char-count">{newMessage.length}/500</span>
              <button type="submit" className="btn-submit-review" disabled={submitting || !newMessage.trim()}>
                {submitting ? <Loader2 className="spinner" size={16} /> : <><Send size={16} /> Submit Review</>}
              </button>
            </div>
            {error && <div className="review-err-msg">{error}</div>}
            {success && <div className="review-success-msg">Success! Thank you for your feedback.</div>}
          </form>
        </div>
      )}

      {/* ── List of Reviews ── */}
      <div className="reviews-feed">
        {displayReviews.length === 0 ? (
          <div className="no-reviews-state">No reviews yet. Be the first!</div>
        ) : (
          displayReviews.map(rev => (
            <div key={rev.id} className="feed-item-card">
              <div className="feed-user">
                <div className="user-avatar" style={rev.userAvatar ? { backgroundImage: `url(${rev.userAvatar})` } : {}}>
                  {!rev.userAvatar && (rev.userName?.[0] || 'U')}
                </div>
                <div className="user-details">
                  <div className="user-name">{rev.userName}</div>
                  <div className="feed-meta">{renderStars(rev.rating)} • {new Date(rev.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="feed-text">{rev.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
