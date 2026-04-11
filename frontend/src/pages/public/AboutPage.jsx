// pages/public/AboutPage.jsx
import Navbar from '../../components/ui/Navbar.jsx'
import Footer from '../../components/ui/Footer.jsx'
import { Link } from 'react-router-dom'
import './PublicPages.css'

const TIPS = [
  { icon: '🔗', title: 'Check the URL', desc: 'Look for misspelled domains. "ABCnews.com.co" is NOT ABC News. Real outlets use clean, recognized domains.' },
  { icon: '📅', title: 'Check the Date', desc: 'Old stories are often reshared as new. Always verify when the article was originally published.' },
  { icon: '👤', title: 'Verify the Author', desc: 'Search the author\'s name. Fake news often uses anonymous sources or fictional journalists.' },
  { icon: '🖼️', title: 'Reverse Image Search', desc: 'Drag suspicious images to Google Images to check if they were taken from a different context.' },
  { icon: '📖', title: 'Read Beyond the Headline', desc: 'Headlines can be misleading. Read the full article — often the content contradicts the headline.' },
  { icon: '🔍', title: 'Cross-Check Sources', desc: 'If a story is real, multiple trusted outlets will cover it. If only one obscure site reports it, be skeptical.' },
]

const MODEL_RESULTS = [
  { model: 'Naive Bayes', acc: '93.04%', color: '#94a3b8' },
  { model: 'Logistic Regression', acc: '98.36%', color: '#60a5fa' },
  { model: 'Random Forest', acc: '98.53%', color: '#34d399' },
  { model: 'SVM (LinearSVC)', acc: '99.27%', color: '#f97316', best: true },
]

export default function AboutPage() {
  return (
    <div className="public-page">
      <Navbar />
      <section className="public-hero about-hero">
        <div className="page-container" style={{ textAlign: 'center' }}>
          <span className="section-tag" style={{ marginBottom: 16, display: 'inline-block' }}>About SimsVeriNews</span>
          <h1>How Our System Works</h1>
          <p>A transparent look at the AI model, dataset, and methodology behind our fake news detection engine.</p>
        </div>
      </section>

      <div className="page-container about-content">
        {/* ML Pipeline */}
        <div className="about-block fade-up">
          <h2>🤖 The Machine Learning Pipeline</h2>
          <p>SimsVeriNews is built on a supervised machine learning pipeline trained on the popular WELFake dataset — 44,898 articles labeled as Real or Fake. We tested four different algorithms and selected the best performer.</p>

          <div className="model-comparison">
            {MODEL_RESULTS.map(m => (
              <div key={m.model} className={`model-row ${m.best ? 'best' : ''}`}>
                <span className="model-name">{m.model} {m.best && <span className="badge badge-orange" style={{ marginLeft: 8 }}>Best ✓</span>}</span>
                <div className="model-bar-wrap">
                  <div className="model-bar" style={{ width: m.acc, background: m.color }} />
                </div>
                <span className="model-acc">{m.acc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it processes */}
        <div className="about-block fade-up delay-1">
          <h2>⚙️ Text Processing Steps</h2>
          <div className="pipeline-steps">
            {['Input claim text', 'Convert to lowercase', 'Remove non-alphabetic characters', 'WordNet Lemmatization', 'Remove English stopwords', 'TF-IDF Vectorization (50k features)', 'SVM Classification', 'Confidence scoring via calibration'].map((s, i) => (
              <div key={i} className="pipeline-step">
                <div className="pipeline-num">{i + 1}</div>
                <div>{s}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="about-block fade-up delay-2">
          <h2>💡 Media Literacy Tips</h2>
          <p style={{ marginBottom: 28, color: 'var(--gray-600)' }}>Even without AI, you can spot fake news by following these proven techniques:</p>
          <div className="grid-3">
            {TIPS.map(t => (
              <div key={t.title} className="tip-card">
                <div className="tip-icon">{t.icon}</div>
                <h4>{t.title}</h4>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="about-block fade-up delay-3">
          <div className="disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <div>
              <strong>Important Disclaimer:</strong> SimsVeriNews's AI analysis is a helpful tool, not an absolute authority. Our model achieves 99.27% accuracy on our test set, but real-world performance can vary. Always verify important claims through multiple trusted news sources before drawing conclusions.
            </div>
          </div>
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Try It Free →</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
