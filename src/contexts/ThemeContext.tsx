'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Check if current time is between 17:00 (5 PM) and 05:00 (5 AM)
const shouldUseDarkMode = (): boolean => {
  const now = new Date()
  const hour = now.getHours()
  // From 17:00 (5 PM) to 23:59 or from 00:00 to 05:00 (5 AM)
  return hour >= 17 || hour < 5
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)
  const [autoDarkMode, setAutoDarkMode] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') as Theme
    const savedAutoDark = localStorage.getItem('autoDarkMode') === 'true'
    
    if (savedAutoDark) {
      // Auto dark mode is enabled
      setAutoDarkMode(true)
      const shouldDark = shouldUseDarkMode()
      setTheme(shouldDark ? 'dark' : 'light')
    } else if (savedTheme) {
      // Manual theme preference
      setTheme(savedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(prefersDark ? 'dark' : 'light')
    }
    setMounted(true)
  }, [])

  // Auto dark mode check every minute
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    const checkAutoDark = () => {
      const savedAutoDark = localStorage.getItem('autoDarkMode') === 'true'
      if (savedAutoDark) {
        const shouldDark = shouldUseDarkMode()
        setTheme(shouldDark ? 'dark' : 'light')
      }
    }

    // Check immediately
    checkAutoDark()

    // Check every minute
    const interval = setInterval(checkAutoDark, 60000)

    return () => clearInterval(interval)
  }, [mounted])

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedAutoDark = localStorage.getItem('autoDarkMode') === 'true'
      
      if (!savedAutoDark) {
        // Only save manual theme if auto dark mode is disabled
        localStorage.setItem('theme', theme)
      }
      
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(theme)
    }
  }, [theme, mounted])

  // Enable auto dark mode on mount if not already set
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      const savedAutoDark = localStorage.getItem('autoDarkMode')
      if (savedAutoDark === null) {
        // First time - enable auto dark mode
        localStorage.setItem('autoDarkMode', 'true')
        setAutoDarkMode(true)
        const shouldDark = shouldUseDarkMode()
        setTheme(shouldDark ? 'dark' : 'light')
      }
    }
  }, [mounted])

  const toggleTheme = () => {
    // Disable auto dark mode when user manually toggles
    localStorage.setItem('autoDarkMode', 'false')
    setAutoDarkMode(false)
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  // Always render children, but with default theme until mounted
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}