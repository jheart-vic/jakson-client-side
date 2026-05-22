import { useEffect, useState, useCallback } from 'react'
import { useOnboarding } from '../../context/OnboardingContext'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

// ── Tour steps ────────────────────────────────────────────────────────────
// Each step has a `targets` array — first selector found in the DOM wins.
// This means the same step works on desktop (sidebar) and mobile (bottom-nav).
// eslint-disable-next-line react-refresh/only-export-components
export const TOUR_STEPS = [
  {
    targets:   ['[data-tour="balance-card"]'],
    title:     '💰 Your Funding Account',
    desc:      'This shows your live balance, today\'s earnings, and total returns. Tap the eye icon to show or hide amounts.',
    placement: 'bottom',
  },
  {
    targets:   ['[data-tour="quick-actions"]'],
    title:     '⚡ Quick Actions',
    desc:      'Recharge, withdraw, redeem rewards, check in daily, invest, and manage your team — all in one tap.',
    placement: 'bottom',
  },
  {
    // Desktop: Dashboard sidebar link. Mobile: Dashboard bottom-nav button.
    targets:   ['[data-tour="nav-dashboard"]'],
    title:     '🏠 Dashboard',
    desc:      'This is your home base. Return here anytime to check your balance, earnings, and daily activity.',
    placement: 'right',
  },
  {
    // Desktop: Invite & Earn sidebar link. Mobile: invite banner on dashboard.
    targets:   ['[data-tour="nav-invite"]', '[data-tour="invite-banner"]'],
    title:     '🎁 Invite & Earn',
    desc:      'Share your referral link and earn 3% on every investment your friends make. Find it here anytime.',
    placement: 'right',
  },
  {
    // Desktop: Team sidebar link. Mobile: Team bottom-nav button.
    targets:   ['[data-tour="nav-team"]'],
    title:     '👥 Your Team',
    desc:      'Track everyone you\'ve invited, see their activity, and watch your referral earnings grow.',
    placement: 'right',
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────
function getRect(targets) {
  for (const selector of targets) {
    try {
      const el = document.querySelector(selector)
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height }
    } catch { continue }
  }
  return null
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

const PAD = 10

// ── TourOverlay ───────────────────────────────────────────────────────────
const TourOverlay = () => {
  const { showTour, tourStep, nextStep, prevStep, skipTour } = useOnboarding()
  const [rect,    setRect]    = useState(null)
  const [visible, setVisible] = useState(false)

  // Tour is desktop-only — sidebar targets don't exist on mobile
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  const steps = TOUR_STEPS
  const step  = steps[tourStep]

  const measure = useCallback(() => {
    if (!step) return
    setRect(getRect(step.targets))
  }, [step])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!showTour) { setVisible(false); return }
    setVisible(false)
    const t = setTimeout(() => { measure(); setVisible(true) }, 150)
    return () => clearTimeout(t)
  }, [showTour, tourStep, measure])

  useEffect(() => {
    if (!showTour) return
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [showTour, measure])

  if (!showTour || !isDesktop) return null

  const total = steps.length
  const vw    = window.innerWidth
  const vh    = window.innerHeight

  const spotlight = rect
    ? { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }
    : { top: vh / 2 - 60, left: vw / 2 - 120, width: 240, height: 120 }

  const TOOLTIP_W = Math.min(300, vw - 32)
  const TOOLTIP_H = 190

  // Smart placement: 'right' for sidebar items (desktop), falls back to 'bottom'/'top' on mobile
  const placement = step.placement
  let tipTop, tipLeft

  const hasRoomRight = rect && spotlight.left + spotlight.width + TOOLTIP_W + 20 <= vw

  if (placement === 'right' && hasRoomRight) {
    tipLeft = spotlight.left + spotlight.width + 16
    tipTop  = clamp(spotlight.top + spotlight.height / 2 - TOOLTIP_H / 2, 12, vh - TOOLTIP_H - 12)
  } else if (placement === 'bottom' || (placement === 'right' && !hasRoomRight)) {
    tipTop  = spotlight.top + spotlight.height + 16
    tipLeft = clamp(spotlight.left + spotlight.width / 2 - TOOLTIP_W / 2, 12, vw - TOOLTIP_W - 12)
    if (tipTop + TOOLTIP_H > vh - 16) {
      tipTop = spotlight.top - TOOLTIP_H - 16
    }
  } else {
    tipTop  = spotlight.top - TOOLTIP_H - 16
    tipLeft = clamp(spotlight.left + spotlight.width / 2 - TOOLTIP_W / 2, 12, vw - TOOLTIP_W - 12)
    if (tipTop < 12) tipTop = spotlight.top + spotlight.height + 16
  }

  tipTop  = clamp(tipTop,  12, vh - TOOLTIP_H - 12)
  tipLeft = clamp(tipLeft, 12, vw - TOOLTIP_W  - 12)

  return (
    <div className="fixed inset-0 z-150" style={{ pointerEvents: 'all' }}>

      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full"
        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.22s ease' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={spotlight.left} y={spotlight.top}
              width={spotlight.width} height={spotlight.height}
              rx={12} fill="black"
              style={{ transition: 'all 0.28s cubic-bezier(0,0,0.2,1)' }}
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.65)" mask="url(#spotlight-mask)" />
      </svg>

      {/* Amber border around spotlight target */}
      {visible && (
        <div className="absolute pointer-events-none"
          style={{
            top: spotlight.top, left: spotlight.left,
            width: spotlight.width, height: spotlight.height,
            borderRadius: 12,
            boxShadow: '0 0 0 2px #C67B2C, 0 0 18px rgba(198,123,44,0.3)',
            transition: 'all 0.28s cubic-bezier(0,0,0.2,1)',
          }}
        />
      )}

      {/* Tooltip card */}
      {visible && (
        <div className="absolute"
          style={{ top: tipTop, left: tipLeft, width: TOOLTIP_W, animation: 'scaleIn 0.18s cubic-bezier(0,0,0.2,1) both' }}>
          <div className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(160deg,#1E1610,#120E08)',
              border: '1px solid rgba(198,123,44,0.28)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}>
            {/* Top accent line */}
            <div className="h-px w-full" style={{ background: 'linear-gradient(90deg,transparent,#C67B2C,transparent)' }} />

            <div className="p-4">
              {/* Progress dots + close */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  {steps.map((_, i) => (
                    <div key={i} className="rounded-full transition-all duration-200"
                      style={{
                        width: i === tourStep ? 18 : 6,
                        height: 6,
                        background: i === tourStep ? '#C67B2C' : i < tourStep ? 'rgba(198,123,44,0.45)' : 'rgba(198,123,44,0.18)',
                      }}
                    />
                  ))}
                </div>
                <button onClick={skipTour}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                  <X size={12} />
                </button>
              </div>

              {/* Step label */}
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#C67B2C' }}>
                Step {tourStep + 1} of {total}
              </p>

              {/* Content */}
              <h3 className="text-sm font-extrabold mb-1.5 leading-tight" style={{ color: 'white' }}>{step.title}</h3>
              <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.52)' }}>{step.desc}</p>

              {/* Nav buttons */}
              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <button onClick={prevStep}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}
                <button
                  onClick={() => nextStep(total)}
                  className="flex-1 h-9 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 3px 12px rgba(198,123,44,0.35)' }}
                >
                  {tourStep === total - 1
                    ? 'Got it! 🎉'
                    : <>Next <ChevronRight size={14} /></>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clicking backdrop skips tour */}
      <div className="absolute inset-0 -z-10" onClick={skipTour} />
    </div>
  )
}

export default TourOverlay