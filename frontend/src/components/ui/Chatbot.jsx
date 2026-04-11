// components/ui/Chatbot.jsx
import { useState, useRef, useEffect } from 'react'
import api from '../../api/axios.js'
import { FaRobot } from 'react-icons/fa6'
import FluentIcon from './FluentIcon.jsx'
import './Chatbot.css'

export default function Chatbot() {
  const [open, setOpen]     = useState(false)
  const [msgs, setMsgs]     = useState([
    { role: 'bot', text: <><FluentIcon name="hand" size={20} style={{marginRight:8}} /> Hi! I'm <strong>SimsVeriBot</strong>. Ask me about fake news, how to verify claims, or trusted sources!</> }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', text }])
    setLoading(true)
    try {
      const { data } = await api.post('/chatbot/message', { message: text })
      setMsgs(m => [...m, { role: 'bot', text: data.response }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', text: "Sorry, I'm having trouble right now. Please try again!" }])
    } finally { setLoading(false) }
  }

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  return (
    <>
      <button className={`chatbot-fab ${open ? 'open' : ''}`} onClick={() => setOpen(!open)} title="Chat with SimsVeriBot">
        {open ? '✕' : <FaRobot size={32} style={{ color: 'white' }} />}
      </button>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-avatar"><FaRobot size={32} /></div>
            <div>
              <div className="chatbot-name">SimsVeriBot</div>
              <div className="chatbot-status">● Online</div>
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chatbot-messages">
            {msgs.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.role === 'bot' && <span className="chat-avatar"><FaRobot size={24} /></span>}
                <div className="chat-bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg bot">
                <span className="chat-avatar"><FaRobot size={24} /></span>
                <div className="chat-bubble chat-typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-input-row">
            <input
              className="form-input" value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={onKey}
              placeholder="Ask about fake news..."
            />
            <button className="btn btn-primary btn-sm" onClick={send} disabled={!input.trim() || loading}>
              {loading ? <div className="spinner" style={{width:16,height:16,borderWidth:2}} /> : <FluentIcon name="send" size={18} />}
            </button>
          </div>

          <div className="chatbot-chips">
            {['How to detect?', 'Trusted sources', 'What is bias?'].map(q => (
              <button key={q} className="chip" onClick={() => { setInput(q); }}>{q}</button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
