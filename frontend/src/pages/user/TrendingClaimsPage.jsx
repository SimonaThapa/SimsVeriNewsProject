import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './UserPages.css'

export default function TrendingClaimsPage() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCat, setFilterCat] = useState('All')
  const [filterLoc, setFilterLoc] = useState('All')
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    api.get('/trends/claims').then(r => setClaims(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const categories = ['All', 'Politics', 'Education', 'Health', 'Technology', 'Economy', 'General']
  const locations = ['All', 'Globally Recognized', 'Restricted Region', 'Emerging Trend']

  const filtered = claims.filter(c => {
    const matchCat = filterCat === 'All' || c.category === filterCat
    const matchLoc = filterLoc === 'All' || c.spread === filterLoc
    return matchCat && matchLoc
  })

  const visibleClaims = filtered.slice(0, visibleCount)

  const globalHealth = {
    totalChecked: claims.length,
    reliability: Math.round(claims.reduce((acc, c) => acc + c.reliabilityScore, 0) / (claims.length || 1)),
    virality: Math.round(claims.reduce((acc, c) => acc + c.viralityScore, 0) / (claims.length || 1))
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>

  return (
    <div className="page-container user-page">
      <div className="page-row fade-up" style={{ marginBottom: '8px' }}>
        <div>
          <h1 className="page-title" style={{display:'flex', alignItems:'center', gap:12}}>
            <FluentIcon name="megaphone" size={40} /> News Intelligence Dashboard
          </h1>
          <p className="page-subtitle">Real-time trend analysis, reliability scoring, and geographical spread patterns.</p>
        </div>
      </div>

      {/* Global Summary Stats */}
      <div className="grid-3 fade-up delay-1" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ padding: '20px', borderTop: '4px solid #f97316' }}>
            <div className="stat-label">Network Health</div>
            <div className="stat-value" style={{ color: '#f97316' }}>{globalHealth.reliability}%</div>
            <div style={{ height: 4, background: 'var(--gray-100)', borderRadius: 2, marginTop: 8 }}>
                <div style={{ width: `${globalHealth.reliability}%`, height: '100%', background: '#f97316', borderRadius: 2 }}></div>
            </div>
            <div className="stat-change">Avg Information Reliability</div>
          </div>
          <div className="stat-card" style={{ padding: '20px', borderTop: '4px solid var(--purple-500)' }}>
            <div className="stat-label">Virality Momentum</div>
            <div className="stat-value" style={{ color: 'var(--purple-600)' }}>{globalHealth.virality}%</div>
            <div style={{ height: 4, background: 'var(--gray-100)', borderRadius: 2, marginTop: 8 }}>
                <div style={{ width: `${globalHealth.virality}%`, height: '100%', background: 'var(--purple-500)', borderRadius: 2 }}></div>
            </div>
            <div className="stat-change">Network-wide spread speed</div>
          </div>
          <div className="stat-card" style={{ padding: '20px', borderTop: '4px solid var(--green-500)' }}>
            <div className="stat-label">Active Monitoring</div>
            <div className="stat-value" style={{ color: 'var(--green-600)' }}>{globalHealth.totalChecked}</div>
            <div className="stat-change">Live claims being tracked</div>
          </div>
      </div>

      {/* Filters */}
      <div className="fade-up delay-2" style={{marginBottom: 32, display: 'flex', flexWrap: 'wrap', gap: 24}}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <strong style={{display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1}}>Topic Category</strong>
          <div className="filter-tabs" style={{margin: 0}}>
            {categories.map(c => (
              <button key={c} className={`filter-tab ${filterCat===c?'active':''}`} onClick={()=>setFilterCat(c)}>{c}</button>
            ))}
          </div>
        </div>
        
        <div style={{ flex: 1, minWidth: '300px' }}>
          <strong style={{display: 'block', marginBottom: 8, fontSize: 13, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1}}>Spread Pattern</strong>
          <div className="filter-tabs" style={{margin: 0}}>
            {locations.map(l => (
              <button key={l} className={`filter-tab ${filterLoc===l?'active':''}`} onClick={()=>setFilterLoc(l)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="fade-up delay-3" style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon"><FluentIcon name="search" size={48} /></div>
            <p>No intelligence reports found matching these filters.</p>
          </div>
        ) : (
          visibleClaims.map(c => (
            <div key={c.id} className="card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              padding: '28px',
              borderLeft: `6px solid ${c.classification==='Real'?'var(--green-500)':c.classification==='Fake'?'var(--red-500)':'var(--yellow-500)'}`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              background: 'var(--white)',
              borderRadius: '16px',
              width: '100%'
            }}>
              
              {/* Card Header: Classification and Trend Status */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge badge-${c.classification==='Real'?'green':c.classification==='Fake'?'red':'yellow'}`} style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700, borderRadius: '6px' }}>
                    {c.classification.toUpperCase()}
                    </span>
                    <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        color: c.trendDirection === 'up' ? 'var(--green-600)' : 'var(--red-600)',
                        background: c.trendDirection === 'up' ? 'var(--green-50)' : 'var(--red-50)',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                    }}>
                        {c.trendDirection === 'up' ? '📈 RISING' : '📉 FALLING'}
                    </span>
                </div>
                <span style={{fontSize: '12px', color: 'var(--gray-400)', fontWeight: 500}}>
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </span>
              </div>

              {/* Claim Text */}
              <div style={{ flexGrow: 1 }}>
                <p style={{ 
                  fontSize: '19px', 
                  fontWeight: 600, 
                  color: 'var(--gray-900)', 
                  lineHeight: 1.4, 
                  marginBottom: '24px'
                }}>
                  "{c.claimText}"
                </p>
              </div>

              {/* Intelligence Scores */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                  <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)' }}>Reliability Score</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: c.reliabilityScore > 70 ? 'var(--green-600)' : c.reliabilityScore > 40 ? 'var(--yellow-600)' : 'var(--red-600)' }}>
                              {c.reliabilityScore}%
                          </span>
                      </div>
                      <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3 }}>
                          <div style={{ 
                              width: `${c.reliabilityScore}%`, 
                              height: '100%', 
                              background: c.reliabilityScore > 70 ? 'var(--green-500)' : c.reliabilityScore > 40 ? 'var(--yellow-500)' : 'var(--red-500)', 
                              borderRadius: 3 
                          }}></div>
                      </div>
                  </div>
                  <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-600)' }}>Virality Momentum</span>
                          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--purple-600)' }}>{c.viralityScore}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3 }}>
                          <div style={{ width: `${c.viralityScore}%`, height: '100%', background: 'var(--purple-500)', borderRadius: 3 }}></div>
                      </div>
                  </div>
              </div>

              {/* Location Trends Feature */}
              <div style={{ background: 'var(--gray-50)', padding: '16px', borderRadius: '12px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <FluentIcon name="globe" size={18} />
                      <strong style={{ fontSize: 13, color: 'var(--gray-800)' }}>Location Trends & Geographic Spread</strong>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {c.regionalData?.map(reg => (
                          <div key={reg.country} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontSize: 16 }}>{reg.flag}</span>
                                  <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{reg.country}</span>
                              </div>
                              <span style={{ 
                                  fontWeight: 700, 
                                  color: reg.popularity === 'Very High' ? 'var(--red-600)' : reg.popularity === 'High' ? 'var(--orange-600)' : 'var(--blue-600)',
                                  fontSize: 10,
                                  textTransform: 'uppercase'
                              }}>
                                  {reg.popularity} {reg.popularity === 'Very High' ? '🔥' : reg.popularity === 'High' ? '📈' : '📉'}
                              </span>
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* Smart AI Insight Box */}
              <div style={{ 
                padding: '16px', 
                borderRadius: '12px', 
                background: c.classification === 'Fake' ? 'var(--red-50)' : c.classification === 'Real' ? 'var(--green-50)' : 'var(--blue-50)',
                border: `1px solid ${c.classification === 'Fake' ? 'var(--red-100)' : c.classification === 'Real' ? 'var(--green-100)' : 'var(--blue-100)'}`,
                display: 'flex',
                gap: 12
              }}>
                 <div style={{ fontSize: 20 }}>🧠</div>
                 <div>
                     <strong style={{ display: 'block', fontSize: 12, color: 'var(--gray-900)', marginBottom: 4 }}>Intelligence Insight</strong>
                     <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.4 }}>
                         {c.aiInsight}
                     </p>
                 </div>
              </div>

            </div>
          ))
        )}

        {filtered.length > visibleCount && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <button 
                    onClick={() => setVisibleCount(claims.length)}
                    className="btn btn-outline"
                    style={{ padding: '12px 32px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '14px', gap: '10px', display: 'flex', alignItems: 'center' }}
                >
                    View All Trending Claims <FluentIcon name="refresh" size={16} />
                </button>
            </div>
        )}
      </div>
    </div>
  )
}
