import React from 'react';
import ReviewsSection from '../../components/ui/ReviewsSection.jsx';
import './ReviewsPage.css';

export default function ReviewsPage() {
  return (
    <div className="page-container fade-in reviews-page">
      <header className="reviews-header" style={{textAlign: 'center', marginBottom: '48px'}}>
        <h1 className="page-title">Community Voice</h1>
        <p className="page-subtitle">Genuine feedback from our global community of truth seekers.</p>
      </header>

      <ReviewsSection showForm={true} />
    </div>
  );
}

