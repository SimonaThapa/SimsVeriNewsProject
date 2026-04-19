// pages/user/TrendsPage.jsx
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './UserPages.css'

export default function TrendsPage() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/trends/').then(r => setData(r.data)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>

  const totals = data?.totals || { Real:0, Fake:0, Uncertain:0 }
  const total  = totals.Real + totals.Fake + totals.Uncertain || 1
  const daily  = data?.daily || []

  const pieData = [
    { name:'Real',      value: totals.Real,      color:'#22c55e' },
    { name:'Fake',      value: totals.Fake,      color:'#ef4444' },
    { name:'Uncertain', value: totals.Uncertain, color:'#eab308' },
  ]

  return (
    <div className="page-container user-page">
      <h1 className="page-title fade-up" style={{display:'flex', alignItems:'center', gap:10}}>
        <FluentIcon name="graph" size={40} /> Trends
      </h1>
      <p className="page-subtitle fade-up delay-1">Real-time statistics on claims checked across the platform</p>

      <div className="grid-3 fade-up delay-1" style={{marginTop:24}}>
        {[
          { label:'Total Real',      value: totals.Real,      color:'var(--green-600)', icon:<FluentIcon name="check" size={24} /> },
          { label:'Total Fake',      value: totals.Fake,      color:'var(--red-600)',   icon:<FluentIcon name="cross" size={24} /> },
          { label:'Uncertain',       value: totals.Uncertain, color:'var(--yellow-500)',icon:<FluentIcon name="warning" size={24} /> },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{background:s.color+'18',fontSize:22}}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{color:s.color}}>{s.value.toLocaleString()}</div>
            <div className="stat-change">{Math.round((s.value/total)*100)}% of all checks</div>
          </div>
        ))}
      </div>

      <div className="grid-2 fade-up delay-2" style={{marginTop:24}}>
        <div className="card card-body">
          <h3 className="chart-title">Overall Distribution</h3>
          {total === 1 ? (
            <div className="empty-state"><div className="empty-state-icon"><FluentIcon name="chart" size={48} /></div><p>No claims checked yet. Be the first!</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={90} paddingAngle={3}>
                  {pieData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card card-body">
          <h3 className="chart-title">Last 30 Days (Daily)</h3>
          {daily.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><FluentIcon name="memo" size={48} /></div><p>No activity in the last 30 days yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={daily} margin={{top:4,right:8,left:-20,bottom:0}}>
                <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={d=>d.slice(5)} />
                <YAxis tick={{fontSize:11}} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Real" stroke="#22c55e" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Fake" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {daily.length > 0 && (
        <div className="card card-body fade-up delay-3">
          <h3 className="chart-title">Daily Breakdown</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={daily.slice(-14)} margin={{top:4,right:8,left:-20,bottom:0}}>
              <XAxis dataKey="date" tick={{fontSize:10}} tickFormatter={d=>d.slice(5)} />
              <YAxis tick={{fontSize:11}} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Real" fill="#22c55e" radius={[4,4,0,0]} />
              <Bar dataKey="Fake" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
