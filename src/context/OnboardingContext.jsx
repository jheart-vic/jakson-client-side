/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const OnboardingContext = createContext(null)

const STORAGE_KEY = 'luminos_onboarding_v1'

const defaultState = {
  welcomeSeen:   false,
  tourCompleted: false,
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState
  } catch {
    return defaultState
  }
}

function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

export const OnboardingProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [state,    setState]    = useState(loadState)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showTour,    setShowTour]    = useState(false)
  const [tourStep,    setTourStep]    = useState(0)

  // Show welcome modal once — only for new users who haven't seen it
  useEffect(() => {
    if (isAuthenticated && !state.welcomeSeen) {
      const t = setTimeout(() => setShowWelcome(true), 800)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated, state.welcomeSeen])

  const patch = useCallback((updates) => {
    setState(prev => {
      const next = { ...prev, ...updates }
      saveState(next)
      return next
    })
  }, [])

  // ── Welcome modal ──────────────────────────────────────
  const dismissWelcome = useCallback(() => {
    setShowWelcome(false)
    patch({ welcomeSeen: true })
  }, [patch])

  const startTour = useCallback(() => {
    setShowWelcome(false)
    patch({ welcomeSeen: true })
    navigate('/main/dashboard')
    setTourStep(0)
    setTimeout(() => setShowTour(true), 400)
  }, [patch, navigate])

  // ── Tour ───────────────────────────────────────────────
  const nextStep = useCallback((total) => {
    setTourStep(s => {
      if (s + 1 >= total) {
        setShowTour(false)
        patch({ tourCompleted: true })
        return 0
      }
      return s + 1
    })
  }, [patch])

  const prevStep = useCallback(() => setTourStep(s => Math.max(0, s - 1)), [])

  const skipTour = useCallback(() => {
    setShowTour(false)
    patch({ tourCompleted: true })
  }, [patch])

  return (
    <OnboardingContext.Provider value={{
      showWelcome, dismissWelcome, startTour,
      showTour, tourStep, nextStep, prevStep, skipTour,
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used inside <OnboardingProvider>')
  return ctx
}