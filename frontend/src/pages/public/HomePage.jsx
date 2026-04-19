// pages/public/HomePage.jsx
import { Link } from 'react-router-dom'
import Navbar from '../../components/ui/Navbar.jsx'
import Footer from '../../components/ui/Footer.jsx'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import ReviewsSection from '../../components/ui/ReviewsSection.jsx'
import './HomePage.css'

const FEATURES = [
  { icon: <FluentIcon name="robot" size={32} />, title: 'AI-Powered Detection', desc: 'Our SVM model trained on 44,000+ articles achieves 99.27% accuracy in detecting fake news.' },
  { icon: <FluentIcon name="chart" size={32} />, title: 'Confidence Scoring', desc: 'Every result comes with a confidence percentage and visual breakdown of real vs fake probability.' },
  { icon: <FluentIcon name="link" size={32} />, title: 'Source Verification', desc: 'Trusted sources like Reuters, BBC, and PolitiFact are cross-referenced to support every analysis.' },
  { icon: <FluentIcon name="target" size={32} />, title: 'Gamification', desc: 'Earn points, unlock badges, and climb the leaderboard by guessing correctly before AI analysis.' },
  { icon: <FluentIcon name="books" size={32} />, title: 'Educational Mode', desc: 'Learn media literacy skills, spotting tips, and best practices to identify misinformation yourself.' },
  { icon: <FluentIcon name="graph" size={32} />, title: 'Trends Tracking', desc: 'See real-time charts of what topics are being checked and how fake news spreads over time.' },
]

const STEPS = [
  { n: '01', title: 'Paste Your Claim', desc: 'Enter any news headline, article excerpt, or claim you want to verify.' },
  { n: '02', title: 'Make Your Guess', desc: 'Before seeing the AI result, guess whether you think it\'s Real or Fake.' },
  { n: '03', title: 'Get AI Analysis', desc: 'Our 99.27% accurate ML model analyzes the claim and returns a classification.' },
  { n: '04', title: 'See Sources & Score', desc: 'View supporting sources, confidence charts, explanation, and your earned points.' },
]

const STATS = [
  { value: '99.27%', label: 'Model Accuracy' },
  { value: '44K+', label: 'Training Articles' },
  { value: '4', label: 'ML Models Tested' },
  { value: '100%', label: 'Free to Use' },
]

export default function HomePage() {
  return (
    <div className="home-page">
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-badge fade-up">
            <FluentIcon name="shield" size={20} style={{marginRight:8}} /> AI-Powered Fact Checker
          </div>
          <h1 className="hero-title fade-up delay-1">
            Stop Fake News<br />
            <span className="hero-gradient">Before It Spreads</span>
          </h1>
          <p className="hero-desc fade-up delay-2">
            SimsVeriNews uses a 99.27% accurate machine learning model trained on 44,000+ real and fake news articles to help you instantly verify any claim.
          </p>
          <div className="hero-actions fade-up delay-3">
            <Link to="/register" className="btn btn-primary btn-xl">Get Started Free →</Link>
            <Link to="/about" className="btn btn-outline-white btn-xl">How It Works</Link>
          </div>
          <div className="hero-stats fade-up delay-4">
            {STATS.map(s => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-value">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section">
        <div className="page-container">
          <div className="section-head">
            <span className="section-tag">Simple Process</span>
            <h2 className="section-title">How SimsVeriNews Works</h2>
            <p className="section-sub">Four easy steps to verify any news claim in seconds</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.n} className={`step-card fade-up delay-${i + 1}`}>
                <div className="step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section section-alt">
        <div className="page-container">
          <div className="section-head">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-sub">A complete fake news detection platform built for accuracy and education</p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`feature-card fade-up delay-${(i % 3) + 1}`}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Community Reviews ── */}
      <section className="section">
        <div className="page-container">
          <div className="section-head">
            <span className="section-tag">Testimonials</span>
            <h2 className="section-title">Community Feedback</h2>
            <p className="section-sub">Join thousands of users who trust TruthGuard for their daily news verification.</p>
          </div>
          <ReviewsSection showForm={true} limit={3} />
          <div style={{textAlign: 'center', marginTop: 40}}>
            <Link to="/reviews" className="btn btn-outline-primary">View All Reviews →</Link>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="fade-up">Ready to Fight Misinformation?</h2>
          <p className="fade-up delay-1">Join thousands of users using AI to verify news and earn points while doing it.</p>
          <div className="cta-actions fade-up delay-2">
            <Link to="/register" className="btn btn-primary btn-xl">Create Free Account</Link>
            <Link to="/login" className="btn btn-outline-white btn-xl">Sign In</Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
