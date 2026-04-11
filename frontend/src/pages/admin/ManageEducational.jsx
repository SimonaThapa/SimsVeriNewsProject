import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import { BookOpen, X, Plus, Lightbulb, GraduationCap, Info } from 'lucide-react'
import './AdminPages.css'

export default function ManageEducational() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ category: 'tip', title: '', content: '', example: '', icon: '💡', label: '' })

  const load = () => {
    setLoading(true)
    api.get('/educational/').then(r => setContent(r.data)).catch(() => { }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/educational/admin', form)
      setShowForm(false)
      setForm({ category: 'tip', title: '', content: '', example: '', icon: '💡', label: '' })
      load()
    } catch { alert('Failed to add content.') }
    finally { setSaving(false) }
  }

  return (
    <div className="page-container admin-page">
      <div className="admin-page-header fade-up">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={24} /> Manage Educational Content
          </h1>
          <p className="page-subtitle">{content.length} items available for users</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Content</>}
        </button>
      </div>

      {showForm && (
        <div className="card card-body fade-in" style={{ marginBottom: 24 }}>
          <h3 className="admin-section-title" style={{ marginBottom: 20 }}>Add Educational Content</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="tip">Tip</option>
                  <option value="technique">Technique</option>
                  <option value="example">Example</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Icon Type</label>
                <select className="form-input" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })}>
                  <option value="💡">Lightbulb (Tip)</option>
                  <option value="🎓">Graduation (Technique)</option>
                  <option value="📖">Book (Example)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input className="form-input" required value={form.title} placeholder="e.g. Check the URL carefully"
                onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Content / Description</label>
              <textarea className="form-input form-textarea" required value={form.content} placeholder="Detailed explanation…"
                onChange={e => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Example (optional)</label>
              <input className="form-input" value={form.example} placeholder="Real-world example…"
                onChange={e => setForm({ ...form, example: e.target.value })} />
            </div>
            {form.category === 'example' && (
              <div className="form-group">
                <label className="form-label">Label</label>
                <select className="form-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })}>
                  <option value="">None</option>
                  <option value="REAL">REAL</option>
                  <option value="FAKE">FAKE</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add Content'}
            </button>
          </form>
        </div>
      )}

      <div className="grid-2 fade-up delay-1">
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner spinner-lg" /></div>
        ) : content.map((item, i) => (
          <div key={item.id || i} className="card card-body edu-admin-card">
            <div className="edu-admin-header">
              <span style={{ color: 'var(--blue-500)', display: 'flex', alignItems: 'center' }}>
                {item.icon === '💡' ? <Lightbulb size={28} /> : item.icon === '🎓' ? <GraduationCap size={28} /> : <BookOpen size={28} />}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-400)', letterSpacing: '.06em' }}>
                  {item.category}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginTop: 2 }}>{item.title}</h3>
              </div>
              {item.label && <span className={`badge badge-${item.label === 'REAL' ? 'green' : 'red'}`}>{item.label}</span>}
            </div>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginTop: 8 }}>{item.content}</p>
            {item.example && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--blue-700)', background: 'var(--blue-50)', padding: '8px 12px', borderRadius: 8, borderLeft: '3px solid var(--blue-400)' }}>
                <strong>Example:</strong> {item.example}
              </div>
            )}
          </div>
        ))}
        {!loading && content.length === 0 && (
          <div className="empty-state"><div className="empty-state-icon"><BookOpen size={48} /></div><h3>No content yet</h3><p>Add your first educational item above.</p></div>
        )}
      </div>
    </div>
  )
}
