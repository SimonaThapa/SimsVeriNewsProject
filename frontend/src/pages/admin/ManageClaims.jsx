import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import { Search, ShieldCheck, XCircle, AlertTriangle } from 'lucide-react'
import './AdminPages.css'

export default function ManageClaims() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/admin/claims').then(r => setClaims(r.data)).catch(() => { }).finally(() => setLoading(false))
  }, [])

  const filtered = claims.filter(c => {
    const matchFilter = filter === 'all' || c.actualResult === filter
    const matchSearch = c.claimText?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    all: claims.length,
    Real: claims.filter(c => c.actualResult === 'Real').length,
    Fake: claims.filter(c => c.actualResult === 'Fake').length,
    Uncertain: claims.filter(c => c.actualResult === 'Uncertain').length,
  }

  return (
    <div className="page-container admin-page">
      <div className="admin-page-header fade-up">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={24} /> Manage Claims
          </h1>
          <p className="page-subtitle">All claims submitted by users</p>
        </div>
        <div className="admin-claim-stats">
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={12} /> {counts.Real} Real</span>
          <span className="badge badge-red" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> {counts.Fake} Fake</span>
          <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12} /> {counts.Uncertain} Uncertain</span>
        </div>
      </div>

      <div className="admin-filters fade-up delay-1">
        <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input className="form-input" style={{ paddingLeft: 36 }} placeholder="Search claims…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['all', 'Real', 'Fake', 'Uncertain'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? `All (${counts.all})` : `${f} (${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      <div className="card fade-up delay-2">
        <div className="table-wrap" style={{ borderRadius: 'var(--radius-lg)', border: 'none' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner spinner-lg" /></div>
          ) : (
            <table>
              <thead>
                <tr><th>Claim</th><th>AI Result</th><th>Confidence</th><th>Date</th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="claim-preview">{c.claimText}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${c.actualResult === 'Real' ? 'green' : c.actualResult === 'Fake' ? 'red' : 'yellow'}`}>
                        {c.actualResult}
                      </span>
                    </td>
                    <td>
                      <div className="confidence-cell">
                        <div className="mini-bar">
                          <div style={{ width: `${(c.confidence * 100).toFixed(0)}%`, background: c.actualResult === 'Real' ? '#22c55e' : c.actualResult === 'Fake' ? '#ef4444' : '#eab308', height: '100%', borderRadius: 4 }} />
                        </div>
                        <span>{(c.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>No claims found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
