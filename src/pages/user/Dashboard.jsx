// import { useState, useEffect, useCallback, useRef } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Skeleton from 'react-loading-skeleton'
// import {
//     QrCode, ArrowDownCircle, ArrowUpCircle, Gift, Calendar,
//     BarChart2, Users, ChevronRight, ChevronDown, Copy,
//     Megaphone, Eye, EyeOff, Bell, Info, AlertTriangle, CheckCircle2, X,
// } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { useAuth } from '../../context/AuthContext'
// import { useOnboarding } from '../../context/OnboardingContext'
// import { getBalance } from '../../api/wallet'
// import { redeemCode, dailyCheckin } from '../../api/rewards'
// import { fmtUSD, fmtNGN, toNGN } from '../../utils/currency'
// import { usePublicSettings } from '../../hooks/usePublicSettings'
// import { getAnnouncements } from '../../api/settings'
// import { getUnreadCount } from '../../api/notification'
// import { getWealthFunds } from '../../api/wealthFund'
// import Modal from '../../components/common/Modal'
// import { handleApiError } from '../../utils/errorHandler'

// // ── Quick actions ──
// const ACTIONS = [
//     { label: 'Recharge', icon: ArrowDownCircle, color: '#1a9fd4', bg: '#e0f4fc', path: '/main/deposit' },
//     { label: 'Withdraw', icon: ArrowUpCircle,   color: '#f97316', bg: '#fff4ed', path: '/main/withdraw' },
//     { label: 'Reward',   icon: Gift,            color: '#10b981', bg: '#ecfdf5', modal: 'reward' },
//     { label: 'Check-in', icon: Calendar,        color: '#f59e0b', bg: '#fffbeb', modal: 'checkin' },
//     { label: 'Invest',   icon: BarChart2,       color: '#8b5cf6', bg: '#ede9fe', path: '/main/invest' },
//     { label: 'Team',     icon: Users,           color: '#ec4899', bg: '#fdf2f8', path: '/main/team' },
// ]

// // ── FAQ ──
// const FAQS = [
//     { q: 'How do I start investing?', a: 'Recharge your wallet, go to Invest, choose a plan that suits you, and tap Buy. Your daily income starts the next weekday.' },
//     { q: 'When is daily income credited?', a: 'Income is queued each weekday (Mon–Fri) by midnight. You must claim it from the Invest Log before the next midnight or it is forfeited.' },
//     { q: 'How do I withdraw my earnings?', a: 'Bind a bank account under Account → Withdrawal Account, then tap Withdraw. Processing takes 5 minutes to 48 hours.' },
//     { q: 'How does the referral program work?', a: 'Share your invite link. You earn 8% on every first investment your direct referrals make, plus ongoing daily commission from their returns.' },
//     { q: 'Is my money safe?', a: 'Luminos Energy is backed by real solar assets. All transactions are secured and encrypted. Withdrawals are reviewed before processing.' },
//     { q: 'What are Wealth Funds?', a: 'Wealth Funds are long-term premium plans with a fixed maturity payout. You invest once and claim the full maturity value when it matures.' },
// ]

// const FaqSection = () => {
//     const [open, setOpen] = useState(null)
//     return (
//         <div className='px-4 mt-4 mb-2 animate-slide-up delay-300'>
//             <p className='text-sm font-extrabold text-gray-700 mb-3'>Frequently Asked Questions</p>
//             <div className='space-y-2'>
//                 {FAQS.map((faq, i) => (
//                     <div key={i} className='bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden'>
//                         <button
//                             onClick={() => setOpen(open === i ? null : i)}
//                             className='w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50 transition-colors'
//                         >
//                             <span className='text-sm font-bold text-gray-800 pr-3'>{faq.q}</span>
//                             <ChevronDown size={16} className='text-primary shrink-0 transition-transform duration-200'
//                                 style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }} />
//                         </button>
//                         {open === i && (
//                             <div className='px-4 pb-4 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-3'>{faq.a}</div>
//                         )}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     )
// }

// // ── Wealth Carousel ──
// const WealthCarousel = ({ onInvest, onRefer }) => {
//     const [wealthFunds, setWealthFunds] = useState([])
//     const [active, setActive] = useState(0)
//     const timerRef = useRef(null)

//     useEffect(() => {
//         const fetchFunds = async () => {
//             try {
//                 const res = await getWealthFunds()
//                 setWealthFunds(res?.funds || res?.data?.funds || res || [])
//             } catch (err) {
//                 handleApiError(err, 'Failed to load wealth funds')
//                 setWealthFunds([])
//             }
//         }
//         fetchFunds()
//     }, [])

//     const slides = [
//         ...wealthFunds.map((fund) => ({ type: 'fund', data: fund })),
//         { type: 'refer', data: { title: 'Invite & Earn 8%', sub: 'Share with friends and earn on every investment they make' } },
//     ]

//     const next = useCallback(() => setActive((a) => (a + 1) % slides.length), [slides.length])

//     useEffect(() => {
//         if (slides.length === 0) return
//         timerRef.current = setInterval(next, 3500)
//         return () => clearInterval(timerRef.current)
//     }, [next, slides.length])

//     const goTo = (i) => {
//         clearInterval(timerRef.current)
//         setActive(i)
//         timerRef.current = setInterval(next, 3500)
//     }

//     if (slides.length === 0) return null

//     const gradients = [
//         'linear-gradient(135deg,#065f46 0%,#10b981 60%,#34d399 100%)',
//         'linear-gradient(135deg,#0e6a8f 0%,#1a9fd4 60%,#38bdf8 100%)',
//         'linear-gradient(135deg,#7c2d12 0%,#f97316 60%,#fb923c 100%)',
//         'linear-gradient(135deg,#4c1d95 0%,#8b5cf6 60%,#a78bfa 100%)',
//     ]

