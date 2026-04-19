import React, { useState, useEffect } from 'react';
import { Star, Send, User as UserIcon, Loader2, Trash2, Heart, MessageSquare } from 'lucide-react';
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

  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [activeMessageBox, setActiveMessageBox] = useState(null);
  const [inputContent, setInputContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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

  const handleDeleteReview = async (id) => {
    try {
      await api.delete(`/reviews/${id}`);
      setDeleteConfirmId(null);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete review');
    }
  };

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      alert('Please log in to like reviews!');
      return;
    }
    try {
      await api.post(`/reviews/${id}/like`);
      fetchReviews();
    } catch (err) {
      console.error('Error liking review:', err);
    }
  };

  const handleAddComment = async (rid) => {
    if (!inputContent.trim()) return;
    try {
      await api.post(`/reviews/${rid}/comment`, { message: inputContent });
      setInputContent('');
      setActiveCommentBox(null);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post comment');
    }
  };

  const handleSendDirectMessage = async (rid) => {
    if (!inputContent.trim()) return;
    try {
      await api.post(`/reviews/${rid}/message`, { message: inputContent });
      setInputContent('');
      setActiveMessageBox(null);
      alert('Message sent successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    }
  };

  const renderStars = (rating, size = 16) => {
    return (
      <div className="section-stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s} size={size}
            className={s <= rating ? 'star-icon-fill filled' : 'star-icon-empty'}
            fill={s <= rating ? '#FFD700' : 'transparent'}
            color={s <= rating ? '#FFD700' : '#d1d5db'}
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
      {/* ── Professional Stats Header ── */}
      <div className="reviews-stats-grid">
        <div className="stat-card">
          <div className="stat-card-label">Total Reviews</div>
          <div className="stat-card-value-row">
            <span className="stat-card-num">{summary.total > 1000 ? (summary.total / 1000).toFixed(1) + 'k' : summary.total}</span>
            <span className="stat-growth-badge">21% ↑</span>
          </div>
          <div className="stat-card-sub">Growth in reviews this year</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">Average Rating</div>
          <div className="stat-card-value-row">
            <span className="stat-card-num">{summary.average.toFixed(1)}</span>
            <div className="stat-stars-wrap">
              {renderStars(Math.round(summary.average), 20)}
            </div>
          </div>
          <div className="stat-card-sub">Average rating on this year</div>
        </div>

        <div className="stat-card breakdown-card">
          {[5, 4, 3, 2, 1].map(num => {
            const count = summary.breakdown[num] || 0;
            const percent = summary.total > 0 ? (count / summary.total) * 100 : 0;
            return (
              <div key={num} className="stat-bar-row">
                <span className="bar-num">{num}</span>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${percent}%`, background: num >= 4 ? '#10b981' : num >= 3 ? '#fbbf24' : '#f43f5e' }} /></div>
                <span className="bar-count">{count > 1000 ? (count / 1000).toFixed(1) + 'k' : count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Submission Form ── */}
      {showForm && (
        <div className="review-form-box professional-form">
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
                  <Star size={28} className={s <= newRating ? 'star-icon-fill filled' : 'star-icon-empty'} fill={s <= newRating ? '#FFD700' : 'transparent'} color={s <= newRating ? '#FFD700' : '#d1d5db'} />
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
          displayReviews.map(rev => {
            const isLiked = user && rev.likes?.includes(user.id);
            return (
              <div key={rev.id} className="professional-feed-card">
                <div className="card-left-bio">
                  <div className="user-avatar simple-avatar" style={{ backgroundColor: `hsl(${(rev.userName?.length || 0) * 137.5 % 360}, 70%, 60%)` }}>
                    {rev.userName?.[0] || 'U'}
                  </div>
                  <div className="bio-name">{rev.userName}</div>
                  <div className="bio-stats">
                    <div className="bio-stat-item">Claims Verified: <span>{rev.totalClaims || 14}</span></div>
                    <div className="bio-stat-item">Truth Score: <span>{rev.truthScore || '88%'}</span></div>
                  </div>
                </div>

                <div className="card-right-content">
                  <div className="feed-header-row">
                    <div className="rating-date">
                      {renderStars(rev.rating, 14)}
                      <span className="rev-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>

                    {(user?.id === rev.userId || user?.role === 'admin') && (
                      <div className="delete-confirm-wrapper">
                        {deleteConfirmId === rev.id ? (
                          <div className="delete-confirm-actions fade-in">
                            <span className="confirm-label">Confirm delete?</span>
                            <button onClick={() => handleDeleteReview(rev.id)} className="btn-confirm-delete">Yes</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="btn-cancel-delete">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirmId(rev.id)} className="btn-delete-rev" title="Delete Review">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="feed-text">{rev.message}</div>

                  {/* ── Comments List ── */}
                  {rev.comments?.length > 0 && (
                    <div className="comments-list">
                      {rev.comments.map(c => (
                        <div key={c.id} className="comment-bubble">
                          <div className="comment-header">
                            <span className="comment-user">{c.userName}</span>
                            <span className="comment-date">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="comment-msg">{c.message}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Interaction Inputs ── */}
                  {activeCommentBox === rev.id && (
                    <div className="inline-input-box fade-in">
                      <textarea
                        placeholder="Write a public comment..."
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                      />
                      <div className="input-actions">
                        <button className="btn-cancel" onClick={() => setActiveCommentBox(null)}>Cancel</button>
                        <button className="btn-send-social" onClick={() => handleAddComment(rev.id)}>Post Comment</button>
                      </div>
                    </div>
                  )}

                  {activeMessageBox === rev.id && (
                    <div className="inline-input-box fade-in">
                      <textarea
                        placeholder={`Send a private message to ${rev.userName}...`}
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                      />
                      <div className="input-actions">
                        <button className="btn-cancel" onClick={() => setActiveMessageBox(null)}>Cancel</button>
                        <button className="btn-send-social" onClick={() => handleSendDirectMessage(rev.id)}>Send Message</button>
                      </div>
                    </div>
                  )}

                  <div className="feed-actions">
                    <button
                      className={`btn-action btn-comment ${activeCommentBox === rev.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveMessageBox(null);
                        setActiveCommentBox(activeCommentBox === rev.id ? null : rev.id);
                        setInputContent('');
                      }}
                    >
                      <MessageSquare size={14} /> Public Comment ({rev.comments?.length || 0})
                    </button>
                    <button
                      className={`btn-action btn-message ${activeMessageBox === rev.id ? 'active' : ''}`}
                      onClick={() => {
                        setActiveCommentBox(null);
                        setActiveMessageBox(activeMessageBox === rev.id ? null : rev.id);
                        setInputContent('');
                      }}
                    >
                      <Send size={14} /> Message
                    </button>
                    <button className={`btn-heart ${isLiked ? 'active' : ''}`} onClick={() => handleLike(rev.id)}>
                      <Heart size={18} fill={isLiked ? 'currentColor' : 'transparent'} />
                      <span className="like-count">{rev.likes?.length || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
