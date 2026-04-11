// pages/user/LeaderboardPage.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './UserPages.css'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/leaderboard').then(r=>setLeaders(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const medals = [
    <FluentIcon name="medal" size={32} />, 
    <FluentIcon name="medal" size={32} />, 
    <FluentIcon name="medal" size={32} />
  ]

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>

  return (
    <div className="page-container user-page">
      <div className="leaderboard-hero fade-up">
        <h1 className="page-title" style={{display:'flex', alignItems:'center', gap:12}}>
          <FluentIcon name="trophy" size={40} /> Leaderboard
        </h1>
        <p className="page-subtitle">Top fact-checkers ranked by total points earned</p>
      </div>

      {leaders.slice(0,3).length > 0 && (
        <div className="podium fade-up delay-1">
          {[leaders[1], leaders[0], leaders[2]].filter(Boolean).map((l, i) => {
            const pos = i===0?2 : i===1?1 : 3
            return (
              <div key={l.name} className={`podium-spot spot-${pos}`}>
                <div className="podium-avatar">{l.name?.[0]?.toUpperCase()}</div>
                <div className="podium-medal">{medals[pos-1]}</div>
                <div className="podium-name">{l.name}</div>
                <div className="podium-pts">{l.points} pts</div>
              </div>
            )
          })}
        </div>
      )}

      <div className="card fade-up delay-2" style={{marginTop:24}}>
        <div className="card-header">
          <span className="card-title">Full Rankings</span>
          <span className="badge badge-blue">{leaders.length} players</span>
        </div>
        <div className="table-wrap" style={{borderRadius:0,border:'none'}}>
          <table>
            <thead>
              <tr><th>Rank</th><th>Player</th><th>Points</th><th>Claims</th><th>Badges</th></tr>
            </thead>
            <tbody>
              {leaders.map(l => (
                <tr key={l.rank} className={l.name === user?.name ? 'current-user-row' : ''}>
                  <td>
                    <span className="rank-num">
                      {l.rank <= 3 ? <FluentIcon name="medal" size={24} /> : `#${l.rank}`}
                    </span>
                  </td>
                  <td>
                    <div className="leader-name-cell">
                      <div className="leader-avatar">{l.name?.[0]?.toUpperCase()}</div>
                      <span>{l.name} {l.name===user?.name && <span className="badge badge-blue" style={{fontSize:10}}>You</span>}</span>
                    </div>
                  </td>
                  <td><strong style={{color:'var(--blue-600)'}}>{l.points}</strong></td>
                  <td>{l.totalClaims}</td>
                  <td>{l.badges?.slice(0,3).join(' ') || '—'}</td>
                </tr>
              ))}
              {leaders.length === 0 && (
                <tr><td colSpan={5} style={{textAlign:'center',padding:'40px',color:'var(--gray-400)'}}>No rankings yet. Start checking claims!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
