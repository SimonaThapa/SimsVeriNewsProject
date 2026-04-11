// pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './AdminPages.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>

  const pieData = [
    { name: 'Real',      value: stats?.realCount      || 0, color: '#22c55e' },
    { name: 'Fake',      value: stats?.fakeCount      || 0, color: '#ef4444' },
    { name: 'Uncertain', value: stats?.uncertainCount || 0, color: '#eab308' },
  ]

  const barData = stats?.topUsers?.map(u => ({ name: u.name?.split(' ')[0], pts: u.points })) || []

  return (
    <div className="page-container admin-page">
      <div className="admin-page-header fade-up">
        <div>
          <h1 className="page-title" style={{display:'flex', alignItems:'center', gap:10}}>
            <FluentIcon name="chart" size={40} /> Admin Dashboard
          </h1>
          <p className="page-subtitle">Platform overview and analytics</p>
        </div>
        <div className="admin-header-badges">
          <span className="badge badge-orange">Admin Mode</span>
          <span className="badge badge-green">Live Data</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 fade-up delay-1">
        {[
          { label: 'Total Users',    value: stats?.totalUsers,    icon: <FluentIcon name="user" size={32} />, color: 'var(--blue-500)',   bg: 'var(--blue-50)' },
          { label: 'Total Claims',   value: stats?.totalClaims,   icon: <FluentIcon name="search" size={32} />, color: 'var(--green-500)',  bg: 'var(--green-50)' },
          { label: 'New This Week',  value: stats?.recentClaims,  icon: <FluentIcon name="graph" size={32} />, color: 'var(--orange-500)', bg: 'var(--orange-50)' },
          { label: 'New Users/Week', value: stats?.recentUsers,   icon: <FluentIcon name="sparkles" size={32} />, color: 'var(--purple-500)', bg: 'var(--purple-100)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ borderLeft: `4px solid ${s.color}` }}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2 fade-up delay-2">
        <div className="card card-body">
          <h3 className="admin-chart-title">Claim Classification Breakdown</h3>
          {(stats?.totalClaims || 0) === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><FluentIcon name="chart" size={48} /></div><p>No claims submitted yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={85} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card card-body">
          <h3 className="admin-chart-title">Top Users by Points</h3>
          {barData.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><FluentIcon name="trophy" size={48} /></div><p>No user data yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="pts" fill="var(--blue-500)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="admin-quick-links fade-up delay-3">
        <h3>Quick Actions</h3>
        <div className="grid-3">
          {[
            { to: '/admin/users',         icon: <FluentIcon name="user" size={24} />, label: 'Manage Users',        desc: 'View, edit, delete users',          color: 'var(--blue-500)' },
            { to: '/admin/claims',        icon: <FluentIcon name="search" size={24} />, label: 'Manage Claims',        desc: 'Browse all submitted claims',        color: 'var(--green-500)' },
            { to: '/admin/notifications', icon: <FluentIcon name="bell" size={24} />, label: 'Send Notifications',   desc: 'Broadcast announcements to users',  color: 'var(--orange-500)' },
            { to: '/admin/quiz',          icon: <FluentIcon name="target" size={24} />, label: 'Manage Quizzes',       desc: 'Add or remove quiz questions',      color: 'var(--purple-500)' },
            { to: '/admin/educational',   icon: <FluentIcon name="books" size={24} />, label: 'Educational Content', desc: 'Manage tips and tutorials',          color: '#ec4899' },
          ].map(a => (
            <Link key={a.to} to={a.to} className="admin-quick-card">
              <span className="admin-quick-icon" style={{ color: a.color }}>{a.icon}</span>
              <div>
                <div className="admin-quick-label">{a.label}</div>
                <div className="admin-quick-desc">{a.desc}</div>
              </div>
              <span className="admin-quick-arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
