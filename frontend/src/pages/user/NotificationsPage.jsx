// pages/user/NotificationsPage.jsx
import { useState, useEffect } from 'react'
import api from '../../api/axios.js'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import './UserPages.css'

export default function NotificationsPage() {
  const [notes, setNotes]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/notifications/').then(r=>setNotes(r.data)).catch(()=>{}).finally(()=>setLoading(false))

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`)
    setNotes(notes.map(n => n.id===id ? {...n,read:true} : n))
  }

  const markAll = async () => {
    await api.put('/notifications/read-all')
    setNotes(notes.map(n=>({...n,read:true})))
  }

  const unread = notes.filter(n=>!n.read).length

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>

  return (
    <div className="page-container user-page">
      <div className="page-row fade-up">
        <div>
          <h1 className="page-title" style={{display:'flex', alignItems:'center', gap:10}}>
            <FluentIcon name="bell" size={40} /> Notifications
          </h1>
          <p className="page-subtitle">{unread} unread notification{unread!==1?'s':''}</p>
        </div>
        {unread > 0 && <button className="btn btn-secondary" onClick={markAll}>Mark All Read</button>}
      </div>

      <div className="notifications-list fade-up delay-1">
        {notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><FluentIcon name="bell" size={48} /></div>
            <h3>No notifications yet</h3>
            <p>You'll get notified when you earn badges and more.</p>
          </div>
        ) : notes.map(n => (
          <div key={n.id} className={`notif-card ${!n.read ? 'unread' : ''}`} onClick={() => !n.read && markRead(n.id)}>
            <div className="notif-icon">
              {n.type==='badge' ? <FluentIcon name="trophy" size={24} /> : 
               n.type==='success' ? <FluentIcon name="check" size={24} color="var(--green-500)" /> :
               n.type==='warning' ? <FluentIcon name="alert" size={24} color="var(--red-500)" /> :
               n.type==='admin' ? <FluentIcon name="megaphone" size={24} /> : 
               <FluentIcon name="bell" size={24} />}
            </div>
            <div className="notif-body">
              <div className="notif-title">{n.title}</div>
              <div className="notif-msg">{n.message}</div>
              <div className="notif-time">{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</div>
            </div>
            {!n.read && <div className="notif-dot" />}
          </div>
        ))}
      </div>
    </div>
  )
}
