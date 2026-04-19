import React from 'react';
import Navbar from '../../components/ui/Navbar.jsx';
import Footer from '../../components/ui/Footer.jsx';
import ReviewsSection from '../../components/ui/ReviewsSection.jsx';
import './ReviewsPage.css';

export default function ReviewsPage() {
  return (
    <div className="public-page reviews-page">
      <Navbar />
      <div className="page-container fade-in">
        <header className="reviews-header" style={{textAlign: 'center', marginBottom: '48px', marginTop: '40px'}}>
          <h1 className="page-title">Community Voice</h1>
          <p className="page-subtitle">Genuine feedback from our global community of truth seekers.</p>
        </header>

        <ReviewsSection showForm={true} />
      </div>
      <Footer />
    </div>
  );
}

