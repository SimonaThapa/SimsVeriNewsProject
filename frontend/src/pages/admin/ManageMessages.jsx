// pages/admin/ManageMessages.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import './AdminPages.css'

export default function ManageMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMessages = async () => {
    try {
      const res = await api.get('/admin/contacts')
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const deleteMessage = async (id) => {
    if (!window.confirm("Delete this message?")) return
    try {
      await api.delete(`/admin/contacts/${id}`)
      setMessages(messages.filter(m => m.id !== id))
    } catch (err) {
      alert("Error deleting message")
    }
  }

  if (loading) return <div className="admin-loader"><div className="spinner spinner-lg" /></div>

  const getAvatarColor = (name) => {
    const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#2dd4bf'];
    const index = (name || 'A').charCodeAt(0) % colors.length;
    return colors[index];
  }

  const getSubjectClass = (sub) => {
      const s = String(sub).toLowerCase();
      if (s.includes('bug')) return 'bug';
      if (s.includes('feature')) return 'feature';
      if (s.includes('partnership')) return 'partnership';
      if (s.includes('dataset')) return 'dataset';
      return 'general';
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header fade-up" style={{ padding: '20px 40px 0 30px' }}>
        <div>
          <h1 className="admin-page-title">Support Inbox</h1>
          <p className="admin-page-subtitle">Manage user inquiries and technical reports.</p>
        </div>
        <div className="admin-badge-count" style={{ marginTop: 12, marginRight: 20 }}>{messages.length} Total Messages</div>
      </div>

      <div className={messages.length > 0 ? "admin-inbox-container fade-up delay-1" : ""}>
        {messages.length === 0 ? (
          <div className="card card-body admin-empty-state fade-up">
            <div className="empty-state-icon-wrap">
              <div className="empty-state-blob" />
              <img 
                src="https://emojicdn.elk.sh/📬?style=apple" 
                alt="Empty Inbox" 
                style={{ width: 60, height: 60, position: 'relative' }} 
              />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Inbox all clear!</h3>
            <p style={{ maxWidth: 360, margin: '0 auto 16px auto', color: 'var(--gray-500)', fontSize: 12, lineHeight: 1.5 }}>
              There are no pending inquiries. Once users submit the contact form, their messages will appear here.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-primary btn-sm" onClick={fetchMessages}>
                    <span style={{ marginRight: 6 }}>🔄</span> Refresh
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => window.location.href = '/admin-dashboard'}>
                    Dashboard
                </button>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.id} className="card card-body edu-admin-card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="edu-admin-header" style={{ marginBottom: 16 }}>
                <span style={{ color: 'var(--blue-500)', display: 'flex', alignItems: 'center' }}>
                   <div className="msg-avatar" style={{ background: getAvatarColor(msg.name), width: 44, height: 44, fontSize: 16 }}>
                    {msg.name?.[0]?.toUpperCase() || 'A'}
                  </div>
                </span>
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', letterSpacing: '.06em' }}>
                    {msg.subject}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', marginTop: 2 }}>{msg.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    <a href={`mailto:${msg.email}?subject=RE: ${msg.subject}`} className="icon-btn" title="Reply" style={{ fontSize: 16 }}>
                        ✉️
                    </a>
                    <button className="icon-btn delete" onClick={() => deleteMessage(msg.id)} title="Delete" style={{ fontSize: 16 }}>
                        🗑️
                    </button>
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, margin: '8px 0 16px 0' }}>{msg.message}</p>
              
              <div style={{ marginTop: 'auto', fontSize: 12, color: 'var(--blue-700)', background: 'var(--blue-50)', padding: '10px 14px', borderRadius: 8, borderLeft: '3px solid var(--blue-400)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                   <strong>From:</strong> {msg.email}
                </div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>
                    {new Date(msg.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
