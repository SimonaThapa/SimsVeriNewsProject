// components/layout/AdminLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import './AdminLayout.css'

const ADMIN_NAV = [
  { to: '/admin-dashboard',     icon: '📊', label: 'Dashboard' },
  { to: '/admin/users',         icon: '👥', label: 'Manage Users' },
  { to: '/admin/claims',        icon: '🔍', label: 'Manage Claims' },
  { to: '/admin/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/admin/quiz',          icon: '🎯', label: 'Manage Quiz' },
  { to: '/admin/educational',   icon: '📚', label: 'Educational' },
  { to: '/admin/messages',      icon: '✉️', label: 'Support Messages' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { theme, setTheme, themes } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>⚙️</span>
          <span>Admin Panel</span>
        </div>

        <div className="admin-user">
          <div className="admin-avatar" style={user?.avatar ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {}}>
            {user?.firstName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <div className="admin-username">{user?.name || 'Admin'}</div>
            <div className="admin-role-badge">Administrator</div>
          </div>
        </div>

        <nav className="admin-nav">
          {ADMIN_NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/admin-dashboard'}
              className={({ isActive }) => `admin-link ${isActive ? 'active' : ''}`}>
              <span className="admin-link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingBottom: '10px', padding: '0 16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--gray-500)', marginBottom: '8px', textTransform: 'uppercase' }}>Theme</div>
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--gray-200)', marginBottom: '12px' }}>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              style={{
                width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--gray-200)', background: 'var(--white)',
                color: 'var(--gray-800)', cursor: 'pointer', fontSize: '13px'
              }}
            >
              {themes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name} Theme
                </option>
              ))}
            </select>
          </div>

          <button className="admin-logout" onClick={() => { logout(); navigate('/') }} style={{ marginTop: '0' }}>
            🚪 Log Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
