import { useState } from 'react'
import { CheckCircle2, Circle, ChevronUp, ChevronDown, X, RotateCcw } from 'lucide-react'
import { useOnboarding } from '../../context/OnboardingContext'

const OnboardingChecklist = () => {
  const {
    showChecklist, setShowChecklist,
    checklistItems, checklistDone, checklistTotal,
    replayTour,
  } = useOnboarding()

  const [collapsed, setCollapsed] = useState(false)

  if (!showChecklist) return null

  const pct     = Math.round((checklistDone / checklistTotal) * 100)
  const allDone = checklistDone === checklistTotal

  return (
    <div
      className="fixed bottom-24 right-4 z-[90] w-64"
      style={{ animation: 'slideInRight 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(25,20,12,0.97), rgba(15,12,6,0.99))',
          border:     '1px solid rgba(198,123,44,0.25)',
          boxShadow:  '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(198,123,44,0.08)',
        }}
      >
        {/* Progress accent bar */}
        <div
          className="h-0.5"
          style={{
            background: `linear-gradient(90deg, #C67B2C ${pct}%, rgba(198,123,44,0.15) ${pct}%)`,
            transition: 'background 600ms ease',
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
              style={{
                background: 'rgba(198,123,44,0.15)',
                border: '1px solid rgba(198,123,44,0.25)',
              }}
            >
              {allDone ? '🏆' : '🎯'}
            </div>
            <div>
              <p className="text-white text-xs font-extrabold leading-tight">Getting Started</p>
              <p className="text-white/40 text-[10px]">{checklistDone}/{checklistTotal} complete</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(c => !c)}
              className="w-6 h-6 rounded-lg flex items-center justify-center
                         text-white/30 hover:text-white/60 hover:bg-white/8 transition-all"
            >
              {collapsed ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <button
              onClick={() => setShowChecklist(false)}
              className="w-6 h-6 rounded-lg flex items-center justify-center
                         text-white/30 hover:text-white/60 hover:bg-white/8 transition-all"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width:      `${pct}%`,
                background: 'linear-gradient(90deg, #C67B2C, #D48C42)',
                boxShadow:  pct > 0 ? '0 0 8px rgba(198,123,44,0.5)' : 'none',
                transition: 'width 700ms cubic-bezier(0.25,0.46,0.45,0.94)',
              }}
            />
          </div>
          <p
            className="text-[10px] mt-1 text-right font-bold"
            style={{ color: '#C67B2C' }}
          >
            {pct}%
          </p>
        </div>

        {/* Items */}
        {!collapsed && (
          <div className="px-4 pb-4 space-y-2.5">
            {checklistItems.map(({ key, label }, idx) => {
              // For now these are all shown as pending — they'll be wired up
              // when actions throughout the app call markChecklist(key)
              const done = false
              return (
                <div
                  key={key}
                  className="flex items-center gap-2.5"
                  style={{ animation: `fadeIn 0.25s ease ${idx * 0.05}s both` }}
                >
                  {done
                    ? <CheckCircle2 size={15} style={{ color: '#C67B2C', flexShrink: 0 }} />
                    : <Circle size={15} style={{ color: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
                  }
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      color: done ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.8)',
                      textDecoration: done ? 'line-through' : 'none',
                      lineHeight: 1.35,
                    }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}

            {/* Replay tour button */}
            <button
              onClick={replayTour}
              className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl py-2
                         text-xs font-semibold transition-all duration-150 active:scale-[0.97]"
              style={{
                color:      'rgba(198,123,44,0.8)',
                background: 'rgba(198,123,44,0.08)',
                border:     '1px solid rgba(198,123,44,0.15)',
              }}
            >
              <RotateCcw size={12} /> Replay Tour
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default OnboardingChecklist