//     return (
//         <div className='px-4 mt-4 animate-slide-up delay-150'>
//             <div className='relative overflow-hidden rounded-2xl' style={{ height: 170 }}>
//                 {slides.map((slide, i) => {
//                     const isActiveSlide = i === active
//                     const bgGradient = slide.type === 'fund' ? gradients[i % gradients.length] : 'linear-gradient(135deg,#f97316,#fb923c)'
//                     return (
//                         <div key={i} className='absolute inset-0 transition-all duration-500'
//                             style={{ background: bgGradient, opacity: isActiveSlide ? 1 : 0, transform: `translateX(${(i - active) * 100}%)` }}>
//                             <div className='absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl' />
//                             {slide.type === 'fund' ? (
//                                 <>
//                                     <div className='absolute right-3 bottom-3 text-4xl select-none'>💰</div>
//                                     <div className='relative p-4 h-full flex flex-col justify-between'>
//                                         <div>
//                                             <div className='flex justify-between items-start'>
//                                                 <span className='text-yellow-300 text-[10px] font-bold uppercase tracking-wider'>
//                                                     {slide.data.isActive ? '⚡ Active' : '🔜 Coming Soon'}
//                                                 </span>
//                                                 {slide.data.image && <img src={slide.data.image} alt='' className='w-8 h-8 rounded-full bg-white/20 object-cover' />}
//                                             </div>
//                                             <p className='text-white text-base font-extrabold mt-1 leading-tight'>{slide.data.name}</p>
//                                             <p className='text-white/70 text-[11px] mt-0.5'>${slide.data.amount} · {slide.data.durationDays}d · Maturity ${slide.data.maturityAmount}</p>
//                                         </div>
//                                         <button onClick={() => onInvest('/main/wealth-fund')}
//                                             className='self-start bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform flex items-center gap-1'>
//                                             View Product <ChevronRight size={11} />
//                                         </button>
//                                     </div>
//                                 </>
//                             ) : (
//                                 <>
//                                     <div className='absolute right-3 bottom-3 text-4xl select-none'>🎁</div>
//                                     <div className='relative p-4 h-full flex flex-col justify-between'>
//                                         <div>
//                                             <span className='text-yellow-300 text-[10px] font-bold uppercase tracking-wider'>✦ Referral</span>
//                                             <p className='text-white text-base font-extrabold mt-1 leading-tight'>{slide.data.title}</p>
//                                             <p className='text-white/70 text-[11px] mt-0.5'>{slide.data.sub}</p>
//                                         </div>
//                                         <button onClick={() => onRefer()}
//                                             className='self-start bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform flex items-center gap-1'>
//                                             Invite Now <ChevronRight size={11} />
//                                         </button>
//                                     </div>
//                                 </>
//                             )}
//                         </div>
//                     )
//                 })}
//             </div>
//             <div className='flex justify-center gap-1.5 mt-2'>
//                 {slides.map((_, i) => (
//                     <button key={i} onClick={() => goTo(i)}
//                         className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-primary' : 'w-1.5 bg-primary/30'}`} />
//                 ))}
//             </div>
//         </div>
//     )
// }

// // ── Telegram Floating Ad ──
// // Fixed bottom-right corner, auto-shows on mount, reappears every 15 min after close.
// // High z-index, doesn't scroll with page, doesn't block content.

// const useMediaQuery = (query) => {
//   const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

//   useEffect(() => {
//     const media = window.matchMedia(query)
//     const listener = (e) => setMatches(e.matches)
//     media.addEventListener('change', listener)
//     return () => media.removeEventListener('change', listener)
//   }, [query])

//   return matches
// }

// const TelegramFloatingAd = ({ showWelcome, showTour }) => {
//   const [visible, setVisible] = useState(false)
//   const reshowRef = useRef(null)
//   const isMobile = useMediaQuery('(max-width: 768px)')

//   useEffect(() => {
//     if (showWelcome || showTour) return
//     const t = setTimeout(() => setVisible(true), 900)
//     return () => clearTimeout(t)
//   }, [showWelcome, showTour])

//   useEffect(() => () => { if (reshowRef.current) clearTimeout(reshowRef.current) }, [])

//   const handleClose = () => {
//     setVisible(false)
//     reshowRef.current = setTimeout(() => setVisible(true), 10 * 60 * 1000)
//   }

//   // Positioning: centered on mobile, right-aligned on desktop
//   const positionStyles = isMobile
//     ? {
//         left: '50%',
//         transform: 'translateX(-50%)',
//         right: 'auto',
//         bottom: 88,
//       }
//     : {
//         right: 16,
//         left: 'auto',
//         transform: 'none',
//         bottom: 88,
//       }

//   return (
//     <div
//       aria-hidden={!visible}
//       style={{
//         position: 'fixed',
//         zIndex: 99999,
//         width: 280,
//         maxWidth: 'calc(100vw - 32px)',
//         borderRadius: 24,
//         overflow: 'hidden',
//         boxShadow: '0 20px 40px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.1)',
//         opacity: visible ? 1 : 0,
//         transform: visible
//           ? isMobile
//             ? 'translateX(-50%) translateY(0) scale(1)'
//             : 'translateY(0) scale(1)'
//           : isMobile
//           ? 'translateX(-50%) translateY(20px) scale(0.94)'
//           : 'translateY(20px) scale(0.94)',
//         transition: 'opacity 300ms cubic-bezier(0,0,0.2,1), transform 300ms cubic-bezier(0,0,0.2,1)',
//         pointerEvents: visible ? 'auto' : 'none',
//         ...positionStyles,
//       }}
//     >
//       {/* Close button (same as before) */}
//       <button
//         onClick={handleClose}
//         aria-label="Close"
//         style={{
//           position: 'absolute', top: 12, right: 12, zIndex: 2,
//           width: 28, height: 28, borderRadius: '50%',
//           background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
//           border: 'none', cursor: 'pointer',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           color: 'white',
//         }}
//       >
//         <X size={14} strokeWidth={2.5} />
//       </button>

//       {/* Hero header */}
//       <div style={{
//         background: 'linear-gradient(135deg, #C67B2C 0%, #9E5E1F 100%)',
//         padding: '18px 16px 14px',
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <img
//             src="/logo.jpeg"
//             alt="Luminos Energy"
//             style={{
//               width: 44, height: 44, borderRadius: 12, objectFit: 'cover',
//               border: '2px solid rgba(255,255,255,0.35)',
//               boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
//               flexShrink: 0,
//             }}
//           />
//           <div>
//             <p style={{ color: 'white', fontWeight: 900, fontSize: '0.9rem', lineHeight: 1.2, margin: 0 }}>
//               Luminos Energy
//             </p>
//             <p style={{
//               color: 'rgba(255,255,255,0.85)',
//               fontSize: '0.65rem',
//               fontWeight: 600,
//               letterSpacing: '0.04em',
//               margin: 0,
//               marginTop: 2,
//             }}>
//               OFFICIAL TELEGRAM COMMUNITY
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Extended body content */}
//       <div style={{ background: 'white', padding: '16px 16px 18px' }}>
//         <p style={{
//           fontSize: '0.8rem',
//           color: '#1f2937',
//           fontWeight: 600,
//           margin: '0 0 12px 0',
//           lineHeight: 1.4,
//         }}>
//           🚀 Get exclusive bonuses, early updates & direct support
//         </p>

//         {/* Benefits list */}
//         <div style={{ marginBottom: 16 }}>
//           {[
//             { emoji: '🎁', text: 'Bonus codes & updates' },
//             { emoji: '⚡', text: 'Real‑time energy market news' },
//             { emoji: '👥', text: 'Connect with 2,000+ investors' },
//           ].map((item, idx) => (
//             <div key={idx} style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 10,
//               marginBottom: 10,
//               fontSize: '0.7rem',
//               color: '#4b5563',
//             }}>
//               <span style={{ fontSize: '1rem', width: 24 }}>{item.emoji}</span>
//               <span>{item.text}</span>
//             </div>
//           ))}
//         </div>

