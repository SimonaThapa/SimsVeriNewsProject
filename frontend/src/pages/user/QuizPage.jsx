// pages/user/QuizPage.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './UserPages.css'

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([])
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [view, setView] = useState('list') // 'list', 'quiz', 'result'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/quiz/')
      .then(r => setQuizzes(r.data))
      .catch(err => console.error("Failed to load quizzes:", err))
      .finally(() => setLoading(false))
  }, [])

  const resetQuizStates = () => {
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
  }

  const startQuiz = async (qz) => {
    try {
      const { data } = await api.get(`/quiz/${qz.id}`)
      setActiveQuiz(data)
      setQuestions(data.questions)
      resetQuizStates()
      setView('quiz')
    } catch (err) {
      console.error("Failed to load quiz details:", err)
    }
  }

  const handleAnswer = (idx) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    if (idx === questions[current].answer) setScore(s => s + 1)
  }

  const next = () => {
    if (current + 1 >= questions.length) {
      setView('result')
      return
    }
    setCurrent(c => c + 1)
    setSelected(null)
    setAnswered(false)
  }

  const retryQuiz = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    resetQuizStates()
    setView('quiz')
  }

  const backToList = (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setView('list')
    setActiveQuiz(null)
    resetQuizStates()
  }

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>

  return (
    <div className="page-container user-page">
      {view === 'result' ? (
        /* ── Result View ── */
        <div className="quiz-result-screen">
          <div className="quiz-result-icon">
            {score === questions.length ? <FluentIcon name="trophy" size={80} /> : score >= questions.length / 2 ? <FluentIcon name="party" size={80} /> : <FluentIcon name="books" size={80} />}
          </div>
          <h2>Quiz Complete!</h2>
          <div className="quiz-score">{score} / {questions.length} correct</div>
          <p style={{ color: 'var(--gray-500)', marginBottom: 28 }}>
            {score === questions.length ? 'Perfect score! You\'re a media literacy expert!' : score >= questions.length / 2 ? 'Good job! Keep practicing to improve.' : 'Keep learning — every quiz makes you sharper!'}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={retryQuiz}>Retry Quiz</button>
            <button className="btn btn-secondary" onClick={backToList}>Back to Quizzes</button>
          </div>
        </div>
      ) : view === 'quiz' && activeQuiz && questions.length > 0 ? (
        /* ── Quiz Question View ── */
        <>
          <div className="quiz-header">
            <h1 className="page-title">{activeQuiz.title}</h1>
            <span className="badge badge-blue">Question {current + 1} of {questions.length}</span>
          </div>
          <div className="quiz-progress-bar"><div style={{ width: `${((current) / (questions.length)) * 100}%` }} /></div>
          <div className="quiz-card card card-body fade-in">
            <p className="quiz-question">{questions[current]?.q}</p>
            <div className="quiz-options">
              {questions[current]?.options.map((opt, i) => {
                let cls = 'quiz-option'
                if (answered) {
                  if (i === questions[current].answer) cls += ' correct'
                  else if (i === selected) cls += ' wrong'
                }
                return (
                  <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered}>
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    <span>{opt}</span>
                    {answered && i === questions[current].answer && <span className="option-check"><FluentIcon name="check" size={20} /></span>}
                    {answered && i === selected && i !== questions[current].answer && <span className="option-x"><FluentIcon name="cross" size={20} /></span>}
                  </button>
                )
              })}
            </div>
            {answered && (
              <div className="quiz-explanation">
                <strong><FluentIcon name="bulb" size={18} style={{ marginRight: 8 }} /> Explanation:</strong> {questions[current]?.explanation}
              </div>
            )}
            {answered && (
              <button className="btn btn-primary btn-full" onClick={next} style={{ marginTop: 16 }}>
                {current + 1 >= questions.length ? 'See Results' : 'Next Question →'}
              </button>
            )}
          </div>
        </>
      ) : (
        /* ── Quiz List View ── */
        <>
          <h1 className="page-title fade-up" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FluentIcon name="target" size={40} /> Media Literacy Quizzes
          </h1>
          <p className="page-subtitle fade-up delay-1">Test your ability to spot fake news and improve your critical thinking skills.</p>
          <div className="grid-2 fade-up delay-2" style={{ marginTop: 24 }}>
            {quizzes.map(qz => (
              <div key={qz.id} className="card card-body quiz-list-card">
                <div className="quiz-list-header">
                  <div>
                    <h3>{qz.title}</h3>
                    <span className={`badge badge-${qz.difficulty === 'Beginner' ? 'green' : qz.difficulty === 'Intermediate' ? 'blue' : 'orange'}`}>
                      {qz.difficulty}
                    </span>
                  </div>
                  <span className="quiz-count">{qz.questionCount} questions</span>
                </div>
                <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={() => startQuiz(qz)}>
                  Start Quiz →
                </button>
              </div>
            ))}
            {quizzes.length === 0 && (
              <div className="empty-state"><div className="empty-state-icon"><FluentIcon name="target" size={48} /></div><h3>No quizzes available yet</h3><p>Check back soon!</p></div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
