// pages/user/ProfilePage.jsx
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import FluentIcon from '../../components/ui/FluentIcon.jsx'
import { Edit2 } from 'lucide-react'

export default function ProfilePage() {
  const { user, updateProfile } = useAuth()
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    avatar: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      let fName = user.firstName || ''
      let lName = user.lastName || ''
      
      if (!fName && !lName && user.name) {
        const parts = user.name.split(' ')
        fName = parts[0] || ''
        lName = parts.slice(1).join(' ') || ''
      }
      
      setForm({
        firstName: fName,
        lastName: lName,
        email: user.email || '',
        phone: user.phone || '',
        location: user.country || user.city || user.location || '',
        avatar: user.avatar || ''
      })
    }
  }, [user])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, avatar: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        country: form.location,
        avatar: form.avatar
      }
      
      await updateProfile(payload)
      setSuccess('Profile updated successfully!')
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const initials = form.firstName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'
  const displayName = `${form.firstName} ${form.lastName}`.trim() || user?.name || 'User'

  return (
    <div className="page-container fade-up">
      
      <div className="page-row fade-up" style={{ marginBottom: '30px' }}>
        <div>
          <h1 className="page-title" style={{display:'flex', alignItems:'center', gap:10}}>
            <FluentIcon name="user" size={40} /> Edit Profile
          </h1>
          <p className="page-subtitle">Update your personal information and location</p>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ maxWidth: '700px', margin: '0 auto 20px' }}>{error}</div>}
      {success && <div className="alert alert-success" style={{ maxWidth: '700px', margin: '0 auto 20px' }}>{success}</div>}

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '50px', borderRadius: '24px', boxShadow: '0 12px 36px var(--shadow-color)', borderTop: '4px solid var(--blue-500)', background: 'var(--white)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Header: Avatar and Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%', marginBottom: '44px', justifyContent: 'flex-start' }}>
          
          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
            <div 
              style={{
                width: '100%', height: '100%', borderRadius: '50%', backgroundColor: 'var(--blue-50)',
                color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36, fontWeight: 'bold', overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', cursor: 'pointer'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {form.avatar ? (
                <img src={form.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : initials}
            </div>
            
            <button 
              type="button" onClick={() => fileInputRef.current?.click()}
              style={{ 
                position: 'absolute', bottom: '0', right: '0', 
                background: 'var(--blue-600)', color: '#fff',
                width: '28px', height: '28px', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #fff', cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}
            >
              <Edit2 size={12} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
          </div>

          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--gray-900)', margin: '0 0 6px 0' }}>{displayName}</h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', margin: 0 }}>
              Kindly update your information.
            </p>
          </div>
          
        </div>

        {/* Inputs */}
        <div style={{ width: '100%' }}>
          
          <div className="grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', color: 'var(--gray-700)', marginBottom: '8px', fontWeight: 'bold' }}>First Name</label>
              <input type="text" 
                style={{ 
                  borderRadius: '8px', border: '1px solid var(--gray-200)', 
                  padding: '12px 16px', fontSize: '14px', background: 'var(--white)',
                  outline: 'none', transition: 'box-shadow 0.2s', width: '100%'
                }}
                value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', color: 'var(--gray-700)', marginBottom: '8px', fontWeight: 'bold' }}>Last Name</label>
              <input type="text" 
                style={{ 
                  borderRadius: '8px', border: '1px solid var(--gray-200)', 
                  padding: '12px 16px', fontSize: '14px', background: 'var(--white)',
                  outline: 'none', transition: 'box-shadow 0.2s', width: '100%'
                }}
                value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required 
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', color: 'var(--gray-700)', marginBottom: '8px', fontWeight: 'bold' }}>Email Address</label>
              <input type="email" 
                style={{ 
                  borderRadius: '8px', border: '1px solid var(--gray-200)', 
                  padding: '12px 16px', fontSize: '14px', background: 'var(--white)',
                  outline: 'none', transition: 'box-shadow 0.2s', width: '100%'
                }}
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '13px', color: 'var(--gray-700)', marginBottom: '8px', fontWeight: 'bold' }}>Phone Number</label>
              <input type="text" 
                style={{ 
                  borderRadius: '8px', border: '1px solid var(--gray-200)', 
                  padding: '12px 16px', fontSize: '14px', background: 'var(--white)',
                  outline: 'none', transition: 'box-shadow 0.2s', width: '100%'
                }}
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '40px' }}>
            <label style={{ fontSize: '13px', color: 'var(--gray-700)', marginBottom: '8px', fontWeight: 'bold' }}>Location</label>
            <input type="text" 
              style={{ 
                borderRadius: '8px', border: '1px solid var(--gray-200)', 
                padding: '12px 16px', fontSize: '14px', background: 'var(--white)',
                outline: 'none', transition: 'box-shadow 0.2s', width: '100%'
              }}
              value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="e.g. New York, USA" 
            />
          </div>

          {/* Centered Save Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ 
              padding: '12px 40px', borderRadius: '30px', fontWeight: 600, 
              fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 4px 14px var(--shadow-color)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              opacity: loading ? 0.7 : 1
            }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

        </div>
      </form>
      </div>
      </div>
    </div>
  )
}