//         {/* CTA button */}
//         <a
//           href="https://t.me/+FywiCmE-6hVlYjU0"
//           target="_blank"
//           rel="noopener noreferrer"
//           style={{ textDecoration: 'none', display: 'block' }}
//         >
//           <button style={{
//             width: '100%',
//             background: 'linear-gradient(135deg, #e8720c, #f97316, #fb923c)',
//             color: 'white',
//             fontWeight: 800,
//             fontSize: '0.8rem',
//             padding: '11px 12px',
//             borderRadius: 60,
//             border: 'none',
//             cursor: 'pointer',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             gap: 8,
//             boxShadow: '0 6px 18px rgba(249,115,22,0.4)',
//             transition: 'transform 0.1s ease',
//           }}
//           onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
//           onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
//           >
//             <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
//               <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
//             </svg>
//             Join Telegram Group
//           </button>
//         </a>

//         {/* Small footnote */}
//         <p style={{
//           fontSize: '0.6rem',
//           color: '#9ca3af',
//           textAlign: 'center',
//           margin: '12px 0 0 0',
//         }}>
//           ⚡Need help? — join today
//         </p>
//       </div>
//     </div>
//   )
// }




// // ── Main Dashboard ──
// const Dashboard = () => {
//     const navigate = useNavigate()
//     const { user, refreshUser } = useAuth()
//     const { showWelcome, showTour } = useOnboarding()
//     const [showBalance, setShowBalance] = useState(false)

//     const { usd_to_ngn_rate } = usePublicSettings()
//     const safeRate = usd_to_ngn_rate ?? 1560

//     const [bal, setBal] = useState({ balance: 0, todayEarnings: 0, yesterdayEarnings: 0, totalEarnings: 0 })
//     const [announcements, setAnnouncements] = useState([])
//     const [unreadNotifCount, setUnreadNotifCount] = useState(0)
//     const [loading, setLoading] = useState(true)
//     const [modal, setModal] = useState(null)
//     const [rewardCode, setRewardCode] = useState('')
//     const [redeeming, setRedeeming] = useState(false)
//     const [checkingIn, setCheckingIn] = useState(false)

//     const loadBal = useCallback(async () => {
//         try { const { data } = await getBalance(); setBal(data) }
//         catch { /* interceptor */ }
//         finally { setLoading(false) }
//     }, [])

//     const loadAnnouncements = useCallback(async () => {
//         try { const { data } = await getAnnouncements(); setAnnouncements((data?.notifications || []).slice(0, 3)) }
//         catch { /* silent */ }
//     }, [])

//     const loadUnreadCount = useCallback(async () => {
//         try { const { data } = await getUnreadCount(); setUnreadNotifCount(data?.count ?? 0) }
//         catch { /* silent */ }
//     }, [])

//     useEffect(() => {
//         ;(async () => { await Promise.all([loadBal(), loadAnnouncements(), loadUnreadCount()]) })()
//     }, [loadBal, loadAnnouncements, loadUnreadCount])

//     const handleAction = (a) => { if (a.modal) { setModal(a.modal); return } navigate(a.path) }

//     const handleRedeem = async () => {
//         if (!rewardCode.trim()) return toast.error('Enter a reward code')
//         setRedeeming(true)
//         try {
//             const { data } = await redeemCode(rewardCode.trim())
//             toast.success(data.message); setModal(null); setRewardCode(''); loadBal(); refreshUser()
//         } catch (err) { handleApiError(err, 'Invalid code') }
//         finally { setRedeeming(false) }
//     }

//     const handleCheckin = async () => {
//         setCheckingIn(true)
//         try {
//             const { data } = await dailyCheckin()
//             toast.success(`Checked in! +${fmtUSD(data.reward)} 🎉`); setModal(null); loadBal(); refreshUser()
//         } catch (err) { handleApiError(err, 'Already checked in today'); setModal(null) }
//         finally { setCheckingIn(false) }
//     }

//     const copyInvite = () => {
//         const link = `https://www.luminos-energy.com?c=${user?.referralCode || ''}`
//         navigator.clipboard.writeText(link).then(() => toast.success('Invite link copied!')).catch(() => toast.error('Could not copy'))
//     }

//     const maskedBalance = () => showBalance ? fmtUSD(bal.balance) : '*****'
//     const maskedNGN = () => showBalance ? fmtNGN(toNGN(bal.balance, safeRate)) : '*****'

//     if (loading) {
//         return (
//             <div className='min-h-dvh pb-24'>
//                 <div style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}>
//                     <div className='h-safe-top' />
//                     <div className='px-4 pt-3 pb-1'>
//                         <div className='flex items-center justify-between mb-4'>
//                             <div className='flex items-center gap-2.5'>
//                                 <Skeleton circle width={36} height={36} />
//                                 <div><Skeleton width={100} height={16} /><Skeleton width={80} height={10} className='mt-1' /></div>
//                             </div>
//                             <div className='flex items-center gap-2'>
//                                 <Skeleton width={36} height={36} borderRadius={12} />
//                                 <Skeleton width={36} height={36} borderRadius={12} />
//                                 <Skeleton width={36} height={36} borderRadius={12} />
//                             </div>
//                         </div>
//                         <div className='bg-white/12 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20'>
//                             <Skeleton width={100} height={12} />
//                             <div className='flex items-center gap-2 mt-1'><Skeleton width={120} height={32} /><Skeleton circle width={24} height={24} /></div>
//                             <Skeleton width={140} height={12} className='mt-1 mb-3' />
//                             <div className='flex gap-2.5 mb-3'><Skeleton width='100%' height={42} borderRadius={12} /><Skeleton width='100%' height={42} borderRadius={12} /></div>
//                             <div className='flex justify-between pt-3 border-t border-white/20'>
//                                 <Skeleton width={80} height={20} /><Skeleton width={80} height={20} /><Skeleton width={80} height={20} />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className='px-4 mt-4'><div className='grid grid-cols-3 gap-3'>{[...Array(6)].map((_, i) => (<div key={i} className='flex flex-col items-center gap-2 py-3'><Skeleton circle width={48} height={48} /><Skeleton width={50} height={14} /></div>))}</div></div>
//                 <div className='px-4 mt-4'><Skeleton height={170} borderRadius={16} /></div>
//                 <div className='px-4 mt-3'><Skeleton height={78} borderRadius={16} /></div>
//                 <div className='px-4 mt-3'><Skeleton height={86} borderRadius={16} /></div>
//                 <div className='px-4 mt-4'><Skeleton width={200} height={20} /><div className='space-y-2 mt-3'><Skeleton height={56} borderRadius={16} count={3} /></div></div>
//             </div>
//         )
//     }

