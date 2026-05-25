/* eslint-disable no-useless-assignment */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    QrCode,
    ArrowDownCircle,
    ArrowUpCircle,
    Gift,
    Calendar,
    BarChart2,
    Users,
    ChevronRight,
    ChevronDown,
    Copy,
    Megaphone,
    Eye,
    EyeOff,
    Bell,
    Info,
    AlertTriangle,
    CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useOnboarding } from '../../context/OnboardingContext'
import { getBalance } from '../../api/wallet'
import { redeemCode, dailyCheckin } from '../../api/rewards'
import { fmtUSD, fmtNGN, toNGN } from '../../utils/currency'
import { usePublicSettings } from '../../hooks/usePublicSettings'
import { getAnnouncements } from '../../api/settings'
import { getUnreadCount } from '../../api/notification'
import { getWealthFunds } from '../../api/wealthFund'
import Modal from '../../components/common/Modal'
import { handleApiError } from '../../utils/errorHandler'

// ── Quick actions ──
const ACTIONS = [
    {
        label: 'Recharge',
        icon: ArrowDownCircle,
        color: '#1a9fd4',
        bg: '#e0f4fc',
        path: '/main/deposit',
    },
    {
        label: 'Withdraw',
        icon: ArrowUpCircle,
        color: '#f97316',
        bg: '#fff4ed',
        path: '/main/withdraw',
    },
    {
        label: 'Reward',
        icon: Gift,
        color: '#10b981',
        bg: '#ecfdf5',
        modal: 'reward',
    },
    {
        label: 'Check-in',
        icon: Calendar,
        color: '#f59e0b',
        bg: '#fffbeb',
        modal: 'checkin',
    },
    {
        label: 'Invest',
        icon: BarChart2,
        color: '#8b5cf6',
        bg: '#ede9fe',
        path: '/main/invest',
    },
    {
        label: 'Team',
        icon: Users,
        color: '#ec4899',
        bg: '#fdf2f8',
        path: '/main/team',
    },
]

// ── FAQ Component ──
const FAQS = [
    {
        q: 'How do I start investing?',
        a: 'Recharge your wallet, go to Invest, choose a plan that suits you, and tap Buy. Your daily income starts the next weekday.',
    },
    {
        q: 'When is daily income credited?',
        a: 'Income is queued each weekday (Mon–Fri) by midnight. You must claim it from the Invest Log before the next midnight or it is forfeited.',
    },
    {
        q: 'How do I withdraw my earnings?',
        a: 'Bind a bank account under Account → Withdrawal Account, then tap Withdraw. Processing takes 5 minutes to 48 hours.',
    },
    {
        q: 'How does the referral program work?',
        a: 'Share your invite link. You earn 8% on every first investment your direct referrals make, plus ongoing daily commission from their returns.',
    },
    {
        q: 'Is my money safe?',
        a: 'Luminos Energy is backed by real solar assets. All transactions are secured and encrypted. Withdrawals are reviewed before processing.',
    },
    {
        q: 'What are Wealth Funds?',
        a: 'Wealth Funds are long-term premium plans with a fixed maturity payout. You invest once and claim the full maturity value when it matures.',
    },
]

