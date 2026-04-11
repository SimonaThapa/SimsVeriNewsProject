// pages/public/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Navbar from '../../components/ui/Navbar.jsx'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './AuthPages.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-left-content">
            <div className="auth-logo">
              <FluentIcon name="shield" size={32} style={{marginRight:8}} /> SimsVeriNews
            </div>
            <h2>Join the fight against misinformation</h2>
            <p>Create a free account and start detecting fake news, earning badges, and improving your media literacy today.</p>
            <div className="auth-features">
              {['Free forever — no credit card needed', 'Earn points and climb the leaderboard', 'Get personalized tips and quizzes', 'Track your fact-checking history'].map(f => (
                <div key={f} className="auth-feature">
                  <FluentIcon name="check" size={16} style={{marginRight:8}} /> {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-card-header">
              <h2>Create Account</h2>
              <p>Users only — admin accounts are pre-configured</p>
            </div>

            {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}><FluentIcon name="warning" size={18} style={{marginRight:8}} /> {error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Your full name" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input className="form-input" type="password" placeholder="Min 6 characters" required
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" placeholder="Repeat password" required
                    value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account…</> : 'Create Account →'}
              </button>
            </form>

            <div className="auth-divider"><span>Already have an account?</span></div>
            <Link to="/login" className="btn btn-secondary btn-full">Sign In Instead</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
