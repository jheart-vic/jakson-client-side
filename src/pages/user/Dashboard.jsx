import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  QrCode, ArrowDownCircle, ArrowUpCircle,
  Gift, Calendar, BarChart2, Users,
  ChevronRight, Copy, Megaphone,
  ShieldAlert, Eye, EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { getBalance } from '../../api/wallet'
import { redeemCode, dailyCheckin } from '../../api/rewards'
import { fmtUSD, fmtNGN } from '../../utils/currency'
import Modal from '../../components/common/Modal'

// ── Banners (unchanged) ────────────────────────────────────
const BANNERS = [
  {
    id: 1,
    tag: '✦ Latest',
    title: 'TOPCon Technology',
    sub: 'Powering the Next Gen of Solar',
    cta: 'Invest Now',
    path: '/main/invest',
    gradient: 'linear-gradient(135deg,#0e6a8f 0%,#1a9fd4 60%,#38bdf8 100%)',
    emoji: '⚡',
  },
  {
    id: 2,
    tag: '✦ New Product',
    title: 'Helia NXT Bifacial',
    sub: '$7 · 35 days · $0.40/day',
    cta: 'View Product',
    path: '/main/invest',
    gradient: 'linear-gradient(135deg,#065f46 0%,#10b981 60%,#34d399 100%)',
    emoji: '🌿',
  },
  {
    id: 3,
    tag: '✦ Earn More',
    title: 'Refer & Earn 8%',
    sub: 'Invite friends and earn on every investment they make',
    cta: 'Invite Now',
    path: '/main/team',
    gradient: 'linear-gradient(135deg,#7c2d12 0%,#f97316 60%,#fb923c 100%)',
    emoji: '🎁',
  },
]

// ── Quick actions (updated with distinct background per button) ──
const ACTIONS = [
  { label: 'Recharge',  icon: ArrowDownCircle, color: '#1a9fd4', bg: '#e0f4fc', path: '/main/deposit'  },
  { label: 'Withdraw',  icon: ArrowUpCircle,   color: '#f97316', bg: '#fff4ed', path: '/main/withdraw' },
  { label: 'Reward',    icon: Gift,            color: '#10b981', bg: '#ecfdf5', modal: 'reward'        },
  { label: 'Check-in',  icon: Calendar,        color: '#f59e0b', bg: '#fffbeb', modal: 'checkin'       },
  { label: 'Invest',    icon: BarChart2,       color: '#8b5cf6', bg: '#ede9fe', path: '/main/invest'   },
  { label: 'Team',      icon: Users,           color: '#ec4899', bg: '#fdf2f8', path: '/main/team'     },
]

// ── News (unchanged) ───────────────────────────────────────
const NEWS = [
  {
    id: 1,
    icon: ShieldAlert,
    iconColor: '#f97316',
    iconBg: '#fff4ed',
    title: 'Beware of Fraud!',
    body: 'Luminos Energy will never ask for your password or PIN via call or message. Stay safe.',
    time: 'Recently',
  },
  {
    id: 2,
    icon: Megaphone,
    iconColor: '#1a9fd4',
    iconBg: '#e0f4fc',
    title: '"Luminos Energy" Operating Model',
    body: 'Why choose Luminos Energy? Proven market experience, global solar manufacturing excellence and financial stability.',
    time: 'Recently',
  },
]