const FaqSection = () => {
    const [open, setOpen] = useState(null)
    return (
        <div className='px-4 mt-4 mb-2 animate-slide-up delay-300'>
            <p className='text-sm font-extrabold text-gray-700 mb-3'>
                Frequently Asked Questions
            </p>
            <div className='space-y-2'>
                {FAQS.map((faq, i) => (
                    <div
                        key={i}
                        className='bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden'
                    >
                        <button
                            onClick={() => setOpen(open === i ? null : i)}
                            className='w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50 transition-colors'
                        >
                            <span className='text-sm font-bold text-gray-800 pr-3'>
                                {faq.q}
                            </span>
                            <ChevronDown
                                size={16}
                                className='text-primary shrink-0 transition-transform duration-200'
                                style={{
                                    transform:
                                        open === i
                                            ? 'rotate(180deg)'
                                            : 'rotate(0deg)',
                                }}
                            />
                        </button>
                        {open === i && (
                            <div className='px-4 pb-4 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-3'>
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Wealth Carousel Component (replaces the old banner carousel) ──
const WealthCarousel = ({ onInvest, onRefer }) => {
    const [wealthFunds, setWealthFunds] = useState([])
    const [active, setActive] = useState(0)
    const timerRef = useRef(null)

    // Fetch wealth funds on mount
    useEffect(() => {
        const fetchFunds = async () => {
            try {
                const res = await getWealthFunds()
                let funds = res?.funds || res?.data?.funds || res || []
                setWealthFunds(funds)
            } catch (err) {
                handleApiError(err, 'Failed to load wealth funds')
                setWealthFunds([])
            }
        }
        fetchFunds()
    }, [])

    const slides = [
        ...wealthFunds.map((fund) => ({ type: 'fund', data: fund })),
        {
            type: 'refer',
            data: {
                title: 'Invite & Earn 8%',
                sub: 'Share with friends and earn on every investment they make',
            },
        },
    ]

    const next = useCallback(
        () => setActive((a) => (a + 1) % slides.length),
        [slides.length],
    )

    useEffect(() => {
        if (slides.length === 0) return
        timerRef.current = setInterval(next, 3500)
        return () => clearInterval(timerRef.current)
    }, [next, slides.length])

    const goTo = (i) => {
        clearInterval(timerRef.current)
        setActive(i)
        timerRef.current = setInterval(next, 3500)
    }

    if (slides.length === 0) return null

    const gradients = [
        'linear-gradient(135deg,#065f46 0%,#10b981 60%,#34d399 100%)',
        'linear-gradient(135deg,#0e6a8f 0%,#1a9fd4 60%,#38bdf8 100%)',
        'linear-gradient(135deg,#7c2d12 0%,#f97316 60%,#fb923c 100%)',
        'linear-gradient(135deg,#4c1d95 0%,#8b5cf6 60%,#a78bfa 100%)',
    ]

    return (
        <div className='px-4 mt-4 animate-slide-up delay-150'>
            <div
                className='relative overflow-hidden rounded-2xl'
                style={{ height: 170 }}
            >
                {slides.map((slide, i) => {
                    const isActiveSlide = i === active
                    let bgGradient = ''
                    let content = null

                    if (slide.type === 'fund') {
                        const fund = slide.data
                        bgGradient = gradients[i % gradients.length]
                        content = (
                            <>
                                <div className='absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl' />
                                <div className='absolute right-3 bottom-3 text-4xl select-none'>
                                    💰
                                </div>
                                <div className='relative p-4 h-full flex flex-col justify-between'>
                                    <div>
                                        <div className='flex justify-between items-start'>
                                            <span className='text-yellow-300 text-[10px] font-bold uppercase tracking-wider'>
                                                {fund.isActive
                                                    ? '⚡ Active'
                                                    : '🔜 Coming Soon'}
                                            </span>
                                            {fund.image && (
                                                <img
                                                    src={fund.image}
                                                    alt=''
                                                    className='w-8 h-8 rounded-full bg-white/20 object-cover'
                                                />
                                            )}
                                        </div>
                                        <p className='text-white text-base font-extrabold mt-1 leading-tight'>
                                            {fund.name}
                                        </p>
                                        <p className='text-white/70 text-[11px] mt-0.5'>
                                            ${fund.amount} · {fund.durationDays}
                                            d · Maturity ${fund.maturityAmount}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            onInvest('/main/wealth-fund')
                                        }
                                        className='self-start bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform flex items-center gap-1'
                                    >
                                        View Product <ChevronRight size={11} />
                                    </button>
                                </div>
                            </>
                        )
                    } else {
                        // Refer card
                        bgGradient = 'linear-gradient(135deg,#f97316,#fb923c)'
                        content = (
                            <>
                                <div className='absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl' />
                                <div className='absolute right-3 bottom-3 text-4xl select-none'>
                                    🎁
                                </div>
                                <div className='relative p-4 h-full flex flex-col justify-between'>
                                    <div>
                                        <span className='text-yellow-300 text-[10px] font-bold uppercase tracking-wider'>
                                            ✦ Referral
                                        </span>
                                        <p className='text-white text-base font-extrabold mt-1 leading-tight'>
                                            {slide.data.title}
                                        </p>
                                        <p className='text-white/70 text-[11px] mt-0.5'>
                                            {slide.data.sub}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onRefer()}
                                        className='self-start bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform flex items-center gap-1'
                                    >
                                        Invite Now <ChevronRight size={11} />
                                    </button>
                                </div>
                            </>
                        )
                    }

                    return (
                        <div
                            key={i}
                            className='absolute inset-0 transition-all duration-500'
                            style={{
                                background: bgGradient,
                                opacity: isActiveSlide ? 1 : 0,
                                transform: `translateX(${(i - active) * 100}%)`,
                            }}
                        >
                            {content}
                        </div>
                    )
                })}
            </div>
            {/* Dots */}
            <div className='flex justify-center gap-1.5 mt-2'>
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === active
                                ? 'w-5 bg-primary'
                                : 'w-1.5 bg-primary/30'
                        }`}
                    />
                ))}
            </div>
        </div>
    )
}

// ── Main Dashboard component ──
const Dashboard = () => {
    const navigate = useNavigate()
    const { user, refreshUser } = useAuth()
    const { showWelcome, showTour } = useOnboarding()
    const [showBalance, setShowBalance] = useState(false)

    const { usd_to_ngn_rate } = usePublicSettings()
    const safeRate = usd_to_ngn_rate ?? 1560

    const [bal, setBal] = useState({
        balance: 0,
        todayEarnings: 0,
        yesterdayEarnings: 0,
        totalEarnings: 0,
    })
    const [announcements, setAnnouncements] = useState([])
    const [unreadNotifCount, setUnreadNotifCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null)
    const [rewardCode, setRewardCode] = useState('')
    const [redeeming, setRedeeming] = useState(false)
    const [checkingIn, setCheckingIn] = useState(false)

    const loadBal = useCallback(async () => {
        try {
            const { data } = await getBalance()
            setBal(data)
        } catch {
            /* handled by interceptor */
        } finally {
            setLoading(false)
        }
    }, [])

    const loadAnnouncements = useCallback(async () => {
        try {
            const { data } = await getAnnouncements()
            setAnnouncements((data?.notifications || []).slice(0, 3))
        } catch {
            /* silent */
        }
    }, [])

    const loadUnreadCount = useCallback(async () => {
        try {
            const { data } = await getUnreadCount()
            setUnreadNotifCount(data?.count ?? 0)
        } catch {
            /* silent */
        }
    }, [])

    useEffect(() => {
        ;(async () => {
            await Promise.all([
                loadBal(),
                loadAnnouncements(),
                loadUnreadCount(),
            ])
        })()
    }, [loadBal, loadAnnouncements, loadUnreadCount])

    // Telegram modal
    useEffect(() => {
        if (showWelcome) return
        if (showTour) return

        const t = setTimeout(() => {
            setModal('telegram')
        }, 900)
        return () => clearTimeout(t)
    }, [showWelcome, showTour])

    const handleAction = (a) => {
        if (a.modal) {
            setModal(a.modal)
            return
        }
        navigate(a.path)
    }

    const handleRedeem = async () => {
        if (!rewardCode.trim()) return toast.error('Enter a reward code')
        setRedeeming(true)
        try {
            const { data } = await redeemCode(rewardCode.trim())
            toast.success(data.message)
            setModal(null)
            setRewardCode('')
            loadBal()
            refreshUser()
        } catch (err) {
            handleApiError(err, 'Invalid code')
        } finally {
            setRedeeming(false)
        }
    }

    const handleCheckin = async () => {
        setCheckingIn(true)
        try {
            const { data } = await dailyCheckin()
            toast.success(`Checked in! +${fmtUSD(data.reward)} 🎉`)
            setModal(null)
            loadBal()
            refreshUser()
        } catch (err) {
            handleApiError(err, 'Already checked in today')
            setModal(null)
        } finally {
            setCheckingIn(false)
        }
    }

    const copyInvite = () => {
        const link = `https://jaksonsolar.org/register?c=${user?.referralCode || ''}`
        navigator.clipboard
            .writeText(link)
            .then(() => toast.success('Invite link copied!'))
            .catch(() => toast.error('Could not copy'))
    }

    const maskedBalance = () => {
        if (showBalance) return fmtUSD(bal.balance)
        return '*****'
    }

    const maskedNGN = () => {
        if (showBalance) return fmtNGN(toNGN(bal.balance, safeRate))
        return '*****'
    }

    return (
        <div className='min-h-dvh bg-surface pb-24'>
            {/* Top bar */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)',
                }}
            >
                <div className='h-safe-top' />
                <div className='px-4 pt-3 pb-1 animate-slide-down'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-2.5'>
                            {/* Back to Home button - logo clickable */}
                            <button
                                onClick={() => navigate('/')}
                                className='flex items-center gap-2.5 cursor-pointer'
                                aria-label="Back to Home"
                            >
                                <img
                                    src='/logo.jpeg'
                                    alt='Luminos Energy'
                                    className='w-9 h-9 rounded-xl object-cover shrink-0'
                                    style={{
                                        border: '1px solid rgba(255,255,255,0.25)',
                                    }}
                                />
                                <div className='text-left'>
                                    <p className='text-white font-extrabold text-sm leading-tight'>
                                        {user?.displayName ||
                                            user?.userName ||
                                            'Luminos'}
                                    </p>
                                    <p className='text-surface text-[10px] font-medium'>
                                        Investment Platform
                                    </p>
                                </div>
                            </button>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button
                                onClick={() => navigate('/main/notifications?tab=announcements')}
                                className='relative w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform'
                                aria-label="Notifications"
                            >
                                <Bell size={16} />
                                {unreadNotifCount > 0 && (
                                    <span className='absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5'>
                                        {unreadNotifCount > 99
                                            ? '99+'
                                            : unreadNotifCount}
                                    </span>
                                )}
                            </button>
                            <button
                                className='w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform'
                                aria-label="QR Code"
                            >
                                <QrCode size={16} />
                            </button>
                            <button
                                className='w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform'
                                aria-label="Currency"
                            >
                                <span className='text-center leading-none'>
                                    🇳🇬
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Rest of your component remains the same... */}
                    {/* Balance card */}
                    <div
                        data-tour='balance-card'
                        className='bg-white/12 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20 animate-slide-up'
                    >
                        <p className='text-white text-[10px] font-bold uppercase tracking-widest mb-1'>
                            Funding Account
                        </p>

                        {loading ? (
                            <div className='h-8 w-28 skeleton rounded-lg bg-white/20' />
                        ) : (
                            <div className='flex items-center gap-2 mt-1'>
                                <p className='text-white text-2xl font-bold tracking-tight leading-none'>
                                    {maskedBalance()}
                                </p>
                                <button
                                    onClick={() => setShowBalance(!showBalance)}
                                    className='text-white/80 hover:text-white transition-colors'
                                    aria-label={showBalance ? "Hide balance" : "Show balance"}
                                >
                                    {showBalance ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        )}

                        <p className='text-surface text-xs mt-1 mb-3'>
                            {showBalance ? `≈ ${maskedNGN()}` : maskedNGN()}
                        </p>

                        <div className='flex gap-2.5 mb-3'>
                            <button
                                onClick={() => navigate('/main/deposit')}
                                className='flex-1 bg-white text-primary cursor-pointer text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform'
                            >
                                Recharge
                            </button>
                            <button
                                onClick={() => navigate('/main/withdraw')}
                                className='flex-1 bg-white/20 border cursor-pointer border-white/30 text-white text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform'
                            >
                                Withdraw
                            </button>
                        </div>

                        <div className='grid grid-cols-3 gap-2 pt-3 border-t text-surface'>
                            {[
                                { label: 'Today', val: bal.todayEarnings },
                                {
                                    label: 'Yesterday',
                                    val: bal.yesterdayEarnings,
                                },
                                { label: 'Total', val: bal.totalEarnings },
                            ].map(({ label, val }) => (
                                <div key={label} className='text-center'>
                                    <p className='text-white font-bold text-sm leading-none'>
                                        {fmtUSD(val)}
                                    </p>
                                    <p className='text-surface text-[10px] font-medium mt-1'>
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div
                data-tour='quick-actions'
                className='px-4 mt-4 animate-slide-up delay-100'
            >
                <div className='grid grid-cols-3 gap-3'>
                    {ACTIONS.map((a, i) => (
                        <button
                            key={a.label}
                            onClick={() => handleAction(a)}
                            className='flex flex-col items-center justify-center gap-2 py-3 px-2 cursor-pointer rounded-2xl bg-primary/40 shadow-sm border border-gray-100 active:scale-95 transition-all'
                            style={{ animationDelay: `${i * 0.04 + 0.12}s` }}
                        >
                            <div
                                className='w-12 h-12 rounded-xl flex items-center justify-center'
                                style={{ backgroundColor: a.bg }}
                            >
                                <a.icon
                                    size={20}
                                    style={{ color: a.color }}
                                    strokeWidth={1.8}
                                />
                            </div>
                            <span className='text-[11px] font-semibold text-primary text-center wrap-break-word max-w-full'>
                                {a.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Wealth Carousel */}
            <div data-tour='wealth-carousel'>
                <WealthCarousel
                    onInvest={(path) => navigate(path)}
                    onRefer={copyInvite}
                />
            </div>

            {/* Company profile link */}
            <div className='px-4 mt-3 animate-slide-up delay-200'>
                <button
                    onClick={() => window.open('https://jaksonsolar.org/about', '_blank')}
                    className='w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card active:scale-[0.99] transition-transform border border-gray-100'
                >
                    <div className='w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0'>
                        <span className='text-lg leading-none'>📢</span>
                    </div>
                    <div className='flex-1 text-left'>
                        <p className='text-sm font-bold text-gray-800'>
                            Luminos Energy Company Profile
                        </p>
                        <p className='text-xs text-gray-400 mt-0.5'>
                            Learn about our mission & global network
                        </p>
                    </div>
                    <ChevronRight size={15} className='text-gray-300' />
                </button>
            </div>

            {/* Invite banner */}
            <div
                data-tour='invite-banner'
                className='px-4 mt-3 animate-slide-up delay-200'
            >
                <div
                    className='rounded-2xl overflow-hidden'
                    style={{
                        background: 'linear-gradient(135deg,#f97316,#fb923c)',
                    }}
                >
                    <div className='flex items-center gap-3 p-4'>
                        <div className='w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0'>
                            <span className='text-2xl leading-none'>🎁</span>
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-white font-extrabold text-sm'>
                                Invite & Earn 8%
                            </p>
                            <p className='text-white/75 text-xs mt-0.5 truncate'>
                                Code:{' '}
                                <span className='font-bold'>
                                    {user?.referralCode || '—'}
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={copyInvite}
                            className='bg-white rounded-xl px-3 py-2 flex items-center cursor-pointer gap-1.5 text-accent text-xs font-bold active:scale-95 transition-transform shrink-0'
                        >
                            <Copy size={11} /> Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Announcements feed */}
            {announcements.length > 0 && (
                <div className='px-4 mt-4 mb-2 animate-slide-up delay-250'>
                    <div className='flex items-center justify-between mb-3'>
                        <p className='text-sm font-extrabold text-gray-700'>
                            Announcements
                        </p>
                        <button
                            onClick={() => navigate('/main/notifications?tab=announcements')}
                            className='text-xs text-primary font-bold cursor-pointer'
                        >
                            View all
                        </button>
                    </div>
                    <div className='space-y-3'>
                        {announcements.map((n) => {
                            const iconMap = {
                                info: Info,
                                success: CheckCircle2,
                                warning: AlertTriangle,
                                bonus: Gift,
                            }
                            const colorMap = {
                                info: '#1a9fd4',
                                success: '#10b981',
                                warning: '#f97316',
                                bonus: '#8b5cf6',
                            }
                            const bgMap = {
                                info: '#e0f4fc',
                                success: '#ecfdf5',
                                warning: '#fff4ed',
                                bonus: '#ede9fe',
                            }
                            const Icon = iconMap[n.type] || Megaphone
                            const timeAgo = (() => {
                                const diff =
                                    Date.now() - new Date(n.createdAt).getTime()
                                const days = Math.floor(diff / 86400000)
                                const hours = Math.floor(diff / 3600000)
                                if (days > 0) return `${days}d ago`
                                if (hours > 0) return `${hours}h ago`
                                return 'Recently'
                            })()
                            return (
                                <div
                                    key={n._id}
                                    className='bg-white rounded-2xl p-4 flex gap-3 shadow-card border border-gray-50'
                                >
                                    <div
                                        className='w-10 h-10 rounded-xl flex items-center justify-center shrink-0'
                                        style={{
                                            backgroundColor:
                                                bgMap[n.type] || '#f3f4f6',
                                        }}
                                    >
                                        <Icon
                                            size={18}
                                            style={{
                                                color:
                                                    colorMap[n.type] ||
                                                    '#6b7280',
                                            }}
                                            strokeWidth={2}
                                        />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center justify-between gap-2 mb-1'>
                                            <p className='text-sm font-bold text-gray-800 leading-tight'>
                                                {n.title}
                                            </p>
                                            <span className='text-[10px] text-gray-400 font-medium shrink-0'>
                                                {timeAgo}
                                            </span>
                                        </div>
                                        <p className='text-xs text-gray-500 leading-relaxed line-clamp-2'>
                                            {n.body}
                                        </p>
                                        {n.bonusCode && (
                                            <div className='mt-2 flex items-center gap-2'>
                                                <div className='flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1.5 flex-1 min-w-0'>
                                                    <Gift size={11} className='text-purple-500 shrink-0' />
                                                    <span className='text-purple-700 font-extrabold text-xs tracking-widest truncate'>{n.bonusCode}</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(n.bonusCode)
                                                        toast.success('Bonus code copied!')
                                                    }}
                                                    className='flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl shrink-0 bg-purple-50 text-purple-600 border border-purple-200 active:scale-95 transition-transform'
                                                >
                                                    <Copy size={10} /> Copy
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* FAQ Section */}
            <FaqSection />

            {/* Modals */}
            <Modal
                isOpen={modal === 'telegram'}
                onClose={() => setModal(null)}
                containerStyle={{ paddingBottom: '80px' }}
            >
                <div className='text-center space-y-4'>
                    <div className='w-16 h-16 rounded-2xl bg-[#e8f4fb] flex items-center justify-center mx-auto'>
                        <img
                            src='/logo.jpeg'
                            alt='Luminos Energy'
                            className='w-16 h-16 rounded-2xl object-cover mx-auto'
                            style={{ border: '1px solid rgba(198,123,44,0.2)' }}
                        />
                    </div>
                    <div>
                        <h3 className='text-gray-800 text-lg font-extrabold'>
                            Join Our Community
                        </h3>
                        <p className='text-gray-500 text-sm mt-2 leading-relaxed'>
                            Join the official Telegram group to participate in
                            events and receive exclusive{' '}
                            <strong className='text-gray-700'>
                                bonus codes
                            </strong>
                            .
                        </p>
                    </div>
                    <a
                        href='https://t.me/Luminos_Energy_manager'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block'
                    >
                        <button className='btn btn-primary rounded-2xl h-12 text-sm'>
                            🚀 Join Telegram Group
                        </button>
                    </a>
                    <div className='bg-orange-50 border border-orange-100 rounded-2xl p-3 flex items-start gap-2 text-left'>
                        <span className='text-orange-500 text-sm shrink-0'>
                            ⚠️
                        </span>
                        <p className='text-orange-600 text-xs font-medium'>
                            Help us maintain a safe and welcoming community. Be
                            respectful, avoid spam, and follow platform
                            guidelines at all times.
                        </p>
                    </div>
                    <button
                        onClick={() => setModal(null)}
                        className='text-primary font-bold text-sm'
                    >
                        OK, Got it
                    </button>
                </div>
            </Modal>

            <Modal
                isOpen={modal === 'reward'}
                onClose={() => setModal(null)}
                title='Redeem Reward'
            >
                <div className='space-y-4'>
                    <div className='w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center mx-auto'>
                        <span className='text-2xl'>🎫</span>
                    </div>
                    <p className='text-gray-500 text-sm text-center'>
                        Enter your exclusive bonus code to claim your reward
                    </p>
                    <input
                        type='text'
                        placeholder='ENTER CODE'
                        value={rewardCode}
                        onChange={(e) =>
                            setRewardCode(e.target.value.toUpperCase())
                        }
                        className='w-full px-4 py-4 rounded-2xl text-center text-xl font-extrabold tracking-[0.3em] border-2 border-primary bg-primary-light text-primary outline-none placeholder:text-primary/30 placeholder:font-bold'
                        autoCapitalize='characters'
                    />
                    <div className='flex gap-3'>
                        <button
                            onClick={() => {
                                setModal(null)
                                setRewardCode('')
                            }}
                            className='flex-1 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 text-sm font-bold active:scale-95 transition-transform'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRedeem}
                            disabled={redeeming}
                            className='flex-1 btn btn-primary rounded-2xl h-12 text-sm'
                        >
                            {redeeming ? (
                                <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow' />
                            ) : (
                                'Redeem 🎉'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={modal === 'checkin'}
                onClose={() => setModal(null)}
                title='Daily Check-in'
            >
                <div className='text-center space-y-4'>
                    <div className='relative mx-auto w-20 h-20'>
                        <div className='w-20 h-20 rounded-full bg-warning-light flex items-center justify-center'>
                            <span className='text-4xl'>🎯</span>
                        </div>
                        <div className='absolute inset-0 rounded-full border-4 border-warning/30 animate-ping' />
                    </div>
                    <div>
                        <p className='text-gray-800 font-extrabold text-base'>
                            Claim Your Daily Reward!
                        </p>
                        <p className='text-gray-500 text-sm mt-1'>
                            Check in every day to earn{' '}
                            <strong className='text-warning'>$0.01</strong> and
                            build your streak
                        </p>
                    </div>
                    {(user?.checkinStreak || 0) > 0 && (
                        <div className='bg-warning-light rounded-2xl p-3 flex items-center justify-center gap-2'>
                            <span>🔥</span>
                            <p className='text-warning font-bold text-sm'>
                                {user.checkinStreak} day streak!
                            </p>
                        </div>
                    )}
                    <button
                        onClick={handleCheckin}
                        disabled={checkingIn}
                        className='btn btn-primary rounded-2xl h-13'
                    >
                        {checkingIn ? (
                            <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow' />
                        ) : (
                            'Check In Now 🎉'
                        )}
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default Dashboard