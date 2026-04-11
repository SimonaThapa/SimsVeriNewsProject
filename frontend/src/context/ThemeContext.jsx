// context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export const THEMES = [
  { id: 'light', name: 'Light', icon: '☀️', color: '#1976d2' },
  { id: 'dark', name: 'Dark', icon: '🌙', color: '#0f172a' },
  { id: 'ocean', name: 'Ocean', icon: '🌊', color: '#0891b2' },
  { id: 'forest', name: 'Forest', icon: '🌲', color: '#059669' },
  { id: 'sunset', name: 'Sunset', icon: '🌅', color: '#ea580c' },
  { id: 'royal', name: 'Royal', icon: '👑', color: '#7c3aed' },
]

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored && THEMES.find(t => t.id === stored)) {
      setThemeState(stored)
      document.documentElement.setAttribute('data-theme', stored)
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  const setTheme = (newTheme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  const toggleTheme = () => {
    // Simple cycle through themes
    const currentIndex = THEMES.findIndex(t => t.id === theme)
    const nextIndex = (currentIndex + 1) % THEMES.length
    setTheme(THEMES[nextIndex].id)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
