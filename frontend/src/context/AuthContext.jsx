// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token  = localStorage.getItem('token')
    if (stored && token) {
      setUser(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user',  JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const resetPassword = async (email, new_password) => {
    const { data } = await api.post('/auth/reset-password', { email, new_password })
    return data
  }

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/users/profile', profileData)
    await refreshUser()
    return data
  }

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me')
      const updated = { ...user, ...data }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
    } catch {}
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