// ── Carousel (unchanged) ───────────────────────────────────
const BannerCarousel = ({ banners, onCta }) => {
  const [active, setActive] = useState(0)
  const timerRef = useRef(null)

  const next = useCallback(() => setActive(a => (a + 1) % banners.length), [banners.length])

  useEffect(() => {
    timerRef.current = setInterval(next, 3500)
    return () => clearInterval(timerRef.current)
  }, [next])

  const go = (i) => {
    clearInterval(timerRef.current)
    setActive(i)
    timerRef.current = setInterval(next, 3500)
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="relative" style={{ height: 148 }}>
        {banners.map((b, i) => (
          <div
            key={b.id}
            className="absolute inset-0 transition-all duration-500"
            style={{
              background: b.gradient,
              opacity: i === active ? 1 : 0,
              transform: `translateX(${(i - active) * 100}%)`,
            }}
          >
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute right-4 bottom-4 text-5xl select-none">{b.emoji}</div>
            <div className="relative p-5 h-full flex flex-col justify-between">
              <div>
                <span className="text-yellow-300 text-[10px] font-bold uppercase tracking-widest">{b.tag}</span>
                <p className="text-white text-lg font-extrabold mt-1 leading-tight">{b.title}</p>
                <p className="text-white/70 text-xs mt-0.5">{b.sub}</p>
              </div>
              <button
                onClick={() => onCta(b.path)}
                className="self-start bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full active:scale-95 transition-transform flex items-center gap-1"
              >
                {b.cta} <ChevronRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [showBalance, setShowBalance] = useState(false)

  const [bal, setBal] = useState({ balance: 0, todayEarnings: 0, yesterdayEarnings: 0, totalEarnings: 0 })
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [rewardCode, setRewardCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)

  const loadBal = useCallback(async () => {
    try { const { data } = await getBalance(); setBal(data) }
    catch { /* handled by interceptor */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    (async () => { await loadBal() })()
    let t
    if (!sessionStorage.getItem('tg_shown')) {
      t = setTimeout(() => {
        setModal('telegram')
        sessionStorage.setItem('tg_shown', '1')
      }, 900)
    }
    return () => { if (t) clearTimeout(t) }
  }, [loadBal])

  const handleAction = (a) => {
    if (a.modal) { setModal(a.modal); return }
    navigate(a.path)
  }

  const handleRedeem = async () => {
    if (!rewardCode.trim()) return toast.error('Enter a reward code')
    setRedeeming(true)
    try {
      const { data } = await redeemCode(rewardCode.trim())
      toast.success(data.message)
      setModal(null); setRewardCode(''); loadBal(); refreshUser()
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid code') }
    finally { setRedeeming(false) }
  }

  const handleCheckin = async () => {
    setCheckingIn(true)
    try {
      const { data } = await dailyCheckin()
      toast.success(`Checked in! +${fmtUSD(data.reward)} 🎉`)
      setModal(null); loadBal(); refreshUser()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Already checked in today')
      setModal(null)
    } finally { setCheckingIn(false) }
  }

  const copyInvite = () => {
    const link = `https://jaksonsolar.org/register?c=${user?.referralCode || ''}`
    navigator.clipboard.writeText(link)
      .then(() => toast.success('Invite link copied!'))
      .catch(() => toast.error('Could not copy'))
  }

  const maskedBalance = () => {
    if (showBalance) return fmtUSD(bal.balance)
    return '*****'
  }

  const maskedNGN = () => {
    if (showBalance) return fmtNGN(bal.balance * 1365)
    return '*****'
  }

  return (
    <div className="min-h-dvh bg-surface pb-24">

      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}>
        <div className="h-safe-top" />
        <div className="px-4 pt-3 pb-1 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
                <span className="text-lg leading-none">☀️</span>
              </div>
              <div>
                <p className="text-white font-extrabold text-sm leading-tight">Luminos Energy</p>
                <p className="text-surface text-[10px] font-medium">Investment Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform">
                <QrCode size={16} />
              </button>
              <button className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform">
                <span className="text-center leading-none">🇳🇬</span>
              </button>
            </div>
          </div>

          {/* Balance card with eye icon next to balance */}
          <div className="bg-white/12 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20 animate-slide-up">
            <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">
              Funding Account
            </p>

            {loading ? (
              <div className="h-8 w-28 skeleton rounded-lg bg-white/20" />
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-white text-2xl font-bold tracking-tight leading-none">
                  {maskedBalance()}
                </p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}

            <p className="text-surface text-xs mt-1 mb-3">
              {showBalance ? `≈ ${maskedNGN()}` : maskedNGN()}
            </p>

            <div className="flex gap-2.5 mb-3">
              <button onClick={() => navigate('/main/deposit')} className="flex-1 bg-white text-primary text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform">Recharge</button>
              <button onClick={() => navigate('/main/withdraw')} className="flex-1 bg-white/20 border border-white/30 text-white text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform">Withdraw</button>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t text-surface">
              {[
                { label: 'Today', val: bal.todayEarnings },
                { label: 'Yesterday', val: bal.yesterdayEarnings },
                { label: 'Total', val: bal.totalEarnings },
              ].map(({ label, val }) => (
                <div key={label} className="text-center">
                  <p className="text-white font-bold text-sm leading-none">{fmtUSD(val)}</p>
                  <p className="text-surface text-[10px] font-medium mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="px-4 mt-4 animate-slide-up delay-100">
        <div className="grid grid-cols-3 gap-3">
          {ACTIONS.map((a, i) => (
            <button
              key={a.label}
              onClick={() => handleAction(a)}
              className="flex flex-col items-center justify-center gap-2 py-3 px-2 rounded-2xl bg-white shadow-sm border border-gray-100 active:scale-95 transition-all"
              style={{ animationDelay: `${i * 0.04 + 0.12}s` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: a.bg }}>
                <a.icon size={20} style={{ color: a.color }} strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 text-center break-words max-w-full">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Banner carousel */}
      <div className="px-4 mt-4 animate-slide-up delay-150">
        <BannerCarousel banners={BANNERS} onCta={(path) => navigate(path)} />
      </div>

      {/* Company profile link */}
      <div className="px-4 mt-3 animate-slide-up delay-200">
        <button className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card active:scale-[0.99] transition-transform border border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <span className="text-lg leading-none">📢</span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-gray-800">Luminos Energy Company Profile</p>
            <p className="text-xs text-gray-400 mt-0.5">Learn about our mission & global network</p>
          </div>
          <ChevronRight size={15} className="text-gray-300" />
        </button>
      </div>

      {/* Invite banner */}
      <div className="px-4 mt-3 animate-slide-up delay-200">
        <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)' }}>
          <div className="flex items-center gap-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-2xl leading-none">🎁</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-extrabold text-sm">Invite & Earn 8%</p>
              <p className="text-white/75 text-xs mt-0.5 truncate">Code: <span className="font-bold">{user?.referralCode || '—'}</span></p>
            </div>
            <button onClick={copyInvite} className="bg-white rounded-xl px-3 py-2 flex items-center gap-1.5 text-accent text-xs font-bold active:scale-95 transition-transform shrink-0">
              <Copy size={11} /> Copy
            </button>
          </div>
        </div>
      </div>

      {/* News feed */}
      <div className="px-4 mt-4 mb-2 animate-slide-up delay-250">
        <p className="text-sm font-extrabold text-gray-700 mb-3">Announcements</p>
        <div className="space-y-3">
          {NEWS.map(n => (
            <div key={n.id} className="bg-white rounded-2xl p-4 flex gap-3 shadow-card active:scale-[0.99] transition-transform border border-gray-50">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: n.iconBg }}>
                <n.icon size={18} style={{ color: n.iconColor }} strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-gray-800 leading-tight">{n.title}</p>
                  <span className="text-[10px] text-gray-400 font-medium shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{n.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals (unchanged) */}
      <Modal isOpen={modal === 'telegram'} onClose={() => setModal(null)}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#e8f4fb] flex items-center justify-center mx-auto"><span className="text-3xl">💬</span></div>
          <div>
            <h3 className="text-gray-800 text-lg font-extrabold">Join Our Community</h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">Join the official Telegram group to participate in events and receive exclusive <strong className="text-gray-700">bonus codes</strong>.</p>
          </div>
          <a href="https://t.me/jaksonsolar" target="_blank" rel="noopener noreferrer" className="block">
            <button className="btn btn-primary rounded-2xl h-12 text-sm">🚀 Join Telegram Group</button>
          </a>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-start gap-2 text-left">
            <span className="text-orange-500 text-sm shrink-0">⚠️</span>
            <p className="text-orange-600 text-xs font-medium">Disruptive behavior or spam will result in an immediate ban.</p>
          </div>
          <button onClick={() => setModal(null)} className="text-primary font-bold text-sm">OK, Got it</button>
        </div>
      </Modal>

      <Modal isOpen={modal === 'reward'} onClose={() => setModal(null)} title="Redeem Reward">
        <div className="space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center mx-auto"><span className="text-2xl">🎫</span></div>
          <p className="text-gray-500 text-sm text-center">Enter your exclusive bonus code to claim your reward</p>
          <input type="text" placeholder="ENTER CODE" value={rewardCode} onChange={e => setRewardCode(e.target.value.toUpperCase())} className="w-full px-4 py-4 rounded-2xl text-center text-xl font-extrabold tracking-[0.3em] border-2 border-primary bg-primary-light text-primary outline-none placeholder:text-primary/30 placeholder:font-bold" autoCapitalize="characters" />
          <div className="flex gap-3">
            <button onClick={() => { setModal(null); setRewardCode('') }} className="flex-1 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 text-sm font-bold active:scale-95 transition-transform">Cancel</button>
            <button onClick={handleRedeem} disabled={redeeming} className="flex-1 btn btn-primary rounded-2xl h-12 text-sm">
              {redeeming ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" /> : 'Redeem 🎉'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modal === 'checkin'} onClose={() => setModal(null)} title="Daily Check-in">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 rounded-full bg-warning-light flex items-center justify-center"><span className="text-4xl">🎯</span></div>
            <div className="absolute inset-0 rounded-full border-4 border-warning/30 animate-ping" />
          </div>
          <div>
            <p className="text-gray-800 font-extrabold text-base">Claim Your Daily Reward!</p>
            <p className="text-gray-500 text-sm mt-1">Check in every day to earn <strong className="text-warning">$0.01</strong> and build your streak</p>
          </div>
          {(user?.checkinStreak || 0) > 0 && (
            <div className="bg-warning-light rounded-2xl p-3 flex items-center justify-center gap-2">
              <span>🔥</span>
              <p className="text-warning font-bold text-sm">{user.checkinStreak} day streak!</p>
            </div>
          )}
          <button onClick={handleCheckin} disabled={checkingIn} className="btn btn-primary rounded-2xl h-13">
            {checkingIn ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" /> : 'Check In Now 🎉'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Dashboard