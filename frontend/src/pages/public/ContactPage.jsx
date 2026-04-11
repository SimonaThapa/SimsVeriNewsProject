import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Navbar from '../../components/ui/Navbar.jsx'
import Footer from '../../components/ui/Footer.jsx'
import './PublicPages.css'

export default function ContactPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/contact/', form)
      setSent(true)
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send message")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="public-page">
      <Navbar />
      <section className="public-hero contact-hero">
        <div className="page-container" style={{ textAlign: 'center' }}>
          <span className="section-tag" style={{ marginBottom: 16, display: 'inline-block' }}>Get in Touch</span>
          <h1>Contact Us</h1>
          <p>Have a question, suggestion, or want to report an issue? We'd love to hear from you.</p>
        </div>
      </section>

      <div className="page-container contact-content">
        <div className="contact-grid">
          <div className="contact-info">
            <h3>How can we help?</h3>
            <p>Reach out for any of these reasons:</p>
            {[
              { icon: '🐛', title: 'Report a Bug', desc: 'Found something broken? Let us know and we\'ll fix it fast.' },
              { icon: '💡', title: 'Feature Request', desc: 'Have an idea to make SimsVeriNews better? We\'re listening.' },
              { icon: '📰', title: 'Dataset Contribution', desc: 'Have labeled news data to share? Help us improve the model.' },
              { icon: '🤝', title: 'Partnership', desc: 'Interested in integrating SimsVeriNews into your platform?' },
            ].map(item => (
              <div key={item.title} className="contact-item">
                <span className="contact-item-icon">{item.icon}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="card card-body">
            {sent ? (
              <div className="contact-success">
                <div className="contact-success-icon">✅</div>
                <h3>Message Sent!</h3>
                <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ marginBottom: 24, fontSize: 20 }}>Send a Message</h3>
                <div className="grid-2" style={{ gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" placeholder="Your name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" placeholder="your@email.com" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required>
                    <option value="">Select a subject…</option>
                    <option>Bug Report</option>
                    <option>Feature Request</option>
                    <option>Dataset Contribution</option>
                    <option>Partnership</option>
                    <option>General Question</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input form-textarea" placeholder="Describe your question or issue in detail…" required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                  {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending…</> : 'Send Message →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
