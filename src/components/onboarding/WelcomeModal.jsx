import { useOnboarding } from '../../context/OnboardingContext'
import { useAuth } from '../../context/AuthContext'
import { ArrowRight, X, Zap, TrendingUp, Users, Shield } from 'lucide-react'

const features = [
  { icon: TrendingUp, color: '#10b981', bg: '#ecfdf5', label: 'Smart Investing',  desc: 'Grow your capital with solar-backed plans'      },
  { icon: Users,      color: '#8b5cf6', bg: '#ede9fe', label: 'Team Rewards',     desc: 'Earn 8% on every referral investment'             },
  { icon: Zap,        color: '#f59e0b', bg: '#fffbeb', label: 'Daily Check-ins',  desc: 'Claim bonuses every day just by showing up'      },
  { icon: Shield,     color: '#1a9fd4', bg: '#e0f4fc', label: 'Secure Platform',  desc: 'Bank-grade security on all your transactions'    },
]

const WelcomeModal = () => {
  const { showWelcome, dismissWelcome, startTour } = useOnboarding()
  const { user } = useAuth()

  if (!showWelcome) return null

  const firstName = user?.name?.split(' ')[0] || 'there'
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4"
      style={{ animation: 'backdropIn 0.3s ease both' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(10,12,18,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={dismissWelcome}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden"
        style={{
          animation: 'modalIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both',
          background: 'linear-gradient(145deg, rgba(30,25,20,0.97) 0%, rgba(20,15,10,0.99) 100%)',
          border: '1px solid rgba(198,123,44,0.25)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(198,123,44,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Close */}
        <button
          onClick={dismissWelcome}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center
                     text-white/40 hover:text-white/80 hover:bg-white/10 transition-all duration-150"
        >
          <X size={16} />
        </button>

        {/* Glow orb */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(198,123,44,0.15) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(26,159,212,0.1) 0%, transparent 70%)' }}
        />

        <div className="relative p-6 pt-8">
          {/* Sun logo */}
          <div className="flex justify-center mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(198,123,44,0.3), rgba(198,123,44,0.1))',
                border: '1px solid rgba(198,123,44,0.4)',
                boxShadow: '0 0 32px rgba(198,123,44,0.2)',
              }}
            >
              <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 8px rgba(198,123,44,0.6))' }}>☀️</span>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h2 className="text-white text-xl font-extrabold mb-1 tracking-tight">
              Welcome, {firstName}! 👋
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              You're now part of <span className="text-primary font-semibold">Luminos Energy</span> —
              a solar-powered investment platform designed to grow your wealth.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {features.map(({ icon: Icon, color, bg, label, desc }) => (
              <div
                key={label}
                className="rounded-2xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: bg + '20', border: `1px solid ${color}30` }}
                >
                  <Icon size={15} style={{ color }} strokeWidth={2.2} />
                </div>
                <p className="text-white text-xs font-bold leading-tight mb-0.5">{label}</p>
                <p className="text-white/40 text-[10px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Setup time */}
          <div
            className="flex items-center gap-2 rounded-2xl px-3 py-2 mb-5"
            style={{ background: 'rgba(198,123,44,0.08)', border: '1px solid rgba(198,123,44,0.15)' }}
          >
            <span className="text-sm">⚡</span>
            <p className="text-primary text-xs font-semibold">
              Quick 2-minute tour to get you started
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-2.5">
            <button
              onClick={isDesktop ? startTour : dismissWelcome}
              className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2
                         text-white transition-all duration-200 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #C67B2C, #A25F1F)',
                boxShadow: '0 4px 20px rgba(198,123,44,0.4)',
              }}
            >
              {isDesktop ? <>Start Quick Tour <ArrowRight size={16} /></> : 'Get Started 🚀'}
            </button>
            <button
              onClick={dismissWelcome}
              className="w-full h-10 rounded-2xl font-semibold text-sm text-white/40
                         hover:text-white/70 hover:bg-white/5 transition-all duration-150"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeModal