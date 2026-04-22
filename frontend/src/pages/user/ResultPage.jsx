// pages/user/ResultPage.jsx
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './ResultPage.css'

const COLORS = { Real: '#22c55e', Fake: '#ef4444', Uncertain: '#eab308' }

export default function ResultPage() {
  const { state } = useLocation()
  const navigate  = useNavigate()

  if (!state?.result) {
    return (
      <div className="page-container" style={{textAlign:'center',paddingTop:80}}>
        <div style={{marginBottom:16}}><FluentIcon name="search" size={64} /></div>
        <h2>No Result Found</h2>
        <p style={{color:'var(--gray-500)',marginBottom:24}}>Please submit a claim first.</p>
        <button className="btn btn-primary" onClick={() => navigate('/check')}>Check a Claim</button>
      </div>
    )
  }

  const r = state.result
  const claim = state.claim || 'Claim text unavailable'
  const cls = r.classification  // "Real" | "Fake" | "Uncertain"

  const pieData = [
    { name: 'Real', value: r.realProbability },
    { name: 'Fake', value: r.fakeProbability },
  ]
  const barData = [
    { label: 'Real', value: r.realProbability, fill: '#22c55e' },
    { label: 'Fake', value: r.fakeProbability, fill: '#ef4444' },
  ]

  const clsConfig = {
    Real:      { icon:<FluentIcon name="shield" size={48} />, label:'Real News',      color:'var(--green-600)',  bg:'var(--green-50)',  border:'var(--green-400)' },
    Fake:      { icon:<FluentIcon name="cross" size={48} />, label:'Fake News',      color:'var(--red-600)',    bg:'var(--red-50)',    border:'var(--red-400)' },
    Uncertain: { icon:<FluentIcon name="warning" size={48} />, label:'Uncertain',      color:'#92400e',           bg:'var(--yellow-100)',border:'var(--yellow-500)' },
  }
  const cfg = clsConfig[cls] || clsConfig.Uncertain

  return (
    <div className="page-container result-page">

      {/* ── Top Banner ── */}
      <div className="result-banner fade-up" style={{background: cfg.bg, border:`2px solid ${cfg.border}`}}>
        <div className="result-banner-left">
          <span className="result-big-icon">{cfg.icon}</span>
          <div>
            <div className="result-classification" style={{color: cfg.color}}>{cfg.label}</div>
            <div className="result-confidence">
              AI Confidence: <strong>{r.confidence}%</strong>
              {r.modelAccuracy && <span className="model-acc-note"> (Model trained at {(r.modelAccuracy*100).toFixed(1)}% accuracy)</span>}
            </div>
          </div>
        </div>
        <div className="result-banner-right">
          <div className="result-guess-summary">
            <div className="guess-row">
              <span>Your Guess:</span>
              <span className={`badge badge-${r.userGuess==='Real'?'green':'red'}`}>{r.userGuess}</span>
            </div>
            <div className="guess-row">
              <span>AI Result:</span>
              <span className={`badge badge-${cls==='Real'?'green':cls==='Fake'?'red':'yellow'}`}>{cls}</span>
            </div>
            <div className="guess-row">
              <span>Correct Guess:</span>
              <span className={`badge badge-${r.isCorrect?'green':'gray'}`} style={{display:'inline-flex', alignItems:'center', gap:4}}>
                {r.isCorrect ? <><FluentIcon name="check" size={14} /> Yes</> : <><FluentIcon name="cross" size={14} /> No</>}
              </span>
            </div>
            <div className="points-earned" style={{color: r.pointsEarned > 0 ? 'var(--green-600)' : 'var(--gray-500)'}}>
              {r.pointsEarned > 0 ? <span style={{display:'inline-flex', alignItems:'center', gap:4}}>+{r.pointsEarned} Points Earned! <FluentIcon name="star" size={18} /></span> : 'No points this time — keep trying!'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Claim text ── */}
      <div className="card card-body fade-up delay-1">
        <div className="claim-label"><FluentIcon name="memo" size={16} style={{marginRight:8}} /> Submitted Claim</div>
        <p className="claim-display">"{claim}"</p>
      </div>

      {/* ── AI Analysis + Charts ── */}
      <div className="result-grid fade-up delay-2">
        {/* AI Analysis */}
        <div className="card card-body ai-analysis-card">
          <h3 className="result-section-title">
            <span className="result-section-icon"><FluentIcon name="robot" size={24} /></span>
            AI Analysis
          </h3>
          <div className="analysis-separator" />
          <p className="analysis-text">{typeof r.explanation === 'string' ? r.explanation : Array.isArray(r.explanation) ? r.explanation.join(' ') : ''}</p>

          {/* Probability bars */}
          <div className="prob-bars">
            <div className="prob-row">
              <span className="prob-label">Real</span>
              <div className="prob-bar-wrap">
                <div className="prob-bar real-bar" style={{width:`${r.realProbability}%`}} />
              </div>
              <span className="prob-pct" style={{color:'var(--green-600)'}}>{r.realProbability}%</span>
            </div>
            <div className="prob-row">
              <span className="prob-label">Fake</span>
              <div className="prob-bar-wrap">
                <div className="prob-bar fake-bar" style={{width:`${r.fakeProbability}%`}} />
              </div>
              <span className="prob-pct" style={{color:'var(--red-500)'}}>{r.fakeProbability}%</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="card card-body chart-card">
          <h3 className="result-section-title">
            <span className="result-section-icon"><FluentIcon name="chart" size={24} /></span>
            Probability Charts
          </h3>
          <div className="analysis-separator" />
          <div className="charts-wrap">
            <div className="chart-item">
              <p className="chart-label">Distribution</p>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {pieData.map(entry => (
                      <Cell key={entry.name} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                <span><span className="legend-dot" style={{background:'#22c55e'}} />Real {r.realProbability}%</span>
                <span><span className="legend-dot" style={{background:'#ef4444'}} />Fake {r.fakeProbability}%</span>
              </div>
            </div>
            <div className="chart-item">
              <p className="chart-label">Comparison</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} margin={{top:4,right:8,left:-20,bottom:0}}>
                  <XAxis dataKey="label" tick={{fontSize:12}} />
                  <YAxis domain={[0,100]} tick={{fontSize:11}} />
                  <Tooltip formatter={v=>`${v}%`} />
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {barData.map(entry => <Cell key={entry.label} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── Supporting Sources (VERY IMPORTANT) ── */}
      <div className="card fade-up delay-3">
        <div className="card-header" style={{background:'linear-gradient(135deg,#f0f8ff,#e8f4fd)',borderRadius:'18px 18px 0 0'}}>
          <div>
            <h3 className="card-title" style={{fontSize:18}}>
              <FluentIcon name="link" size={24} style={{marginRight:8, verticalAlign:'middle'}} /> Supporting Sources & Verification
            </h3>
            <p style={{fontSize:13,color:'var(--gray-500)',marginTop:4}}>
              {cls === 'Real'
                ? 'This claim aligns with reporting standards from the following trusted sources.'
                : cls === 'Fake'
                ? 'The following fact-checking organizations are referenced to contextualize this finding.'
                : 'Use the following sources to independently verify this uncertain claim.'}
            </p>
          </div>
          <span className={`badge badge-${cls==='Real'?'green':cls==='Fake'?'red':'yellow'}`} style={{fontSize:12}}>
            {r.sources?.length || 0} sources
          </span>
        </div>

        <div className="card-body sources-body">
          {/* Separation notice */}
          <div className="sources-notice">
            <div className="sources-notice-item">
              <span className="notice-dot blue" />
              <strong>AI Analysis</strong> — Based on statistical pattern matching in 44,898 training articles
            </div>
            <div className="sources-notice-item">
              <span className="notice-dot green" />
              <strong>Source Analysis</strong> — Contextual references from established news organizations
            </div>
            <div className="sources-notice-item">
              <span className="notice-dot orange" />
              <strong>Your Verification</strong> — Always independently check via trusted outlets
            </div>
          </div>

          {/* Source cards */}
          <div className="sources-list">
            {(r.sources || []).map((src, i) => (
              <div key={i} className="source-card">
                <div className="source-header">
                  <span className="source-icon">{src.icon}</span>
                  <div className="source-meta">
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="source-name">
                      {src.source}
                      <span className="source-link-icon"><FluentIcon name="link" size={14} /></span>
                    </a>
                    <div className="source-title">{src.title}</div>
                  </div>
                  <span className={`badge badge-${cls==='Real'?'green':cls==='Fake'?'red':'yellow'}`}>
                    {cls === 'Real' ? 'Supports' : cls === 'Fake' ? 'Fact-checks' : 'Verify'}
                  </span>
                </div>

                <div className="source-summary">
                  <div className="source-summary-label"><FluentIcon name="memo" size={16} style={{marginRight:8}} /> Source Summary</div>
                  <p>{src.summary}</p>
                </div>

                <div className="source-explanation">
                  <div className="source-explanation-label"><FluentIcon name="search" size={16} style={{marginRight:8}} /> How this relates to the claim</div>
                  <p>
                    {cls === 'Real'
                      ? `${src.source} is a trusted international news outlet. Claims consistent with real news typically exhibit the same sourcing, structure, and factual patterns upheld by ${src.source}'s editorial standards.`
                      : cls === 'Fake'
                      ? `${src.source} specializes in tracking and debunking misinformation. Content flagged by our AI often shares characteristics with claims previously examined by ${src.source}.`
                      : `${src.source} provides tools and resources to help verify uncertain claims across multiple sources and political perspectives.`
                    }
                  </p>
                </div>

                <div className="source-context">
                  <span className="context-tag">
                    {cls === 'Real' ? <><FluentIcon name="check" size={14} style={{marginRight:4}} /> Editorial standards verified</> : cls === 'Fake' ? <><FluentIcon name="warning" size={14} style={{marginRight:4}} /> Misinformation pattern detected</> : <><FluentIcon name="refresh" size={14} style={{marginRight:4}} /> Cross-reference recommended</>}
                  </span>
                  <span className="context-tag"><FluentIcon name="memo" size={14} style={{marginRight:4}} /> Active fact-checker</span>
                  <span className="context-tag"><FluentIcon name="link" size={14} style={{marginRight:4}} /> International coverage</span>
                </div>
              </div>
            ))}
          </div>

          {/* Source explanation summary */}
          <div className="source-synthesis">
            <h4><FluentIcon name="memo" size={18} style={{marginRight:8, verticalAlign:'middle'}} /> Source Explanation Summary</h4>
            {cls === 'Real' && (
              <p>
                <strong>This claim aligns with reports from trusted sources.</strong> Multiple established news organizations maintain editorial standards consistent with the patterns identified by our AI model. This does not guarantee accuracy — always verify directly through the linked sources above.
              </p>
            )}
            {cls === 'Fake' && (
              <p>
                <strong>Multiple sources provide context around this type of claim.</strong> Our AI model has detected patterns associated with misinformation. The fact-checking organizations listed above specialize in identifying and debunking similar content. We strongly recommend verifying this claim through these resources.
              </p>
            )}
            {cls === 'Uncertain' && (
              <p>
                <strong>This claim requires further investigation.</strong> The AI model could not classify this with sufficient confidence. Use the sources listed above to research this claim from multiple angles before drawing conclusions.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Final Disclaimer ── */}
      <div className="result-disclaimer fade-up delay-4">
        <div className="disclaimer">
          <span className="disclaimer-icon"><FluentIcon name="warning" size={24} /></span>
          <div>
            <strong>Important Disclaimer:</strong> This result is generated using AI and supporting sources. The AI model achieves 99.29% test accuracy but is not infallible. <strong>Please verify using trusted sources</strong> such as Reuters, BBC, AP News, FactCheck.org, or PolitiFact before sharing or acting on this information. AI analysis should complement — not replace — critical thinking.
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="result-actions fade-up delay-4">
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/check')}><FluentIcon name="search" size={20} style={{marginRight:8}} /> Check Another Claim</button>
        <Link to="/dashboard" className="btn btn-secondary btn-lg"><FluentIcon name="chart" size={20} style={{marginRight:8}} /> Back to Dashboard</Link>
        <Link to="/trends"    className="btn btn-ghost btn-lg"><FluentIcon name="graph" size={20} style={{marginRight:8}} /> View Trends</Link>
      </div>
    </div>
  )
}
