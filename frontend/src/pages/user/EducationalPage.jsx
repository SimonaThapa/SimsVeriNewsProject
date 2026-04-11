// pages/user/EducationalPage.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './UserPages.css'

export default function EducationalPage() {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    api.get('/educational/').then(r=>setContent(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const cats = ['all', 'tip', 'technique', 'example']
  const filtered = filter === 'all' ? content : content.filter(c=>c.category===filter)

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>

  return (
    <div className="page-container user-page">
      <h1 className="page-title fade-up" style={{display:'flex', alignItems:'center', gap:12}}>
        <FluentIcon name="books" size={40} /> Educational Mode
      </h1>
      <p className="page-subtitle fade-up delay-1">Learn how to identify fake news and improve your media literacy skills.</p>

      <div className="filter-tabs fade-up delay-2" style={{marginTop: 32}}>
        {cats.map(c => (
          <button key={c} className={`filter-tab ${filter===c?'active':''}`} onClick={()=>setFilter(c)}>
            {c==='all'?'All':c==='tip'?'Tips':c==='technique'?'Techniques':'Examples'}
          </button>
        ))}
      </div>

      <div className="grid-2 fade-up delay-3" style={{marginTop:24}}>
        {filtered.map((item, i) => (
          <div key={item.id||i} className={`edu-card card card-body edu-${item.category}`}>
            <div className="edu-card-header">
              <span className="edu-icon">
                {item.category === 'tip' ? <FluentIcon name="bulb" size={24} /> : item.category === 'technique' ? <FluentIcon name="robot" size={24} /> : <FluentIcon name="memo" size={24} />}
              </span>
              <div>
                <div className="edu-category">{item.category?.toUpperCase()}</div>
                <h3>{item.title}</h3>
              </div>
              {item.label && (
                <span className={`badge badge-${item.label==='REAL'?'green':'red'}`} style={{marginLeft:'auto'}}>{item.label}</span>
              )}
            </div>
            <p className="edu-content">{item.content}</p>
            {item.example && (
              <div className="edu-example">
                <strong>Example:</strong> {item.example}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card card-body fade-up delay-5" style={{marginTop: 32, marginBottom: 16, background:'var(--white)'}}>
        <h3 style={{marginBottom:20, display:'flex', alignItems:'center', gap:8}}>
          <FluentIcon name="video" size={24} /> Recommended watching to detect news
        </h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px'}}>
          <a href="https://www.youtube.com/watch?v=AkwWcHekMdo" target="_blank" rel="noopener noreferrer" style={{display: 'block', textDecoration: 'none', color: 'inherit'}}>
            <div style={{position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '12px', transition: 'transform 0.2s'}} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              <img src="https://img.youtube.com/vi/AkwWcHekMdo/hqdefault.jpg" alt="Fact Check Tutorial" style={{width: '100%', height: '180px', objectFit: 'cover', display: 'block'}} />
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)'}}>
                <div style={{background: '#ff0000', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontSize: '20px'}}>▶</div>
              </div>
            </div>
            <h4 style={{margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)'}}>Fact Check Tutorial</h4>
            <p style={{margin: 0, fontSize: '13px', color: 'var(--gray-500)'}}>Learn the basics of fact-checking news online.</p>
          </a>

          <a href="https://www.youtube.com/watch?v=Pj4w0J6odJE&t=66s" target="_blank" rel="noopener noreferrer" style={{display: 'block', textDecoration: 'none', color: 'inherit'}}>
            <div style={{position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '12px', transition: 'transform 0.2s'}} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              <img src="https://img.youtube.com/vi/Pj4w0J6odJE/hqdefault.jpg" alt="BBC My World" style={{width: '100%', height: '180px', objectFit: 'cover', display: 'block'}} />
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)'}}>
                <div style={{background: '#ff0000', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontSize: '20px'}}>▶</div>
              </div>
            </div>
            <h4 style={{margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)'}}>BBC My World</h4>
            <p style={{margin: 0, fontSize: '13px', color: 'var(--gray-500)'}}>Identifying fake news and misinformation with BBC.</p>
          </a>

          <a href="https://www.youtube.com/watch?v=wPE6CkAW9QY" target="_blank" rel="noopener noreferrer" style={{display: 'block', textDecoration: 'none', color: 'inherit'}}>
            <div style={{position: 'relative', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '12px', transition: 'transform 0.2s'}} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              <img src="https://img.youtube.com/vi/wPE6CkAW9QY/hqdefault.jpg" alt="Media Literacy Guide" style={{width: '100%', height: '180px', objectFit: 'cover', display: 'block'}} />
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)'}}>
                <div style={{background: '#ff0000', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontSize: '20px'}}>▶</div>
              </div>
            </div>
            <h4 style={{margin: '0 0 6px', fontSize: '15px', fontWeight: 600, color: 'var(--gray-900)'}}>Media Literacy Guide</h4>
            <p style={{margin: 0, fontSize: '13px', color: 'var(--gray-500)'}}>A deep dive into media literacy and verification.</p>
          </a>
        </div>
      </div>

      <div className="card card-body fade-up delay-6" style={{marginTop:24, background:'linear-gradient(135deg,var(--blue-50),#f0f4ff)', borderColor:'var(--blue-200)'}}>
        <h3 style={{marginBottom:12, display:'flex', alignItems:'center', gap:8}}><FluentIcon name="link" size={24} /> Trusted Fact-Checking Resources</h3>
        <div className="resources-grid">
          {[
            { name:'PolitiFact',      url:'https://www.politifact.com',   desc:'Rates political claims' },
            { name:'Snopes',          url:'https://www.snopes.com',        desc:'Debunks viral myths' },
            { name:'FactCheck.org',   url:'https://www.factcheck.org',     desc:'Non-partisan fact-checking' },
            { name:'Reuters Fact',    url:'https://www.reuters.com/fact-check', desc:'News agency fact-checks' },
            { name:'AP Fact Check',   url:'https://apnews.com/APFactCheck', desc:'Associated Press checks' },
            { name:'BBC Reality',     url:'https://www.bbc.com/news/reality_check', desc:'BBC\'s fact-checking unit' },
          ].map(r => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="resource-link">
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                <strong>{r.name}</strong>
                <FluentIcon name="link" size={14} />
              </div>
              <span>{r.desc}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
