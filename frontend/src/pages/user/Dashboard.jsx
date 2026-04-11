// pages/user/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './Dashboard.css'

const BADGE_DEFS = {
  'First Check':    { icon:<FluentIcon name="trophy" size={20} />, color:'#f97316' },
  'Fact Finder':    { icon:<FluentIcon name="search" size={20} />, color:'#3b82f6' },
  'Truth Seeker':   { icon:<FluentIcon name="star" size={20} />, color:'#eab308' },
  'News Detective': { icon:<FluentIcon name="shield" size={20} />, color:'#8b5cf6' },
  'Point Collector':{ icon:<FluentIcon name="star" size={20} />, color:'#06b6d4' },
  'Century Club':   { icon:<FluentIcon name="trophy" size={20} />, color:'#ec4899' },
  'Streak Master':  { icon:<FluentIcon name="fire" size={20} />, color:'#ef4444' },
}

export default function Dashboard() {
  const { user, refreshUser } = useAuth()
  const [history, setHistory]   = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    refreshUser()
    api.get('/detect/history?limit=5').then(r => setHistory(r.data.claims)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const accuracy = user?.totalClaims > 0
    ? Math.round((user.correctGuesses / user.totalClaims) * 100)
    : 0

  return (
    <div className="page-container dashboard">
      {/* Welcome */}
      <div className="dash-welcome fade-up">
        <div>
          <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">Here's your fact-checking activity at a glance.</p>
        </div>
        <Link to="/check" className="btn btn-primary btn-lg">
          <FluentIcon name="search" size={20} style={{marginRight:10}} /> Check a Claim
        </Link>
      </div>

      {/* Stats */}
      <div className="grid-4 fade-up delay-1">
        <div className="stat-card" style={{borderTop:'4px solid var(--blue-500)'}}>
          <div className="stat-icon" style={{background:'var(--blue-100)', color:'var(--blue-600)'}}><FluentIcon name="star" size={28} /></div>
          <div className="stat-label">Total Points</div>
          <div className="stat-value" style={{color:'var(--blue-600)'}}>{user?.points || 0}</div>
        </div>
        <div className="stat-card" style={{borderTop:'4px solid var(--green-500)'}}>
          <div className="stat-icon" style={{background:'var(--green-100)', color:'var(--green-600)'}}><FluentIcon name="shield" size={28} /></div>
          <div className="stat-label">Claims Checked</div>
          <div className="stat-value" style={{color:'var(--green-600)'}}>{user?.totalClaims || 0}</div>
        </div>
        <div className="stat-card" style={{borderTop:'4px solid var(--orange-500)'}}>
          <div className="stat-icon" style={{background:'var(--orange-100)', color:'var(--orange-600)'}}><FluentIcon name="target" size={28} /></div>
          <div className="stat-label">Accuracy</div>
          <div className="stat-value" style={{color:'var(--orange-600)'}}>{accuracy}%</div>
        </div>
        <div className="stat-card" style={{borderTop:'4px solid var(--purple-500)'}}>
          <div className="stat-icon" style={{background:'var(--purple-100)', color:'var(--purple-600)'}}><FluentIcon name="fire" size={28} /></div>
          <div className="stat-label">Current Streak</div>
          <div className="stat-value" style={{color:'var(--purple-500)'}}>{user?.streak || 0}</div>
        </div>
      </div>

      <div className="dash-grid fade-up delay-2">
        {/* Badges */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{display:'flex', alignItems:'center', gap:8}}><FluentIcon name="trophy" size={20} /> Your Badges</span>
            <span className="badge badge-blue">{user?.badges?.length || 0} earned</span>
          </div>
          <div className="card-body">
            {user?.badges?.length > 0 ? (
              <div className="badges-grid">
                {user.badges.map(b => {
                  const def = BADGE_DEFS[b] || { icon:<FluentIcon name="trophy" size={18} />, color:'#64748b' }
                  return (
                    <div key={b} className="badge-item" style={{borderColor: def.color + '40', background: def.color + '10'}}>
                      <span className="badge-item-icon">{def.icon}</span>
                      <span className="badge-item-name">{b}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="empty-state" style={{padding:'32px 0'}}>
                <div className="empty-state-icon"><FluentIcon name="trophy" size={48} /></div>
                <h3>No badges yet</h3>
                <p>Start checking claims to earn your first badge!</p>
                <Link to="/check" className="btn btn-primary btn-sm" style={{marginTop:14}}>Check a Claim</Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dash-quick">
          <h3 style={{marginBottom:16,fontSize:16,fontWeight:700,color:'var(--gray-800)'}}>Quick Actions</h3>
          <div className="quick-actions">
            {[
              { to:'/check',       icon:<FluentIcon name="search" size={24} />, label:'Check a Claim',   desc:'Verify news with AI',      color:'var(--blue-500)' },
              { to:'/quiz',        icon:<FluentIcon name="target" size={24} />, label:'Take a Quiz',      desc:'Test your knowledge',      color:'var(--green-500)' },
              { to:'/learn',       icon:<FluentIcon name="books" size={24} />, label:'Educational Mode', desc:'Learn media literacy',     color:'var(--orange-500)' },
              { to:'/trends',      icon:<FluentIcon name="graph" size={24} />, label:'View Trends',      desc:'See what\'s being checked', color:'var(--purple-500)' },
              { to:'/leaderboard', icon:<FluentIcon name="trophy" size={24} />, label:'Leaderboard',      desc:'See top fact-checkers',    color:'#ec4899' },
              { to:'/notifications',icon:<FluentIcon name="bell" size={24} />,label:'Notifications',    desc:'Your alerts & badges',     color:'#06b6d4' },
            ].map(a => (
              <Link key={a.to} to={a.to} className="quick-action-card">
                <div className="qa-icon" style={{background: a.color + '15', color: a.color}}>{a.icon}</div>
                <div>
                  <div className="qa-label">{a.label}</div>
                  <div className="qa-desc">{a.desc}</div>
                </div>
                <span className="qa-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="card fade-up delay-3">
        <div className="card-header">
          <span className="card-title" style={{display:'flex', alignItems:'center', gap:8}}><FluentIcon name="memo" size={20} /> Recent Claims</span>
          <Link to="/check" className="btn btn-primary btn-sm">New Check</Link>
        </div>
        <div className="card-body" style={{padding:0}}>
          {loading ? (
            <div style={{padding:'32px',textAlign:'center'}}><div className="spinner spinner-lg" /></div>
          ) : history.length === 0 ? (
            <div className="empty-state" style={{padding:'40px 0'}}>
              <div className="empty-state-icon"><FluentIcon name="memo" size={48} /></div>
              <h3>No claims yet</h3>
              <p>Your verified claims will appear here after your first check.</p>
            </div>
          ) : (
            <div className="table-wrap" style={{borderRadius:0,border:'none'}}>
              <table>
                <thead>
                  <tr>
                    <th>Claim</th><th>Your Guess</th><th>AI Result</th><th>Correct?</th><th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(c => (
                    <tr key={c.id}>
                      <td style={{maxWidth:300}}>
                        <div className="claim-text-cell">{c.claimText}</div>
                      </td>
                      <td><span className={`badge badge-${c.userGuess==='Real'?'green':'red'}`}>{c.userGuess}</span></td>
                      <td><span className={`badge badge-${c.actualResult==='Real'?'green':c.actualResult==='Fake'?'red':'yellow'}`}>{c.actualResult}</span></td>
                      <td>{c.isCorrect ? <span className="badge badge-green" style={{display:'inline-flex', alignItems:'center', gap:4}}><FluentIcon name="check" size={14} /> Yes</span> : <span className="badge badge-gray" style={{display:'inline-flex', alignItems:'center', gap:4}}><FluentIcon name="cross" size={14} /> No</span>}</td>
                      <td><strong style={{color:'var(--blue-600)'}}>+{c.pointsEarned}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
