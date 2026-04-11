// components/layout/UserLayout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import logo from '../../assets/logo.png'
import { LayoutDashboard, Search, TrendingUp, Megaphone, Target, GraduationCap, Trophy, Bell, LogOut, Star, Sun, Moon, User, MessageCircle } from 'lucide-react'
import './UserLayout.css'

const NAV = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/check', icon: <Search size={18} />, label: 'Check Claim' },
  { to: '/trends', icon: <TrendingUp size={18} />, label: 'Trends' },
  { to: '/trending-claims', icon: <Megaphone size={18} />, label: 'Trending Claims' },
  { to: '/quiz', icon: <Target size={18} />, label: 'Quiz' },
  { to: '/learn', icon: <GraduationCap size={18} />, label: 'Learn' },
  { to: '/leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
  { to: '/notifications', icon: <Bell size={18} />, label: 'Notifications' },
  { to: '/profile', icon: <User size={18} />, label: 'Profile' },
  { to: '/contact', icon: <MessageCircle size={18} />, label: 'Support' },
]

export default function UserLayout() {
  const { user, logout } = useAuth()
  const { theme, setTheme, themes } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="user-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src={logo} alt="SimsVeriNews" style={{ width: 28, height: 28 }} />
          <span>SimsVeriNews</span>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-avatar" style={user?.avatar ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {}}>
            {user?.firstName?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="sidebar-username">{user?.name}</div>
            <div className="sidebar-points"><Star size={12} color="#fbbf24" style={{ marginRight: 4 }} /> {user?.points || 0} pts</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <span className="sidebar-link-icon">{item.icon}</span>
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
          
          <button className="sidebar-logout" onClick={() => { logout(); navigate('/') }} style={{ marginTop: '0' }}>
            <LogOut size={18} style={{ marginRight: 10 }} /> Log Out
          </button>
        </div>
      </aside>

      <main className="user-main">
        <Outlet />
      </main>

    </div>
  )
}
