import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart2, History, Headphones,
  ArrowDownCircle, ArrowUpCircle, Landmark,
  Lock, KeyRound, Smartphone, LogOut, Eye, EyeOff, Wallet
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fmtUSD, fmtNGN, toNGN } from '../../utils/currency'
import { usePublicSettings } from '../../hooks/usePublicSettings'
import Modal from '../../components/common/Modal'

const Account = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showBalance, setShowBalance] = useState(false)
  const [modal, setModal] = useState(null)

  const { usd_to_ngn_rate } = usePublicSettings()
  const safeRate = usd_to_ngn_rate ?? 1560

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const GRID = [
    { icon: BarChart2,       label: 'My Invests',           path: '/main/invest-log',          color: '#1a9fd4', bg: '#e0f4fc' },
    { icon: History,         label: 'Account History',       path: '/main/funding',             color: '#8b5cf6', bg: '#ede9fe' },
    { icon: Headphones,      label: 'Online Service',        path: null, action: 'support',     color: '#10b981', bg: '#ecfdf5' },
    { icon: ArrowDownCircle, label: 'Recharge Record',       path: '/main/deposit/log',         color: '#06b6d4', bg: '#ecfeff' },
    { icon: ArrowUpCircle,   label: 'Withdrawal Record',     path: '/main/withdraw/log',        color: '#f43f5e', bg: '#fff1f2' },
    { icon: Landmark,        label: 'Withdrawal Account',    path: '/main/bank/accounts',       color: '#d97706', bg: '#fffbeb' },
    { icon: Landmark,        label: 'Wealth Funds',          path: '/main/wealth-fund',         color: '#b8860b', bg: '#fff8e7' },
    { icon: Wallet,          label: 'Salary',                path: null, action: 'salary',      color: '#059669', bg: '#ecfdf5' },
    { icon: Lock,            label: 'Modify Login Password', path: '/main/change-password',     color: '#0284c7', bg: '#f0f9ff' },
    { icon: KeyRound,        label: 'Modify Withdraw PIN',   path: '/main/change-withdraw-pin', color: '#0f766e', bg: '#f0fdfa' },
    { icon: Smartphone,      label: 'Download App',          path: null, action: 'app',         color: '#4f46e5', bg: '#eef2ff' },
    { icon: LogOut,          label: 'Log out',               path: null, action: 'logout',      color: '#ef4444', bg: '#fef2f2' },
  ]

  const handleTap = (item) => {
    if (item.path)                 return navigate(item.path)
    if (item.action === 'logout')  return handleLogout()
    if (item.action === 'support') return setModal('support')
    if (item.action === 'app')     return setModal('app')
    if (item.action === 'salary')  return setModal('salary')
  }

  const maskedBalance = () => showBalance ? fmtUSD(user?.balance || 0) : '*****'
  const maskedNGN     = () => showBalance ? fmtNGN(toNGN(user?.balance || 0, safeRate)) : '*****'

  // ── Display helpers ──────────────────────────────────────────────────────
  const primaryName = user?.fullName || user?.userName || user?.phone

  const secondaryLine = (user?.fullName || user?.userName)
    ? (user.userName ? `@${user.userName}` : user.phone)
    : null

  const avatarInitials = user?.initials || null

  return (
    <div className="min-h-dvh pb-24">

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}
        className="px-4 pt-12 pb-16">
        <div className="flex items-center gap-3">

          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 relative border border-white/30">
            <img src="/logo.jpeg" alt="Luminos Energy" className="absolute inset-0 w-full h-full object-cover" />
            {avatarInitials && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-white text-xl font-extrabold leading-none">{avatarInitials}</span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-white font-extrabold text-base leading-tight truncate">
              {primaryName}
            </p>

            {secondaryLine && (
              <p className="text-white/65 text-xs mt-0.5 truncate">{secondaryLine}</p>
            )}

            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold mt-1">
              VIP{user?.vipLevel ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* ── Balance card ── */}
      <div className="px-4 -mt-8">
        <div className="card card-p shadow-float animate-slide-up">
          <p className="text-xs text-primary font-medium uppercase tracking-wide">Funding Account</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-bold text-primary">{maskedBalance()}</p>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-primary hover:text-primary-dark transition-colors"
            >
              {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-primary mt-0.5 mb-4">
            {showBalance ? `≈ ${maskedNGN()}` : maskedNGN()}
          </p>
          <div className="flex gap-2.5">
            <button onClick={() => navigate('/main/deposit')}
              className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xl
                         shadow-[0_4px_12px_rgba(26,159,212,0.3)] active:scale-95 transition-transform">
              Recharge
            </button>
            <button onClick={() => navigate('/main/withdraw')}
              className="flex-1 py-2.5 border-2 border-primary text-primary text-xs font-bold rounded-xl
                         active:scale-95 transition-transform">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* ── Actions grid ── */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-3">
          {GRID.map((item) => (
            <button
              key={item.label}
              onClick={() => handleTap(item)}
              className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl
                         bg-primary-deep/10 backdrop-blur-sm border border-primary/20
                         active:scale-95 transition-all hover:bg-primary-deep/20"
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/20">
                <item.icon size={16} style={{ color: item.color }} strokeWidth={2} />
              </div>
              <p className="text-[10px] font-bold text-primary text-center leading-tight">
                {item.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Support Modal */}
      <Modal
        isOpen={modal === 'support'}
        onClose={() => setModal(null)}
        title="Contact Support"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto">
            <Headphones size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              For support, please contact us on Telegram.
            </p>
          </div>
          <a
            href='https://t.me/Cs_luminos_Energy'
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <button className="btn btn-primary rounded-2xl h-12 text-sm w-full">
              🚀 Join Telegram Support
            </button>
          </a>
          <button
            onClick={() => setModal(null)}
            className="text-primary font-bold text-sm"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* App Modal */}
      <Modal
        isOpen={modal === 'app'}
        onClose={() => setModal(null)}
        title="Download App"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto">
            <Smartphone size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              The mobile app is coming soon! Stay tuned for updates.
            </p>
          </div>
          <button
            onClick={() => setModal(null)}
            className="btn btn-primary rounded-2xl h-12 text-sm w-full"
          >
            Got it
          </button>
        </div>
      </Modal>

      {/* Salary Modal */}
      <Modal
        isOpen={modal === 'salary'}
        onClose={() => setModal(null)}
        title="Salary"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-success-light flex items-center justify-center mx-auto">
            <Wallet size={28} className="text-success" />
          </div>
          <div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Salary feature is coming soon. We're working hard to bring you this feature!
            </p>
          </div>
          <button
            onClick={() => setModal(null)}
            className="btn btn-primary rounded-2xl h-12 text-sm w-full"
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Account