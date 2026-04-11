import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import { Target, X, Plus, CheckCircle2, Trash2, HelpCircle } from 'lucide-react'
import './AdminPages.css'

const emptyQ = { q: '', options: ['', '', '', ''], answer: 0, explanation: '' }

export default function ManageQuiz() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', difficulty: 'Beginner', questions: [{ ...emptyQ, options: [...emptyQ.options] }] })

  const load = () => {
    setLoading(true)
    api.get('/quiz/').then(r => setQuizzes(r.data)).catch(() => { }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const addQuestion = () => setForm(f => ({ ...f, questions: [...f.questions, { ...emptyQ, options: [...emptyQ.options] }] }))

  const updateQ = (qi, field, val) => setForm(f => {
    const qs = [...f.questions]
    qs[qi] = { ...qs[qi], [field]: val }
    return { ...f, questions: qs }
  })

  const updateOption = (qi, oi, val) => setForm(f => {
    const qs = [...f.questions]
    const opts = [...qs[qi].options]
    opts[oi] = val
    qs[qi] = { ...qs[qi], options: opts }
    return { ...f, questions: qs }
  })

  const handleCreate = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post('/quiz/admin', form)
      setShowForm(false)
      setForm({ title: '', difficulty: 'Beginner', questions: [{ ...emptyQ, options: [...emptyQ.options] }] })
      load()
    } catch { alert('Failed to create quiz.') }
    finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this quiz?')) return
    await api.delete(`/quiz/admin/${id}`)
    load()
  }

  return (
    <div className="page-container admin-page">
      <div className="admin-page-header fade-up">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Target size={24} /> Manage Quizzes
          </h1>
          <p className="page-subtitle">{quizzes.length} quizzes available</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Quiz</>}
        </button>
      </div>

      {showForm && (
        <div className="card card-body fade-in" style={{ marginBottom: 24 }}>
          <h3 className="admin-section-title" style={{ marginBottom: 20 }}>Create New Quiz</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Quiz Title</label>
                <input className="form-input" required value={form.title} placeholder="e.g. Spotting Fake Headlines"
                  onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-input" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
            </div>

            {form.questions.map((q, qi) => (
              <div key={qi} className="quiz-question-block">
                <div className="quiz-q-header">
                  <strong>Question {qi + 1}</strong>
                  {qi > 0 && <button type="button" className="btn btn-danger btn-sm" onClick={() => setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== qi) }))}>Remove</button>}
                </div>
                <div className="form-group">
                  <label className="form-label">Question Text</label>
                  <input className="form-input" required placeholder="Enter the question…"
                    value={q.q} onChange={e => updateQ(qi, 'q', e.target.value)} />
                </div>
                <div className="quiz-options-edit">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="quiz-opt-row">
                      <input type="radio" name={`answer-${qi}`} checked={q.answer === oi}
                        onChange={() => updateQ(qi, 'answer', oi)} />
                      <input className="form-input" placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        value={opt} required onChange={e => updateOption(qi, oi, e.target.value)} />
                      {q.answer === oi && <span className="correct-mark" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={12} /> Correct</span>}
                    </div>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Explanation (shown after answer)</label>
                  <textarea className="form-input" style={{ minHeight: 70 }} placeholder="Why is this the correct answer?"
                    value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} />
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="button" className="btn btn-secondary" onClick={addQuestion} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Plus size={16} /> Add Question</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create Quiz'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-2 fade-up delay-1">
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><div className="spinner spinner-lg" /></div>
        ) : quizzes.map(qz => (
          <div key={qz.id} className="card card-body admin-quiz-card">
            <div className="admin-quiz-header">
              <div>
                <h3>{qz.title}</h3>
                <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                  <span className={`badge badge-${qz.difficulty === 'Beginner' ? 'green' : qz.difficulty === 'Intermediate' ? 'blue' : 'orange'}`}>{qz.difficulty}</span>
                  <span className="badge badge-gray">{qz.questionCount} questions</span>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(qz.id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
        {!loading && quizzes.length === 0 && (
          <div className="empty-state"><div className="empty-state-icon"><Target size={48} /></div><h3>No quizzes yet</h3><p>Create your first quiz above!</p></div>
        )}
      </div>
    </div>
  )
}