//     return (
//         <div className='min-h-dvh pb-24'>
//             {/* Top bar */}
//             <div style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}>
//                 <div className='h-safe-top' />
//                 <div className='px-4 pt-3 pb-1 animate-slide-down'>
//                     <div className='flex items-center justify-between mb-4'>
//                         <div className='flex items-center gap-2.5'>
//                             <button onClick={() => navigate('/')} className='flex items-center gap-2.5 cursor-pointer' aria-label='Back to Home'>
//                                 <img src='/logo.jpeg' alt='Luminos Energy' className='w-9 h-9 rounded-xl object-cover shrink-0' style={{ border: '1px solid rgba(255,255,255,0.25)' }} />
//                                 <div className='text-left'>
//                                     <p className='text-white font-extrabold text-sm leading-tight'>{user?.displayName || user?.userName || 'Luminos'}</p>
//                                     <p className='text-surface text-[10px] font-medium'>Investment Platform</p>
//                                 </div>
//                             </button>
//                         </div>
//                         <div className='flex items-center gap-2'>
//                             <button onClick={() => navigate('/main/notifications?tab=announcements')}
//                                 className='relative w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform' aria-label='Notifications'>
//                                 <Bell size={16} />
//                                 {unreadNotifCount > 0 && (
//                                     <span className='absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5'>
//                                         {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
//                                     </span>
//                                 )}
//                             </button>
//                             <button className='w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform' aria-label='QR Code'>
//                                 <QrCode size={16} />
//                             </button>
//                             <button className='w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform' aria-label='Currency'>
//                                 <span className='text-center leading-none'>🇳🇬</span>
//                             </button>
//                         </div>
//                     </div>

//                     {/* Balance card */}
//                     <div data-tour='balance-card' className='bg-white/12 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20 animate-slide-up'>
//                         <p className='text-white text-[10px] font-bold uppercase tracking-widest mb-1'>Funding Account</p>
//                         <div className='flex items-center gap-2 mt-1'>
//                             <p className='text-white text-2xl font-bold tracking-tight leading-none'>{maskedBalance()}</p>
//                             <button onClick={() => setShowBalance(!showBalance)} className='text-white/80 hover:text-white transition-colors'
//                                 aria-label={showBalance ? 'Hide balance' : 'Show balance'}>
//                                 {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
//                             </button>
//                         </div>
//                         <p className='text-surface text-xs mt-1 mb-3'>{showBalance ? `≈ ${maskedNGN()}` : maskedNGN()}</p>
//                         <div className='flex gap-2.5 mb-3'>
//                             <button onClick={() => navigate('/main/deposit')} className='flex-1 bg-white text-primary cursor-pointer text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform'>Recharge</button>
//                             <button onClick={() => navigate('/main/withdraw')} className='flex-1 bg-white/20 border cursor-pointer border-white/30 text-white text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform'>Withdraw</button>
//                         </div>
//                         <div className='flex flex-col gap-2 pt-3 border-t text-surface md:grid md:grid-cols-3 md:gap-2'>
//                             {[{ label: 'Today', val: bal.todayEarnings }, { label: 'Yesterday', val: bal.yesterdayEarnings }, { label: 'Total', val: bal.totalEarnings }].map(({ label, val }) => (
//                                 <div key={label} className='flex items-center justify-between md:flex-col md:justify-center md:text-center'>
//                                     <p className='text-surface text-[10px] font-medium'>{label}</p>
//                                     <p className='text-white font-bold text-sm leading-none'>{fmtUSD(val)}</p>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Quick Actions */}
//             <div data-tour='quick-actions' className='px-4 mt-4 animate-slide-up delay-100'>
//                 <div className='grid grid-cols-3 gap-3'>
//                     {ACTIONS.map((a, i) => (
//                         <button key={a.label} onClick={() => handleAction(a)}
//                             className='flex flex-col items-center justify-center gap-2 py-3 px-2 cursor-pointer rounded-2xl bg-primary/40 shadow-sm border border-gray-100 active:scale-95 transition-all'
//                             style={{ animationDelay: `${i * 0.04 + 0.12}s` }}>
//                             <div className='w-12 h-12 rounded-xl flex items-center justify-center' style={{ backgroundColor: a.bg }}>
//                                 <a.icon size={20} style={{ color: a.color }} strokeWidth={1.8} />
//                             </div>
//                             <span className='text-[11px] font-semibold text-primary text-center wrap-break-word max-w-full'>{a.label}</span>
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             {/* Wealth Carousel */}
//             <div data-tour='wealth-carousel'>
//                 <WealthCarousel onInvest={(path) => navigate(path)} onRefer={copyInvite} />
//             </div>

//             {/* Company profile link */}
//             <div className='px-4 mt-3 animate-slide-up delay-200'>
//                 <button onClick={() => window.open('https://jakson-client-side.vercel.app/#how-it-works', '_blank')}
//                     className='w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card active:scale-[0.99] transition-transform border border-gray-100'>
//                     <div className='w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0'><span className='text-lg leading-none'>📢</span></div>
//                     <div className='flex-1 text-left'>
//                         <p className='text-sm font-bold text-gray-800'>Luminos Energy Company Profile</p>
//                         <p className='text-xs text-gray-400 mt-0.5'>Learn about our mission & global network</p>
//                     </div>
//                     <ChevronRight size={15} className='text-gray-300' />
//                 </button>
//             </div>

