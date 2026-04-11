// pages/public/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Navbar from '../../components/ui/Navbar.jsx'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './AuthPages.css'

export default function LoginPage() {
  const { login, resetPassword } = useAuth()
  const navigate = useNavigate()
  
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', newPassword: '' })
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async e => {
    e.preventDefault()
    setError(''); setSuccessMsg(''); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.role === 'admin' ? '/admin-dashboard' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.')
    } finally { setLoading(false) }
  }

  const handleResetSubmit = async e => {
    e.preventDefault()
    setError(''); setSuccessMsg(''); setLoading(true)
    try {
      await resetPassword(form.email, form.newPassword)
      setSuccessMsg('password updated successfully. you can now log in.')
      setIsForgotPassword(false)
      setForm({ ...form, password: '', newPassword: '' })
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password.')
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
            <h2>Welcome back!</h2>
            <p>Log in to continue detecting fake news, earning points, and staying informed.</p>
            <div className="auth-features">
              {['99.27% accurate AI model', 'Earn points for correct guesses', 'Access trending news analysis', 'Interactive media literacy quizzes'].map(f => (
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
              <h2>{isForgotPassword ? 'Reset Password' : 'Sign In'}</h2>
              <p>{isForgotPassword ? 'Enter your email and a new password' : 'Enter your credentials to access your account'}</p>
            </div>

            {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}><FluentIcon name="warning" size={18} style={{marginRight:8}} /> {error}</div>}
            {successMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}><FluentIcon name="check" size={18} style={{marginRight:8}} /> {successMsg}</div>}

            {isForgotPassword ? (
              <form onSubmit={handleResetSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@example.com" required
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" placeholder="New password" required
                    value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Resetting…</> : 'Reset Password'}
                </button>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <button type="button" className="btn btn-ghost" onClick={() => { setIsForgotPassword(false); setError(''); setSuccessMsg(''); }}>
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" placeholder="you@example.com" required
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                    <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: 'var(--blue-600)', fontSize: '13px', cursor: 'pointer' }}>
                      Forgot Password?
                    </button>
                  </div>
                  <input className="form-input" type="password" placeholder="Your password" required style={{ marginTop: '6px' }}
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in…</> : 'Sign In →'}
                </button>
              </form>
            )}

            <div className="auth-divider"><span>New to SimsVeriNews?</span></div>
            <Link to="/register" className="btn btn-secondary btn-full">Create a Free Account</Link>

            <div className="auth-hint">
              <strong>Admin?</strong> Use your admin email above. There is no separate admin login.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
