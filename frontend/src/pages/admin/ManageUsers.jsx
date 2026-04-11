import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './AdminPages.css'

export default function ManageUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/users/admin/users').then(r => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    try {
      await api.delete(`/users/admin/users/${id}`)
      setUsers(u => u.filter(x => x.id !== id))
    } catch { alert('Failed to delete user.') }
    finally { setDeleting(null) }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-container admin-page">
      <div className="admin-page-header fade-up">
        <div>
          <h1 className="page-title" style={{display:'flex', alignItems:'center', gap:10}}>
            <FluentIcon name="user" size={32} /> Manage Users
          </h1>
          <p className="page-subtitle">{users.length} total registered users</p>
        </div>
        <button className="btn btn-secondary" onClick={load} style={{display:'flex', alignItems:'center', gap:8}}>
          <FluentIcon name="refresh" size={18} /> Refresh
        </button>
      </div>

      <div className="admin-search-bar fade-up delay-1">
        <div style={{position:'relative', width:'100%', maxWidth:320}}>
          <span className="search-icon-abs"><FluentIcon name="search" size={16} /></span>
          <input className="form-input" style={{paddingLeft:36}} placeholder="Search users by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="search-count">{filtered.length} results</span>
      </div>

      <div className="card fade-up delay-2">
        <div className="table-wrap" style={{ borderRadius: 'var(--radius-lg)', border: 'none' }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner spinner-lg" /></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Email</th><th>Role</th><th>Points</th><th>Claims</th><th>Badges</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm" style={{ background: u.role === 'admin' ? 'var(--orange-500)' : 'var(--blue-500)' }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="user-name-text">{u.name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{u.email}</td>
                    <td>
                      <span className={`badge badge-${u.role === 'admin' ? 'orange' : 'blue'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td><strong style={{ color: 'var(--blue-600)' }}>{u.points}</strong></td>
                    <td>{u.totalClaims}</td>
                    <td>{u.badges?.length || 0}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={deleting === u.id}
                        >
                          {deleting === u.id ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <><FluentIcon name="trash" size={16} style={{marginRight:6}} /> Delete</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>No users found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