//             {/* Invite banner */}
//             <div data-tour='invite-banner' className='px-4 mt-3 animate-slide-up delay-200'>
//                 <div className='rounded-2xl overflow-hidden' style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)' }}>
//                     <div className='flex items-center gap-3 p-4'>
//                         <div className='w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0'><span className='text-2xl leading-none'>🎁</span></div>
//                         <div className='flex-1 min-w-0'>
//                             <p className='text-white font-extrabold text-sm'>Invite & Earn 8%</p>
//                             <p className='text-white/75 text-xs mt-0.5 truncate'>Code: <span className='font-bold'>{user?.referralCode || '—'}</span></p>
//                         </div>
//                         <button onClick={copyInvite} className='bg-white rounded-xl px-3 py-2 flex items-center cursor-pointer gap-1.5 text-accent text-xs font-bold active:scale-95 transition-transform shrink-0'>
//                             <Copy size={11} /> Copy
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             {/* Announcements feed */}
//             {announcements.length > 0 && (
//                 <div className='px-4 mt-4 mb-2 animate-slide-up delay-250'>
//                     <div className='flex items-center justify-between mb-3'>
//                         <p className='text-sm font-extrabold text-gray-700'>Announcements</p>
//                         <button onClick={() => navigate('/main/notifications?tab=announcements')} className='text-xs text-primary font-bold cursor-pointer'>View all</button>
//                     </div>
//                     <div className='space-y-3'>
//                         {announcements.map((n) => {
//                             const iconMap = { info: Info, success: CheckCircle2, warning: AlertTriangle, bonus: Gift }
//                             const colorMap = { info: '#1a9fd4', success: '#10b981', warning: '#f97316', bonus: '#8b5cf6' }
//                             const bgMap = { info: '#e0f4fc', success: '#ecfdf5', warning: '#fff4ed', bonus: '#ede9fe' }
//                             const Icon = iconMap[n.type] || Megaphone
//                             const timeAgo = (() => {
//                                 const diff = Date.now() - new Date(n.createdAt).getTime()
//                                 const days = Math.floor(diff / 86400000)
//                                 const hours = Math.floor(diff / 3600000)
//                                 if (days > 0) return `${days}d ago`
//                                 if (hours > 0) return `${hours}h ago`
//                                 return 'Recently'
//                             })()
//                             return (
//                                 <div key={n._id} className='bg-white rounded-2xl p-4 flex gap-3 shadow-card border border-gray-50'>
//                                     <div className='w-10 h-10 rounded-xl flex items-center justify-center shrink-0' style={{ backgroundColor: bgMap[n.type] || '#f3f4f6' }}>
//                                         <Icon size={18} style={{ color: colorMap[n.type] || '#6b7280' }} strokeWidth={2} />
//                                     </div>
//                                     <div className='flex-1 min-w-0'>
//                                         <div className='flex items-center justify-between gap-2 mb-1'>
//                                             <p className='text-sm font-bold text-gray-800 leading-tight'>{n.title}</p>
//                                             <span className='text-[10px] text-gray-400 font-medium shrink-0'>{timeAgo}</span>
//                                         </div>
//                                         <p className='text-xs text-gray-500 leading-relaxed line-clamp-2'>{n.body}</p>
//                                         {n.bonusCode && (
//                                             <div className='mt-2 flex items-center gap-2'>
//                                                 <div className='flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1.5 flex-1 min-w-0'>
//                                                     <Gift size={11} className='text-purple-500 shrink-0' />
//                                                     <span className='text-purple-700 font-extrabold text-xs tracking-widest truncate'>{n.bonusCode}</span>
//                                                 </div>
//                                                 <button onClick={() => { navigator.clipboard.writeText(n.bonusCode); toast.success('Bonus code copied!') }}
//                                                     className='flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl shrink-0 bg-purple-50 text-purple-600 border border-purple-200 active:scale-95 transition-transform'>
//                                                     <Copy size={10} /> Copy
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             )
//                         })}
//                     </div>
//                 </div>
//             )}

//             {/* FAQ Section */}
//             <FaqSection />

//             {/* ── Telegram floating ad (fixed, bottom-right, z-99999) ── */}
//             <TelegramFloatingAd showWelcome={showWelcome} showTour={showTour} />

//             {/* ── Other modals ── */}
//             <Modal isOpen={modal === 'reward'} onClose={() => setModal(null)} title='Redeem Reward'>
//                 <div className='space-y-4'>
//                     <div className='w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center mx-auto'><span className='text-2xl'>🎫</span></div>
//                     <p className='text-gray-500 text-sm text-center'>Enter your exclusive bonus code to claim your reward</p>
//                     <input type='text' placeholder='ENTER CODE' value={rewardCode}
//                         onChange={(e) => setRewardCode(e.target.value.toUpperCase())}
//                         className='w-full px-4 py-4 rounded-2xl text-center text-xl font-extrabold tracking-[0.3em] border-2 border-primary bg-primary-light text-primary outline-none placeholder:text-primary/30 placeholder:font-bold'
//                         autoCapitalize='characters' />
//                     <div className='flex gap-3'>
//                         <button onClick={() => { setModal(null); setRewardCode('') }}
//                             className='flex-1 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 text-sm font-bold active:scale-95 transition-transform'>Cancel</button>
//                         <button onClick={handleRedeem} disabled={redeeming} className='flex-1 btn btn-primary rounded-2xl h-12 text-sm'>
//                             {redeeming ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow' /> : 'Redeem 🎉'}
//                         </button>
//                     </div>
//                 </div>
//             </Modal>

//             <Modal isOpen={modal === 'checkin'} onClose={() => setModal(null)} title='Daily Check-in'>
//                 <div className='text-center space-y-4'>
//                     <div className='relative mx-auto w-20 h-20'>
//                         <div className='w-20 h-20 rounded-full bg-warning-light flex items-center justify-center'><span className='text-4xl'>🎯</span></div>
//                         <div className='absolute inset-0 rounded-full border-4 border-warning/30 animate-ping' />
//                     </div>
//                     <div>
//                         <p className='text-gray-800 font-extrabold text-base'>Claim Your Daily Reward!</p>
//                         <p className='text-gray-500 text-sm mt-1'>Check in every day to earn <strong className='text-warning'>$0.01</strong> and build your streak</p>
//                     </div>
//                     {(user?.checkinStreak || 0) > 0 && (
//                         <div className='bg-warning-light rounded-2xl p-3 flex items-center justify-center gap-2'>
//                             <span>🔥</span><p className='text-warning font-bold text-sm'>{user.checkinStreak} day streak!</p>
//                         </div>
//                     )}
//                     <button onClick={handleCheckin} disabled={checkingIn} className='btn btn-primary rounded-2xl h-13'>
//                         {checkingIn ? <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow' /> : 'Check In Now 🎉'}
//                     </button>
//                 </div>
//             </Modal>
//         </div>
//     )
// }

// export default Dashboard


import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Skeleton from 'react-loading-skeleton'
import {
    QrCode, ArrowDownCircle, ArrowUpCircle, Gift, Calendar,
    BarChart2, Users, ChevronRight, ChevronDown, Copy,
    Megaphone, Eye, EyeOff, Bell, Info, AlertTriangle, CheckCircle2,
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
    { label: 'Recharge', icon: ArrowDownCircle, color: '#1a9fd4', bg: '#e0f4fc', path: '/main/deposit' },
    { label: 'Withdraw', icon: ArrowUpCircle,   color: '#f97316', bg: '#fff4ed', path: '/main/withdraw' },
    { label: 'Reward',   icon: Gift,            color: '#10b981', bg: '#ecfdf5', modal: 'reward' },
    { label: 'Check-in', icon: Calendar,        color: '#f59e0b', bg: '#fffbeb', modal: 'checkin' },
    { label: 'Invest',   icon: BarChart2,       color: '#8b5cf6', bg: '#ede9fe', path: '/main/invest' },
    { label: 'Team',     icon: Users,           color: '#ec4899', bg: '#fdf2f8', path: '/main/team' },
]

// ── FAQ ──
const FAQS = [
    { q: 'How do I start investing?', a: 'Recharge your wallet, go to Invest, choose a plan that suits you, and tap Buy. Your daily income starts the next weekday.' },
    { q: 'When is daily income credited?', a: 'Income is queued each weekday (Mon–Fri) by midnight. You must claim it from the Invest Log before the next midnight or it is forfeited.' },
    { q: 'How do I withdraw my earnings?', a: 'Bind a bank account under Account → Withdrawal Account, then tap Withdraw. Processing takes 5 minutes to 48 hours.' },
    { q: 'How does the referral program work?', a: 'Share your invite link. You earn 8% on every first investment your direct referrals make, plus ongoing daily commission from their returns.' },
    { q: 'Is my money safe?', a: 'Luminos Energy is backed by real solar assets. All transactions are secured and encrypted. Withdrawals are reviewed before processing.' },
    { q: 'What are Wealth Funds?', a: 'Wealth Funds are long-term premium plans with a fixed maturity payout. You invest once and claim the full maturity value when it matures.' },
]

