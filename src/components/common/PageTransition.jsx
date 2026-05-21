import { useLocation } from 'react-router-dom'
import { useRef, useEffect } from 'react'

/**
 * Wraps page content with a smooth slide-up + fade entrance.
 * Uses the pathname as a key so each navigation re-triggers the animation.
 */
const PageTransition = ({ children }) => {
  const { pathname } = useLocation()
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Reset and replay animation on route change
    el.style.animation = 'none'
    // Force reflow
    void el.offsetHeight
    el.style.animation = ''
  }, [pathname])

  return (
    <div
      ref={ref}
      key={pathname}
      className="page-enter"
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </div>
  )
}

export default PageTransition
