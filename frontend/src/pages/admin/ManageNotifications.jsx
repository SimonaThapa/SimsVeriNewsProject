import { useState } from 'react'
import api from '../../api/axios.js'
import { Bell, Megaphone, CheckCircle2, AlertTriangle, Sparkles, LayoutDashboard, Send } from 'lucide-react'
import './AdminPages.css'

export default function ManageNotifications() {
  const [form, setForm] = useState({ title: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleBroadcast = async e => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    setLoading(true); setSuccess(''); setError('')
    try {
      const { data } = await api.post('/notifications/admin/broadcast', form)
      setSuccess(data.message || 'Notification sent to all users!')
      setForm({ title: '', message: '' })
    } catch {
      setError('Failed to send notification. Please try again.')
    } finally { setLoading(false) }
  }

  const TEMPLATES = [
    { title: '🎉 New Feature Released!', message: 'We have added new quizzes and educational content to help you improve your media literacy. Check it out!' },
    { title: '📊 System Update', message: 'Our AI model has been retrained with new data, improving accuracy. Keep checking those claims!' },
    { title: '🏆 Leaderboard Reset', message: 'The monthly leaderboard has been reset. Start checking claims to earn your spot at the top!' },
    { title: '📚 New Educational Content', message: 'New tips and tutorials have been added to the Educational Mode. Learn how to spot fake news more effectively.' },
  ]

  return (
    <div className="page-container admin-page">
      <div className="admin-page-header fade-up">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell size={24} /> Manage Notifications
          </h1>
          <p className="page-subtitle">Broadcast announcements to all users</p>
        </div>
      </div>

      <div className="admin-notif-grid fade-up delay-1">
        {/* Broadcast form */}
        <div className="card card-body">
          <h3 className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Megaphone size={20} /> Send Broadcast</h3>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 20 }}>This will send a notification to ALL registered users.</p>

          {success && <div className="alert alert-success" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} /> {success}</div>}
          {error && <div className="alert alert-danger" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18} /> {error}</div>}

          <form onSubmit={handleBroadcast}>
            <div className="form-group">
              <label className="form-label">Notification Title</label>
              <input className="form-input" placeholder="e.g. New Feature Released!" required
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input form-textarea" placeholder="Notification message for all users…" required
                value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Sending…</> : <><Send size={18} /> Send to All Users</>}
            </button>
          </form>
        </div>

        {/* Templates */}
        <div className="card card-body">
          <h3 className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={20} /> Quick Templates</h3>
          <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 16 }}>Click a template to fill the form automatically.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TEMPLATES.map((t, i) => (
              <button key={i} className="template-btn" onClick={() => setForm(t)}>
                <strong>{t.title}</strong>
                <span>{t.message.slice(0, 60)}…</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