const FaqSection = () => {
    const [open, setOpen] = useState(null)
    return (
        <div className='px-4 mt-4 mb-2 animate-slide-up delay-300'>
            <p className='text-sm font-extrabold text-gray-700 mb-3'>Frequently Asked Questions</p>
            <div className='space-y-2'>
                {FAQS.map((faq, i) => (
                    <div key={i} className='bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden'>
                        <button
                            onClick={() => setOpen(open === i ? null : i)}
                            className='w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50 transition-colors'
                        >
                            <span className='text-sm font-bold text-gray-800 pr-3'>{faq.q}</span>
                            <ChevronDown size={16} className='text-primary shrink-0 transition-transform duration-200'
                                style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>
                        {open === i && (
                            <div className='px-4 pb-4 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-3'>{faq.a}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Wealth Carousel ──
const WealthCarousel = ({ onInvest, onRefer }) => {
    const [wealthFunds, setWealthFunds] = useState([])
    const [active, setActive] = useState(0)
    const timerRef = useRef(null)

    useEffect(() => {
        const fetchFunds = async () => {
            try {
                const res = await getWealthFunds()
                setWealthFunds(res?.funds || res?.data?.funds || res || [])
            } catch (err) {
                handleApiError(err, 'Failed to load wealth funds')
                setWealthFunds([])
            }
        }
        fetchFunds()
    }, [])

    const slides = [
        ...wealthFunds.map((fund) => ({ type: 'fund', data: fund })),
        { type: 'refer', data: { title: 'Invite & Earn 8%', sub: 'Share with friends and earn on every investment they make' } },
    ]

    const next = useCallback(() => setActive((a) => (a + 1) % slides.length), [slides.length])

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
            <div className='relative overflow-hidden rounded-2xl' style={{ height: 170 }}>
                {slides.map((slide, i) => {
                    const isActiveSlide = i === active
                    const bgGradient = slide.type === 'fund' ? gradients[i % gradients.length] : 'linear-gradient(135deg,#f97316,#fb923c)'
                    return (
                        <div key={i} className='absolute inset-0 transition-all duration-500'
                            style={{ background: bgGradient, opacity: isActiveSlide ? 1 : 0, transform: `translateX(${(i - active) * 100}%)` }}>
                            <div className='absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-2xl' />
                            {slide.type === 'fund' ? (
                                <>
                                    <div className='absolute right-3 bottom-3 text-4xl select-none'>💰</div>
                                    <div className='relative p-4 h-full flex flex-col justify-between'>
                                        <div>
                                            <div className='flex justify-between items-start'>
                                                <span className='text-yellow-300 text-[10px] font-bold uppercase tracking-wider'>
                                                    {slide.data.isActive ? '⚡ Active' : '🔜 Coming Soon'}
                                                </span>
                                                {slide.data.image && <img src={slide.data.image} alt='' className='w-8 h-8 rounded-full bg-white/20 object-cover' />}
                                            </div>
                                            <p className='text-white text-base font-extrabold mt-1 leading-tight'>{slide.data.name}</p>
                                            <p className='text-white/70 text-[11px] mt-0.5'>${slide.data.amount} · {slide.data.durationDays}d · Maturity ${slide.data.maturityAmount}</p>
                                        </div>
                                        <button onClick={() => onInvest('/main/wealth-fund')}
                                            className='self-start bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform flex items-center gap-1'>
                                            View Product <ChevronRight size={11} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className='absolute right-3 bottom-3 text-4xl select-none'>🎁</div>
                                    <div className='relative p-4 h-full flex flex-col justify-between'>
                                        <div>
                                            <span className='text-yellow-300 text-[10px] font-bold uppercase tracking-wider'>✦ Referral</span>
                                            <p className='text-white text-base font-extrabold mt-1 leading-tight'>{slide.data.title}</p>
                                            <p className='text-white/70 text-[11px] mt-0.5'>{slide.data.sub}</p>
                                        </div>
                                        <button onClick={() => onRefer()}
                                            className='self-start bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-transform flex items-center gap-1'>
                                            Invite Now <ChevronRight size={11} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
            <div className='flex justify-center gap-1.5 mt-2'>
                {slides.map((_, i) => (
                    <button key={i} onClick={() => goTo(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-primary' : 'w-1.5 bg-primary/30'}`} />
                ))}
            </div>
        </div>
    )
}

// ── Main Dashboard ──
const Dashboard = () => {
    const navigate = useNavigate()
    const { user, refreshUser } = useAuth()
    useOnboarding()
    const [showBalance, setShowBalance] = useState(false)

    const { usd_to_ngn_rate } = usePublicSettings()
    const safeRate = usd_to_ngn_rate ?? 1560

    const [bal, setBal] = useState({ balance: 0, todayEarnings: 0, yesterdayEarnings: 0, totalEarnings: 0 })
    const [announcements, setAnnouncements] = useState([])
    const [unreadNotifCount, setUnreadNotifCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null)
    const [rewardCode, setRewardCode] = useState('')
    const [redeeming, setRedeeming] = useState(false)
    const [checkingIn, setCheckingIn] = useState(false)

    const loadBal = useCallback(async () => {
        try { const { data } = await getBalance(); setBal(data) }
        catch { /* interceptor */ }
        finally { setLoading(false) }
    }, [])

    const loadAnnouncements = useCallback(async () => {
        try { const { data } = await getAnnouncements(); setAnnouncements((data?.notifications || []).slice(0, 3)) }
        catch { /* silent */ }
    }, [])

    const loadUnreadCount = useCallback(async () => {
        try { const { data } = await getUnreadCount(); setUnreadNotifCount(data?.count ?? 0) }
        catch { /* silent */ }
    }, [])

    useEffect(() => {
        ;(async () => { await Promise.all([loadBal(), loadAnnouncements(), loadUnreadCount()]) })()
    }, [loadBal, loadAnnouncements, loadUnreadCount])

    const handleAction = (a) => { if (a.modal) { setModal(a.modal); return } navigate(a.path) }

    const handleRedeem = async () => {
        if (!rewardCode.trim()) return toast.error('Enter a reward code')
        setRedeeming(true)
        try {
            const { data } = await redeemCode(rewardCode.trim())
            toast.success(data.message); setModal(null); setRewardCode(''); loadBal(); refreshUser()
        } catch (err) { handleApiError(err, 'Invalid code') }
        finally { setRedeeming(false) }
    }

    const handleCheckin = async () => {
        setCheckingIn(true)
        try {
            const { data } = await dailyCheckin()
            toast.success(`Checked in! +${fmtUSD(data.reward)} 🎉`); setModal(null); loadBal(); refreshUser()
        } catch (err) { handleApiError(err, 'Already checked in today'); setModal(null) }
        finally { setCheckingIn(false) }
    }

    const copyInvite = () => {
        const link = `https://www.luminos-energy.com?c=${user?.referralCode || ''}`
        navigator.clipboard.writeText(link).then(() => toast.success('Invite link copied!')).catch(() => toast.error('Could not copy'))
    }

    const maskedBalance = () => showBalance ? fmtUSD(bal.balance) : '*****'
    const maskedNGN = () => showBalance ? fmtNGN(toNGN(bal.balance, safeRate)) : '*****'

    if (loading) {
        return (
            <div className='min-h-dvh pb-24'>
                <div style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}>
                    <div className='h-safe-top' />
                    <div className='px-4 pt-3 pb-1'>
                        <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center gap-2.5'>
                                <Skeleton circle width={36} height={36} />
                                <div><Skeleton width={100} height={16} /><Skeleton width={80} height={10} className='mt-1' /></div>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Skeleton width={36} height={36} borderRadius={12} />
                                <Skeleton width={36} height={36} borderRadius={12} />
                                <Skeleton width={36} height={36} borderRadius={12} />
                            </div>
                        </div>
                        <div className='bg-white/12 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20'>
                            <Skeleton width={100} height={12} />
                            <div className='flex items-center gap-2 mt-1'><Skeleton width={120} height={32} /><Skeleton circle width={24} height={24} /></div>
                            <Skeleton width={140} height={12} className='mt-1 mb-3' />
                            <div className='flex gap-2.5 mb-3'><Skeleton width='100%' height={42} borderRadius={12} /><Skeleton width='100%' height={42} borderRadius={12} /></div>
                            <div className='flex justify-between pt-3 border-t border-white/20'>
                                <Skeleton width={80} height={20} /><Skeleton width={80} height={20} /><Skeleton width={80} height={20} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='px-4 mt-4'><div className='grid grid-cols-3 gap-3'>{[...Array(6)].map((_, i) => (<div key={i} className='flex flex-col items-center gap-2 py-3'><Skeleton circle width={48} height={48} /><Skeleton width={50} height={14} /></div>))}</div></div>
                <div className='px-4 mt-4'><Skeleton height={170} borderRadius={16} /></div>
                <div className='px-4 mt-3'><Skeleton height={78} borderRadius={16} /></div>
                <div className='px-4 mt-3'><Skeleton height={86} borderRadius={16} /></div>
                <div className='px-4 mt-4'><Skeleton width={200} height={20} /><div className='space-y-2 mt-3'><Skeleton height={56} borderRadius={16} count={3} /></div></div>
            </div>
        )
    }

    return (
        <div className='min-h-dvh pb-24'>
            {/* Top bar */}
            <div style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}>
                <div className='h-safe-top' />
                <div className='px-4 pt-3 pb-1 animate-slide-down'>
                    <div className='flex items-center justify-between mb-4'>
                        <div className='flex items-center gap-2.5'>
                            <button onClick={() => navigate('/')} className='flex items-center gap-2.5 cursor-pointer' aria-label='Back to Home'>
                                <img src='/logo.jpeg' alt='Luminos Energy' className='w-9 h-9 rounded-xl object-cover shrink-0' style={{ border: '1px solid rgba(255,255,255,0.25)' }} />
                                <div className='text-left'>
                                    <p className='text-white font-extrabold text-sm leading-tight'>{user?.displayName || user?.userName || 'Luminos'}</p>
                                    <p className='text-surface text-[10px] font-medium'>Investment Platform</p>
                                </div>
                            </button>
                        </div>
                        <div className='flex items-center gap-2'>
                            <button onClick={() => navigate('/main/notifications?tab=announcements')}
                                className='relative w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform' aria-label='Notifications'>
                                <Bell size={16} />
                                {unreadNotifCount > 0 && (
                                    <span className='absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5'>
                                        {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                                    </span>
                                )}
                            </button>
                            <button className='w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform' aria-label='QR Code'>
                                <QrCode size={16} />
                            </button>
                            <button className='w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-transform' aria-label='Currency'>
                                <span className='text-center leading-none'>🇳🇬</span>
                            </button>
                        </div>
                    </div>

                    {/* Balance card */}
                    <div data-tour='balance-card' className='bg-white/12 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20 animate-slide-up'>
                        <p className='text-white text-[10px] font-bold uppercase tracking-widest mb-1'>Funding Account</p>
                        <div className='flex items-center gap-2 mt-1'>
                            <p className='text-white text-2xl font-bold tracking-tight leading-none'>{maskedBalance()}</p>
                            <button onClick={() => setShowBalance(!showBalance)} className='text-white/80 hover:text-white transition-colors'
                                aria-label={showBalance ? 'Hide balance' : 'Show balance'}>
                                {showBalance ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <p className='text-surface text-xs mt-1 mb-3'>{showBalance ? `≈ ${maskedNGN()}` : maskedNGN()}</p>
                        <div className='flex gap-2.5 mb-3'>
                            <button onClick={() => navigate('/main/deposit')} className='flex-1 bg-white text-primary cursor-pointer text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform'>Recharge</button>
                            <button onClick={() => navigate('/main/withdraw')} className='flex-1 bg-white/20 border cursor-pointer border-white/30 text-white text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform'>Withdraw</button>
                        </div>
                        <div className='flex flex-col gap-2 pt-3 border-t text-surface md:grid md:grid-cols-3 md:gap-2'>
                            {[{ label: 'Today', val: bal.todayEarnings }, { label: 'Yesterday', val: bal.yesterdayEarnings }, { label: 'Total', val: bal.totalEarnings }].map(({ label, val }) => (
                                <div key={label} className='flex items-center justify-between md:flex-col md:justify-center md:text-center'>
                                    <p className='text-surface text-[10px] font-medium'>{label}</p>
                                    <p className='text-white font-bold text-sm leading-none'>{fmtUSD(val)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div data-tour='quick-actions' className='px-4 mt-4 animate-slide-up delay-100'>
                <div className='grid grid-cols-3 gap-3'>
                    {ACTIONS.map((a, i) => (
                        <button key={a.label} onClick={() => handleAction(a)}
                            className='flex flex-col items-center justify-center gap-2 py-3 px-2 cursor-pointer rounded-2xl bg-primary/40 shadow-sm border border-gray-100 active:scale-95 transition-all'
                            style={{ animationDelay: `${i * 0.04 + 0.12}s` }}>
                            <div className='w-12 h-12 rounded-xl flex items-center justify-center' style={{ backgroundColor: a.bg }}>
                                <a.icon size={20} style={{ color: a.color }} strokeWidth={1.8} />
                            </div>
                            <span className='text-[11px] font-semibold text-primary text-center wrap-break-word max-w-full'>{a.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Wealth Carousel */}
            <div data-tour='wealth-carousel'>
                <WealthCarousel onInvest={(path) => navigate(path)} onRefer={copyInvite} />
            </div>

            {/* Company profile link */}
            <div className='px-4 mt-3 animate-slide-up delay-200'>
                <button onClick={() => window.open('https://jakson-client-side.vercel.app/#how-it-works', '_blank')}
                    className='w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card active:scale-[0.99] transition-transform border border-gray-100'>
                    <div className='w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0'><span className='text-lg leading-none'>📢</span></div>
                    <div className='flex-1 text-left'>
                        <p className='text-sm font-bold text-gray-800'>Luminos Energy Company Profile</p>
                        <p className='text-xs text-gray-400 mt-0.5'>Learn about our mission & global network</p>
                    </div>
                    <ChevronRight size={15} className='text-gray-300' />
                </button>
            </div>

            {/* Invite banner */}
            <div data-tour='invite-banner' className='px-4 mt-3 animate-slide-up delay-200'>
                <div className='rounded-2xl overflow-hidden' style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)' }}>
                    <div className='flex items-center gap-3 p-4'>
                        <div className='w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0'><span className='text-2xl leading-none'>🎁</span></div>
                        <div className='flex-1 min-w-0'>
                            <p className='text-white font-extrabold text-sm'>Invite & Earn 8%</p>
                            <p className='text-white/75 text-xs mt-0.5 truncate'>Code: <span className='font-bold'>{user?.referralCode || '—'}</span></p>
                        </div>
                        <button onClick={copyInvite} className='bg-white rounded-xl px-3 py-2 flex items-center cursor-pointer gap-1.5 text-accent text-xs font-bold active:scale-95 transition-transform shrink-0'>
                            <Copy size={11} /> Copy
                        </button>
                    </div>
                </div>
            </div>

            {/* Announcements feed */}
            {announcements.length > 0 && (
                <div className='px-4 mt-4 mb-2 animate-slide-up delay-250'>
                    <div className='flex items-center justify-between mb-3'>
                        <p className='text-sm font-extrabold text-gray-700'>Announcements</p>
                        <button onClick={() => navigate('/main/notifications?tab=announcements')} className='text-xs text-primary font-bold cursor-pointer'>View all</button>
                    </div>
                    <div className='space-y-3'>
                        {announcements.map((n) => {
                            const iconMap = { info: Info, success: CheckCircle2, warning: AlertTriangle, bonus: Gift }
                            const colorMap = { info: '#1a9fd4', success: '#10b981', warning: '#f97316', bonus: '#8b5cf6' }
                            const bgMap = { info: '#e0f4fc', success: '#ecfdf5', warning: '#fff4ed', bonus: '#ede9fe' }
                            const Icon = iconMap[n.type] || Megaphone
                            const timeAgo = (() => {
                                const diff = Date.now() - new Date(n.createdAt).getTime()
                                const days = Math.floor(diff / 86400000)
                                const hours = Math.floor(diff / 3600000)
                                if (days > 0) return `${days}d ago`
                                if (hours > 0) return `${hours}h ago`
                                return 'Recently'
                            })()
                            return (
                                <div key={n._id} className='bg-white rounded-2xl p-4 flex gap-3 shadow-card border border-gray-50'>
                                    <div className='w-10 h-10 rounded-xl flex items-center justify-center shrink-0' style={{ backgroundColor: bgMap[n.type] || '#f3f4f6' }}>
                                        <Icon size={18} style={{ color: colorMap[n.type] || '#6b7280' }} strokeWidth={2} />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center justify-between gap-2 mb-1'>
                                            <p className='text-sm font-bold text-gray-800 leading-tight'>{n.title}</p>
                                            <span className='text-[10px] text-gray-400 font-medium shrink-0'>{timeAgo}</span>
                                        </div>
                                        <p className='text-xs text-gray-500 leading-relaxed line-clamp-2'>{n.body}</p>
                                        {n.bonusCode && (
                                            <div className='mt-2 flex items-center gap-2'>
                                                <div className='flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-xl px-2.5 py-1.5 flex-1 min-w-0'>
                                                    <Gift size={11} className='text-purple-500 shrink-0' />
                                                    <span className='text-purple-700 font-extrabold text-xs tracking-widest truncate'>{n.bonusCode}</span>
                                                </div>
                                                <button onClick={() => { navigator.clipboard.writeText(n.bonusCode); toast.success('Bonus code copied!') }}
                                                    className='flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl shrink-0 bg-purple-50 text-purple-600 border border-purple-200 active:scale-95 transition-transform'>
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

            {/* Reward modal */}
            <Modal isOpen={modal === 'reward'} onClose={() => setModal(null)} title='Redeem Reward'>
                <div className='space-y-4'>
                    <div className='w-14 h-14 rounded-2xl bg-success-light flex items-center justify-center mx-auto'><span className='text-2xl'>🎫</span></div>
                    <p className='text-gray-500 text-sm text-center'>Enter your exclusive bonus code to claim your reward</p>
                    <input type='text' placeholder='ENTER CODE' value={rewardCode}
                        onChange={(e) => setRewardCode(e.target.value.toUpperCase())}
                        className='w-full px-4 py-4 rounded-2xl text-center text-xl font-extrabold tracking-[0.3em] border-2 border-primary bg-primary-light text-primary outline-none placeholder:text-primary/30 placeholder:font-bold'
                        autoCapitalize='characters' />
                    <div className='flex gap-3'>
                        <button onClick={() => { setModal(null); setRewardCode('') }}
                            className='flex-1 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 text-sm font-bold active:scale-95 transition-transform'>Cancel</button>
                        <button onClick={handleRedeem} disabled={redeeming} className='flex-1 btn btn-primary rounded-2xl h-12 text-sm'>
                            {redeeming ? <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow' /> : 'Redeem 🎉'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Check-in modal */}
            <Modal isOpen={modal === 'checkin'} onClose={() => setModal(null)} title='Daily Check-in'>
                <div className='text-center space-y-4'>
                    <div className='relative mx-auto w-20 h-20'>
                        <div className='w-20 h-20 rounded-full bg-warning-light flex items-center justify-center'><span className='text-4xl'>🎯</span></div>
                        <div className='absolute inset-0 rounded-full border-4 border-warning/30 animate-ping' />
                    </div>
                    <div>
                        <p className='text-gray-800 font-extrabold text-base'>Claim Your Daily Reward!</p>
                        <p className='text-gray-500 text-sm mt-1'>Check in every day to earn <strong className='text-warning'>$0.01</strong> and build your streak</p>
                    </div>
                    {(user?.checkinStreak || 0) > 0 && (
                        <div className='bg-warning-light rounded-2xl p-3 flex items-center justify-center gap-2'>
                            <span>🔥</span><p className='text-warning font-bold text-sm'>{user.checkinStreak} day streak!</p>
                        </div>
                    )}
                    <button onClick={handleCheckin} disabled={checkingIn} className='btn btn-primary rounded-2xl h-13'>
                        {checkingIn ? <span className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow' /> : 'Check In Now 🎉'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default Dashboard