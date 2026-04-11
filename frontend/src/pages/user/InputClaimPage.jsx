// pages/user/InputClaimPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './InputClaimPage.css'

export default function InputClaimPage() {
  const navigate = useNavigate()
  const [claim, setClaim]     = useState('')
  const [guess, setGuess]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const canSubmit = claim.trim().length > 10 && guess !== ''

  const handleSubmit = async () => {
    if (!canSubmit) return
    setError(''); setLoading(true)
    try {
      const { data } = await api.post('/detect/analyze', { claim: claim.trim(), userGuess: guess })
      navigate(`/result/${data.claimId}`, { state: { result: data, claim: claim.trim() } })
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Make sure the backend is running and the model is trained.')
    } finally { setLoading(false) }
  }

  const EXAMPLES = [
    'Scientists have discovered that drinking coffee daily reduces Alzheimer\'s risk by 65%.',
    'The government plans to ban all social media platforms next month.',
    'NASA confirms water ice found beneath the surface of Mars.',
  ]

  return (
    <div className="page-container input-claim-page">
      <div className="input-page-header fade-up">
        <h1 className="page-title" style={{display:'flex', alignItems:'center', gap:12}}>
          <FluentIcon name="search" size={40} /> Check a News Claim
        </h1>
        <p className="page-subtitle">Paste any news headline or claim below. First make your guess, then let the AI analyze it!</p>
      </div>

      <div className="input-main fade-up delay-1">
        <div className="input-card card card-body">
          {/* Gamification note */}
          <div className="gamification-notice">
            <FluentIcon name="game" size={32} />
            <div>
              <strong>How Points Work:</strong> Guess correctly → earn <strong>+10 points</strong>. The AI will check your answer after you submit!
            </div>
          </div>

          {/* Claim input */}
          <div className="form-group" style={{marginTop:24}}>
            <label className="form-label">News Claim or Headline</label>
            <textarea
              className="form-input form-textarea claim-textarea"
              placeholder="Paste or type a news headline, article excerpt, or claim you want to verify…"
              value={claim}
              onChange={e => setClaim(e.target.value)}
              maxLength={2000}
            />
            <div className="char-count">{claim.length} / 2000 characters</div>
          </div>

          {/* Example claims */}
          <div className="examples-section">
            <p className="examples-label">Try an example:</p>
            <div className="examples-list">
              {EXAMPLES.map((ex, i) => (
                <button key={i} className="example-btn" onClick={() => setClaim(ex)}>
                  {ex.length > 70 ? ex.slice(0,70) + '…' : ex}
                </button>
              ))}
            </div>
          </div>

          {/* Guess selector */}
          <div className="guess-section">
            <h3 className="guess-title">
              <span className="guess-title-icon"><FluentIcon name="bulb" size={24} /></span> Your Guess — Is this claim Real or Fake?
            </h3>
            <p className="guess-subtitle">Select your guess before we run the AI. This is how you earn points!</p>

            <div className="guess-options">
              <button
                className={`guess-btn guess-real ${guess === 'Real' ? 'selected' : ''}`}
                onClick={() => setGuess('Real')}
              >
                <span className="guess-icon"><FluentIcon name="shield" size={40} /></span>
                <span className="guess-label">Real News</span>
                <span className="guess-desc">This claim seems factual and credible</span>
              </button>
              <button
                className={`guess-btn guess-fake ${guess === 'Fake' ? 'selected' : ''}`}
                onClick={() => setGuess('Fake')}
              >
                <span className="guess-icon"><FluentIcon name="cross" size={40} /></span>
                <span className="guess-label">Fake News</span>
                <span className="guess-desc">This claim seems misleading or false</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" style={{marginTop:20}}>
              <FluentIcon name="warning" size={20} style={{marginRight:10}} /> {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-full btn-xl submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
          >
            {loading
              ? <><div className="spinner" style={{width:20,height:20,borderWidth:2,borderColor:'rgba(255,255,255,.3)',borderTopColor:'white'}} /> Analyzing with AI…</>
              : !claim.trim() ? <><FluentIcon name="memo" size={20} style={{marginRight:8}} /> Enter a claim above first</>
              : !guess        ? <><FluentIcon name="search" size={20} style={{marginRight:8}} /> Select your guess above first</>
              : <><FluentIcon name="send" size={20} style={{marginRight:8}} /> Analyze with AI →</>
            }
          </button>

          <p className="submit-note">
            Analysis takes 1–2 seconds. The AI model achieves <strong>99.27% accuracy</strong> on our test set.
          </p>
        </div>

        {/* How it works sidebar */}
        <div className="input-sidebar">
          <div className="card card-body sidebar-info">
            <h4>🤖 How the AI Works</h4>
            <div className="ai-steps">
              {[
                { icon:<FluentIcon name="sparkles" size={20} />, text:'Your claim is cleaned: lowercase, lemmatized, stopwords removed' },
                { icon:<FluentIcon name="chart" size={20} />, text:'Converted to TF-IDF numerical features (50,000 dimensions)' },
                { icon:<FluentIcon name="brain" size={20} />, text:'SVM model classifies as Real or Fake with calibrated confidence' },
                { icon:<FluentIcon name="graph" size={20} />, text:'Confidence score shows how certain the model is (>60% = confident)' },
              ].map((s,i) => (
                <div key={i} className="ai-step">
                  <span className="ai-step-icon">{s.icon}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-body sidebar-tips">
            <h4><FluentIcon name="bulb" size={20} style={{marginRight:10, verticalAlign:'middle'}} /> For Best Results</h4>
            <ul>
              <li>Include the full headline and first paragraph</li>
              <li>Avoid very short claims (under 15 words)</li>
              <li>Works best with English-language news</li>
              <li>Always verify important results manually</li>
            </ul>
          </div>

          <div className="disclaimer">
            <span className="disclaimer-icon"><FluentIcon name="warning" size={20} /></span>
            <span>AI results are not 100% accurate. Always verify important claims through trusted sources like Reuters, BBC, or AP News.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
