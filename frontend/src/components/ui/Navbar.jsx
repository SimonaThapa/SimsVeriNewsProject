// components/ui/Navbar.jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'
import FluentIcon from './FluentIcon.jsx'
import { Sun, Moon } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { theme, setTheme, themes } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <FluentIcon name="shield" size={32} className="navbar-logo-img" />
          <span className="navbar-brand-text">SimsVeriNews</span>
        </Link>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Contact</Link>
          </div>

          <div className="navbar-actions">
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              className="theme-select-minimal"
            >
              {themes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </option>
              ))}
            </select>

            {!user ? (
              <div className="navbar-auth-buttons">
                <Link to="/login" className="btn-login-outline" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link to="/register" className="btn-signup-filled" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </div>
            ) : (
              <div className="navbar-user-actions">
                <Link to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
                  className="user-nav-email" onClick={() => setMenuOpen(false)}
                  style={{display:'flex', alignItems:'center', gap:6}}>
                  {user.role === 'admin' ? <><FluentIcon name="chart" size={16} /> Admin</> : <><FluentIcon name="chart" size={16} /> Dashboard</>}
                </Link>
                <button className="btn-logout-circle" onClick={handleLogout} title="Log Out">
                  <FluentIcon name="shield" size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        <button className="navbar-mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
