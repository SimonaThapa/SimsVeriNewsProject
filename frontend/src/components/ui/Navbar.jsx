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
          <FluentIcon name="shield" size={32} style={{marginRight:8}} />
          <span className="brand-text">SimsVeriNews</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Contact</Link>

          <div style={{ marginLeft: '10px', marginRight: '10px' }}>
            <select 
              value={theme} 
              onChange={(e) => setTheme(e.target.value)}
              style={{
                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--gray-200)', background: 'var(--white)',
                color: 'var(--gray-800)', cursor: 'pointer', fontSize: '13px'
              }}
            >
              {themes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </option>
              ))}
            </select>
          </div>

          {!user ? (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>Log In</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
                className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}
                style={{display:'flex', alignItems:'center', gap:6}}>
                {user.role === 'admin' ? <><FluentIcon name="chart" size={16} /> Admin</> : <><FluentIcon name="chart" size={16} /> Dashboard</>}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>

        <button className="navbar-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
