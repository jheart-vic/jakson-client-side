import { useNavigate } from 'react-router-dom'
import {
  BarChart2, History, Headphones, Sun,
  ArrowDownCircle, ArrowUpCircle, Landmark,
  ShieldCheck, Lock, KeyRound, Smartphone, LogOut,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { fmtUSD, fmtNGN } from '../../utils/currency'

const Account = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    toast.success('Logged out successfully')
  }

  const GRID = [
    { icon: BarChart2,      label: 'My Invests',              path: '/main/invest-log',              color: '#1a9fd4', bg: '#e0f4fc' },
    { icon: History,        label: 'Account History',         path: '/main/funding',                  color: '#8b5cf6', bg: '#ede9fe' },
    { icon: Headphones,     label: 'Online Service',          path: null, action: 'support',           color: '#10b981', bg: '#ecfdf5' },
    { icon: Sun,            label: 'Solar Panel',             path: '/main/solar-panel',              color: '#f97316', bg: '#fff4ed' },
    { icon: ArrowDownCircle,label: 'Recharge Record',         path: '/main/deposit/log',              color: '#06b6d4', bg: '#ecfeff' },
    { icon: ArrowUpCircle,  label: 'Withdrawal Record',       path: '/main/withdraw/log',             color: '#f43f5e', bg: '#fff1f2' },
    { icon: Landmark,       label: 'Withdrawal Account',      path: '/main/bank/accounts',            color: '#d97706', bg: '#fffbeb' },
    { icon: ShieldCheck,    label: 'Real Name Auth',          path: null, action: 'kyc',              color: '#7c3aed', bg: '#f5f3ff' },
    { icon: Lock,           label: 'Modify Login Password',   path: '/main/change-password',          color: '#0284c7', bg: '#f0f9ff' },
    { icon: KeyRound,       label: 'Modify Withdraw PIN',     path: '/main/change-withdraw-pin',      color: '#0f766e', bg: '#f0fdfa' },
    { icon: Smartphone,     label: 'Download App',            path: null, action: 'app',              color: '#4f46e5', bg: '#eef2ff' },
    { icon: LogOut,         label: 'Log out',                 path: null, action: 'logout',           color: '#ef4444', bg: '#fef2f2' },
  ]

const handleTap = (item) => {
    if (item.path)                 return navigate(item.path)
    if (item.action === 'logout')  return handleLogout()
    if (item.action === 'support') return toast('Contact support via Telegram')
    if (item.action === 'kyc')     return toast('KYC coming soon')
    if (item.action === 'app')     return toast('App coming soon')
}


  return (
    <div className="min-h-dvh bg-surface pb-24">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0e6a8f,#1a9fd4)' }}
        className="px-4 pt-12 pb-16">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
            <span className="text-2xl">☀️</span>
          </div>
          <div>
            <p className="text-white font-extrabold text-base">{user?.phone}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold mt-1">
              VIP{user?.vipLevel ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Balance card — overlaps header */}
      <div className="px-4 -mt-8">
        <div className="card card-p shadow-float animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Funding Account</p>
              <p className="text-3xl font-extrabold text-gray-800 mt-1">{fmtUSD(user?.balance || 0)}</p>
              <p className="text-xs text-gray-400 mt-0.5">≈ {fmtNGN((user?.balance || 0) * 1365)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/main/deposit')}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl
                           shadow-[0_4px_12px_rgba(26,159,212,0.3)] active:scale-95 transition-transform">
                Recharge
              </button>
              <button onClick={() => navigate('/main/withdraw')}
                className="px-4 py-2 border-2 border-primary text-primary text-xs font-bold rounded-xl
                           active:scale-95 transition-transform">
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions grid */}
      <div className="px-4 mt-4">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-3">
            {GRID.map((item, i) => {
              const isLastRow  = i >= GRID.length - (GRID.length % 3 || 3)
              const isLastCol  = (i + 1) % 3 === 0
              return (
                <button key={item.label} onClick={() => handleTap(item)}
                  className={`flex flex-col items-center gap-2 p-4 active:bg-gray-50 transition-colors
                    ${!isLastRow ? 'border-b border-gray-50' : ''}
                    ${!isLastCol ? 'border-r border-gray-50' : ''}`}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: item.bg }}>
                    <item.icon size={18} style={{ color: item.color }} strokeWidth={2} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-600 text-center leading-tight">{item.label}</p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account
