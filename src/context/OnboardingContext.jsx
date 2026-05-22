/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const OnboardingContext = createContext(null)

// ── Per-user localStorage ─────────────────────────────────────────────────
const obKey        = (user) => `luminos_ob_${user?._id || user?.phone || 'guest'}`
const loadObState  = (user) => {
  try {
    // ── New per-user key (current format) ────────────────────────────────
    const raw = localStorage.getItem(obKey(user))
    if (raw) return JSON.parse(raw)

    // ── Migration: old global key (luminos_onboarding_v1) ────────────────
    // Existing users stored their state under a shared key before per-user
    // keys were introduced. If they already saw the welcome, carry that over
    // so they don't see it again.
    const oldRaw = localStorage.getItem('luminos_onboarding_v1')
    if (oldRaw) {
      const old = JSON.parse(oldRaw)
      if (old.welcomeSeen) {
        const migrated = { welcomeSeen: true, tourCompleted: true }
        localStorage.setItem(obKey(user), JSON.stringify(migrated))
        return migrated
      }
    }

    // ── Also treat any user who has a session token as non-new ────────────
    // If the user is in localStorage (cached from a previous login) but has
    // no onboarding record, they registered before this system existed.
    // Mark them as having already seen the welcome to avoid false "new user" state.
    const cachedUser = localStorage.getItem('user')
    if (cachedUser) {
      const migrated = { welcomeSeen: true, tourCompleted: true }
      localStorage.setItem(obKey(user), JSON.stringify(migrated))
      return migrated
    }

    return {}
  } catch { return {} }
}
const saveObState  = (user, s) => {
  try { localStorage.setItem(obKey(user), JSON.stringify(s)) } catch { /* ignore */ }
}

// ── UI state reducer (one dispatch = no cascading renders) ────────────────
const INIT = { showWelcome: false, showTour: false, tourStep: 0 }

function reducer(state, action) {
  switch (action.type) {
    case 'RESET':        return INIT
    case 'SHOW_WELCOME': return { ...state, showWelcome: true  }
    case 'HIDE_WELCOME': return { ...state, showWelcome: false }
    case 'SHOW_TOUR':    return { ...state, showTour: true,  tourStep: 0 }
    case 'NEXT_STEP':    return { ...state, tourStep: state.tourStep + 1 }
    case 'PREV_STEP':    return { ...state, tourStep: Math.max(0, state.tourStep - 1) }
    case 'END_TOUR':     return { ...state, showTour: false, tourStep: 0 }
    default:             return state
  }
}

// ── Provider ──────────────────────────────────────────────────────────────
export const OnboardingProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [ui, dispatch] = useReducer(reducer, INIT)
  const loadedKeyRef   = useRef(null)

  // When user changes: load their ob-state, show welcome if unseen
  useEffect(() => {
    if (!isAuthenticated || !user) {
      dispatch({ type: 'RESET' })        // single dispatch — no cascading
      loadedKeyRef.current = null
      return
    }

    const key = obKey(user)
    if (loadedKeyRef.current === key) return   // already set up for this user
    loadedKeyRef.current = key

    // Admins never see the onboarding flow
    if (user?.role === 'admin' || user?.role === 'superadmin') return

    const saved = loadObState(user)
    if (!saved.welcomeSeen) {
      const t = setTimeout(() => dispatch({ type: 'SHOW_WELCOME' }), 800)
      return () => clearTimeout(t)
    }
  }, [isAuthenticated, user])

  // Persist a change to localStorage for the current user
  const persist = useCallback((updates) => {
    const current = loadObState(user)
    saveObState(user, { ...current, ...updates })
  }, [user])

  // ── Welcome modal ────────────────────────────────────────────────────────
  const dismissWelcome = useCallback(() => {
    dispatch({ type: 'HIDE_WELCOME' })
    persist({ welcomeSeen: true })
  }, [persist])

  const startTour = useCallback(() => {
    dispatch({ type: 'HIDE_WELCOME' })
    persist({ welcomeSeen: true })
    navigate('/main/dashboard')
    setTimeout(() => dispatch({ type: 'SHOW_TOUR' }), 400)
  }, [persist, navigate])

  // ── Tour ──────────────────────────────────────────────────────────────────
  const nextStep = useCallback((total) => {
    if (ui.tourStep + 1 >= total) {
      dispatch({ type: 'END_TOUR' })
      persist({ tourCompleted: true })
    } else {
      dispatch({ type: 'NEXT_STEP' })
    }
  }, [ui.tourStep, persist])

  const prevStep = useCallback(() => dispatch({ type: 'PREV_STEP' }), [])

  const skipTour = useCallback(() => {
    dispatch({ type: 'END_TOUR' })
    persist({ tourCompleted: true })
  }, [persist])

  return (
    <OnboardingContext.Provider value={{
      showWelcome: ui.showWelcome, dismissWelcome, startTour,
      showTour:    ui.showTour,    tourStep: ui.tourStep,
      nextStep, prevStep, skipTour,
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