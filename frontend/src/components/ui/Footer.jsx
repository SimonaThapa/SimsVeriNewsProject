import { Link } from 'react-router-dom'
import FluentIcon from './FluentIcon.jsx'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <FluentIcon name="shield" size={24} style={{marginRight:8}} /> SimsVeriNews
            </div>
            <p>AI-powered fake news detection to help you navigate today's information landscape with confidence.</p>
            <div className="footer-badges">
              <span className="badge badge-blue">AI-Powered</span>
              <span className="badge badge-green">Fact-Checked</span>
              <span className="badge badge-orange">Open Source</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navigate</h4>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/register">Sign Up Free</Link>
          </div>

          <div className="footer-col">
            <h4>Tools</h4>
            <Link to="/check">Check a Claim</Link>
            <Link to="/quiz">Media Quiz</Link>
            <Link to="/learn">Learn</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </div>

          <div className="footer-col">
            <h4>Contact Us</h4>
            <form className="footer-form" onSubmit={e => { e.preventDefault(); alert('Message sent! We\'ll get back to you soon.'); e.target.reset(); }}>
              <input className="form-input" placeholder="Your email" type="email" required />
              <textarea className="form-input form-textarea" placeholder="Your message" style={{ minHeight: '80px' }} required />
              <button type="submit" className="btn btn-primary btn-sm btn-full">Send Message</button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SimsVeriNews. Built to fight misinformation.</p>
          <p>AI results may not be 100% accurate. Always verify with trusted sources.</p>
        </div>
      </div>
    </footer>
  )
}
