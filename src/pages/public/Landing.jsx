import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, Menu, X, Star, Shield, Zap, TrendingUp, Users, CheckCircle, ArrowUp } from 'lucide-react'

// ── DATA ──────────────────────────────────────────────────────────────────

const STEPS = [
    { num: '01', title: 'Create Account',      desc: 'Sign up free in under 2 minutes with just your phone number. No paperwork, no bank visits.' },
    { num: '02', title: 'Fund Your Wallet',    desc: 'Recharge via bank transfer. Funds reflect instantly and are ready to invest immediately.' },
    { num: '03', title: 'Choose a Plan',       desc: 'Browse solar investment products from VIP0 to VIP5. Pick one that matches your budget.' },
    { num: '04', title: 'Earn Daily',          desc: 'Income is credited every weekday. Claim it daily from your Invest Log before midnight.' },
]

const FEATURES = [
    { icon: Zap,        color: '#f59e0b', bg: '#fffbeb', title: 'Daily Returns',       desc: 'Earn consistent daily income from real solar energy assets — weekdays, every week.' },
    { icon: Shield,     color: '#10b981', bg: '#ecfdf5', title: 'Secure & Transparent', desc: 'Bank-grade security on every transaction. All investments backed by real solar panels.' },
    { icon: TrendingUp, color: '#8b5cf6', bg: '#ede9fe', title: 'Multiple VIP Plans',  desc: 'From starter $11.50 plans to premium $174+ packages. Scale at your own pace.' },
    { icon: Users,      color: '#1a9fd4', bg: '#e0f4fc', title: 'Referral Rewards',    desc: 'Earn 8% on your direct referrals\' first investment, plus ongoing daily commissions.' },
    { icon: CheckCircle,color: '#f97316', bg: '#fff4ed', title: 'Easy Withdrawals',    desc: 'Withdraw to your bank account any day. Processing in 5 minutes to 48 hours.' },
    { icon: Star,       color: '#ec4899', bg: '#fdf2f8', title: 'Wealth Funds',        desc: 'Long-term premium plans with guaranteed maturity payouts. Invest once, claim big.' },
]

const TESTIMONIALS = [
    { name: 'Chukwuemeka O.', loc: 'Lagos',    vip: 'VIP3', text: 'I was skeptical at first but after my first withdrawal hit in 20 minutes I was hooked. The daily income is real and consistent.' },
    { name: 'Fatima A.',      loc: 'Abuja',    vip: 'VIP2', text: 'I\'ve tried other platforms but Luminos is the only one where I can track exactly what I\'m earning daily. The referral bonus paid my rent.' },
    { name: 'Yusuf M.',       loc: 'Kano',     vip: 'VIP0', text: 'Running three VIP4 plans. The compounding effect over months is incredible. Best financial decision I\'ve made.' },
    { name: 'Ngozi I.',       loc: 'Enugu',    vip: 'VIP2', text: 'My sister referred me and we both earn from each other\'s investments. The team structure is brilliant.' },
    { name: 'Adewale B.',     loc: 'Ibadan',   vip: 'VIP3', text: 'Clean app, fast withdrawals, real returns. I\'ve recommended this to my entire office.' },
    { name: 'Amina K.',       loc: 'Kaduna',   vip: 'VIP1', text: 'Started with the free plan to test it. Now I\'m on VIP1 and earning every weekday without lifting a finger.' },
]

const FAQS = [
    { q: 'Is Luminos Energy legitimate?',        a: 'Yes. Luminos Energy is backed by real solar energy infrastructure. All investments are tied to physical solar assets generating actual revenue.' },
    { q: 'What is the minimum investment?',      a: 'You can start with the free VIP0 plan at $0, or the starter plan at $11.50. There\'s a plan for every budget.' },
    { q: 'When do I receive my daily income?',   a: 'Income is queued every weekday (Mon–Fri) at midnight. You must log in and claim it from your Invest Log before the next midnight or it is forfeited.' },
    { q: 'How do withdrawals work?',             a: 'Bind your  bank account in the app, then tap Withdraw. Minimum withdrawal is $11.50. Processing takes 5 minutes to 48 hours.' },
    { q: 'How does the referral program work?',  a: 'Share your unique invite link. When someone signs up and makes their first investment, you earn 8% instantly. You also earn ongoing daily commissions from their returns across 3 tiers.' },
    { q: 'What happens if I miss claiming income?', a: 'Unclaimed income is forfeited at midnight the following day. We send a notification to remind you. This policy encourages daily engagement and keeps the platform sustainable.' },
]

const PLANS = [
    {
        name: 'VIP 1', vip: 1, highlight: false,
        amount: 17980, daily: 584, days: 60,
        image: 'https://i.pinimg.com/1200x/cc/40/0a/cc400a98dd1a9007ba2f20aa57dda0a8.jpg',
    },
    {
        name: 'VIP 2', vip: 2, highlight: true,
        amount: 92400, daily: 3172, days: 72,
        image: 'https://i.pinimg.com/1200x/d4/57/af/d457afad29b2807168c6479b884884cd.jpg',
    },
    {
        name: 'VIP 3', vip: 3, highlight: false,
        amount: 260000, daily: 9036, days: 80,
        image: 'https://i.pinimg.com/1200x/9a/6e/95/9a6e958b3f5868c9a2abd5e7b7c5a97f.jpg',
    },
]

// Format NGN amounts nicely
const fmtNaira = (n) => '₦' + n.toLocaleString('en-NG')

// ── Auth-aware nav buttons ──
const NavActions = ({ mobile }) => {
    const { isAuthenticated, isAdmin } = useAuth()
    const dest = isAdmin ? '/admin/dashboard' : '/main/dashboard'

    if (isAuthenticated) {
        return (
            <Link
                to={dest}
                className={`font-bold text-white transition-all active:scale-95 ${
                    mobile
                        ? 'text-center py-3 rounded-xl text-sm block'
                        : 'px-4 py-2 rounded-xl text-sm'
                }`}
                style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 4px 12px rgba(198,123,44,0.4)' }}
            >
                My Dashboard
            </Link>
        )
    }

    return mobile ? (
        <>
            <Link to="/login" className="text-white/70 text-sm font-semibold text-center py-2 block">Sign In</Link>
            <Link to="/register" className="w-full text-center py-3 rounded-xl text-sm font-bold text-white block"
                style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}>
                Get Started Free
            </Link>
        </>
    ) : (
        <>
            <Link to="/login" className="text-white/80 hover:text-white text-sm font-semibold transition-colors">
                Sign In
            </Link>
            <Link to="/register" className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 4px 12px rgba(198,123,44,0.4)' }}>
                Get Started Free
            </Link>
        </>
    )
}

// ── Scroll to top button ──
const ScrollToTop = () => {
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])
    if (!visible) return null
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 4px 20px rgba(198,123,44,0.5)' }}
            aria-label="Scroll to top"
        >
            <ArrowUp size={18} />
        </button>
    )
}

// ── Smart CTA — /login if not authed, /main/dashboard if authed ──
const AuthCTA = ({ children, className, style }) => {
    const { isAuthenticated, isAdmin } = useAuth()
    const dest = isAuthenticated
        ? (isAdmin ? '/admin/dashboard' : '/main/dashboard')
        : '/login'
    return (
        <Link to={dest} className={className} style={style}>
            {children}
        </Link>
    )
}

// ── COMPONENTS ────────────────────────────────────────────────────────────

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: scrolled ? 'rgba(28,26,24,0.97)' : 'transparent',
                backdropFilter: scrolled ? 'blur(12px)' : 'none',
                boxShadow: scrolled ? '0 1px 24px rgba(0,0,0,0.3)' : 'none',
            }}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <img src="/logo.jpeg" alt="Luminos Energy" className="w-9 h-9 rounded-xl object-cover" />
                    <div>
                        <span className="text-white font-extrabold text-sm leading-tight block">Luminos Energy</span>
                        <span className="text-white/50 text-[10px] leading-tight block">Solar Investment</span>
                    </div>
                </div>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {['How It Works', 'Plans', 'Testimonials', 'FAQ'].map(item => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                            className="text-white/70 hover:text-white text-sm font-medium transition-colors"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* CTA — auth-aware */}
                <NavActions />

                {/* Mobile menu button */}
                <button onClick={() => setOpen(o => !o)} className="md:hidden text-white p-1">
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="md:hidden" style={{ background: 'rgba(28,26,24,0.98)', backdropFilter: 'blur(12px)' }}>
                    <div className="px-4 py-4 space-y-4 border-t border-white/10">
                        {['How It Works', 'Plans', 'Testimonials', 'FAQ'].map(item => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                                onClick={() => setOpen(false)}
                                className="block text-white/80 font-semibold text-sm py-1"
                            >
                                {item}
                            </a>
                        ))}
                        <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
                            <NavActions mobile />
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
            >
                <span className="text-gray-800 font-bold text-sm pr-4">{q}</span>
                <ChevronDown
                    size={18}
                    className="text-primary shrink-0 transition-transform duration-200"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
            </button>
            {open && (
                <div className="px-6 pb-5 pt-1 text-gray-500 text-sm leading-relaxed bg-white border-t border-gray-100">
                    {a}
                </div>
            )}
        </div>
    )
}

// ── MAIN ──────────────────────────────────────────────────────────────────

const Landing = () => {
    return (
        <div className="min-h-screen font-sans" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", background: '#f5f3ef' }}>
            <Navbar />

            {/* ── HERO ── */}
            <section
                className="relative min-h-screen flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg,#1C1A18 0%,#2D1F0E 50%,#1C1A18 100%)' }}
            >
                {/* Background logo watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <img src="/logo.jpeg" alt="" style={{ width: '70vw', maxWidth: 600 }} />
                </div>

                {/* Glow orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle,rgba(198,123,44,0.2) 0%,transparent 70%)', filter: 'blur(40px)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle,rgba(101,155,94,0.15) 0%,transparent 70%)', filter: 'blur(40px)' }} />

                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-20 pb-16">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 border"
                        style={{ background: 'rgba(198,123,44,0.12)', borderColor: 'rgba(198,123,44,0.3)' }}>
                        <span className="text-yellow-400 text-xs">⚡</span>
                        <span className="text-xs font-bold" style={{ color: '#C67B2C' }}>Nigeria's Leading Solar Investment Platform</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6"
                        style={{ letterSpacing: '-0.02em' }}>
                        Earn Daily Returns<br />
                        <span style={{ background: 'linear-gradient(135deg,#C67B2C,#F5C26B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            From Solar Energy
                        </span>
                    </h1>

                    <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
                        Invest in real solar energy infrastructure. Earn consistent weekday income.
                        Withdraw to your bank account anytime.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                        <AuthCTA
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-95"
                            style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 8px 32px rgba(198,123,44,0.45)' }}
                        >
                            Start Earning Free <ChevronRight size={18} />
                        </AuthCTA>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white/80 hover:text-white border border-white/20 hover:border-white/40 transition-all"
                        >
                            Sign In to Account
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                        {[
                            { val: '12,000+', label: 'Active Investors' },
                            { val: 'Up to 3%', label: 'Daily Returns' },
                            { val: '4.9 ★', label: 'App Rating' },
                        ].map(({ val, label }) => (
                            <div key={label} className="rounded-2xl p-4 border"
                                style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}>
                                <p className="text-white font-extrabold text-xl leading-tight">{val}</p>
                                <p className="text-white/45 text-xs mt-1 font-medium">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/30">
                    <span className="text-xs font-medium">Scroll to explore</span>
                    <ChevronDown size={16} className="animate-bounce" />
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" className="py-20 px-4" style={{ background: '#1C1A18' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C67B2C' }}>Simple Process</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">See How Easy Investing Can Be</h2>
                        <p className="text-white/50 max-w-xl mx-auto">From signup to daily income in under 10 minutes. No experience required.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {STEPS.map((step, i) => (
                            <div key={i} className="relative rounded-2xl p-6 border"
                                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm mb-4"
                                    style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', color: 'white' }}>
                                    {step.num}
                                </div>
                                <h3 className="text-white font-extrabold text-base mb-2">{step.title}</h3>
                                <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
                                {i < STEPS.length - 1 && (
                                    <div className="hidden lg:block absolute top-10 -right-3 z-10">
                                        <ChevronRight size={18} style={{ color: '#C67B2C' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="py-20 px-4" style={{ background: '#f5f3ef' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C67B2C' }}>Why Luminos</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">What to Expect When You Invest</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Built for You. Designed to grow your wealth reliably, one weekday at a time.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FEATURES.map(({ icon: Icon, color, bg, title, desc }, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100"
                                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                    style={{ backgroundColor: bg }}>
                                    <Icon size={22} style={{ color }} strokeWidth={2} />
                                </div>
                                <h3 className="text-gray-800 font-extrabold text-base mb-2">{title}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── PLANS ── */}
            <section id="plans" className="py-20 px-4" style={{ background: '#1C1A18' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C67B2C' }}>Investment Plans</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Choose Your Plan</h2>
                        <p className="text-white/50 max-w-xl mx-auto">Start free and upgrade as you grow. Every plan earns real daily income from solar energy.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {PLANS.map((plan, i) => (
                            <div key={i} className="relative rounded-2xl overflow-hidden flex flex-col border"
                                style={{
                                    background: plan.highlight
                                        ? 'linear-gradient(135deg,rgba(198,123,44,0.15),rgba(198,123,44,0.05))'
                                        : 'rgba(255,255,255,0.04)',
                                    borderColor: plan.highlight ? 'rgba(198,123,44,0.5)' : 'rgba(255,255,255,0.08)',
                                    boxShadow: plan.highlight ? '0 0 40px rgba(198,123,44,0.15)' : 'none',
                                }}>
                                {plan.highlight && (
                                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white"
                                        style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}>
                                        Most Popular
                                    </div>
                                )}
                                {/* Product image */}
                                <div className="w-full h-36 overflow-hidden">
                                    <img src={plan.image} alt={plan.name}
                                        className="w-full h-full object-cover"
                                        style={{ filter: 'brightness(0.85)' }} />
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                            style={{ background: 'rgba(198,123,44,0.2)', color: '#C67B2C' }}>
                                            VIP {plan.vip}
                                        </span>
                                        <span className="text-white/40 text-xs">{plan.days} day cycle</span>
                                    </div>
                                    <h3 className="text-white font-extrabold text-lg mb-1">{plan.name}</h3>
                                    <div className="mb-2">
                                        <span className="text-white font-extrabold text-xl">{fmtNaira(plan.amount)}</span>
                                        <span className="text-white/40 text-xs ml-1">investment</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: '#C67B2C' }} />
                                        <span className="text-white/70 text-sm">
                                            {fmtNaira(plan.daily)}
                                            <span className="text-white/40"> / day</span>
                                        </span>
                                    </div>
                                    <Link
                                        to="/login"
                                        className="mt-auto text-center py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
                                        style={{
                                            background: plan.highlight ? 'linear-gradient(135deg,#C67B2C,#A25F1F)' : 'rgba(255,255,255,0.12)',
                                            color: 'white',
                                        }}
                                    >
                                        Invest Now
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="text-center text-white/30 text-xs mt-6">
                        More plans available after sign up · VIP4 &amp; VIP5 available in-app
                    </p>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section id="testimonials" className="py-20 px-4" style={{ background: '#f5f3ef' }}>
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C67B2C' }}>Real Investors</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">What Our Investors Say</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Real stories from Users building wealth with solar energy investments.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {TESTIMONIALS.map(({ name, loc, vip, text }, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100"
                                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}>
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, s) => (
                                        <Star key={s} size={13} fill="#f59e0b" stroke="none" />
                                    ))}
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{text}"</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shrink-0"
                                            style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}>
                                            {name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-gray-800 font-bold text-sm">{name}</p>
                                            <p className="text-gray-400 text-xs">{loc}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                        style={{ background: '#fef3e4', color: '#C67B2C' }}>
                                        {vip}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="py-20 px-4" style={{ background: '#f5f3ef' }}>
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C67B2C' }}>FAQ</p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-gray-500">Everything you need to know before you invest.</p>
                    </div>
                    <div className="space-y-3">
                        {FAQS.map((faq, i) => <FaqItem key={i} {...faq} />)}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            <section className="py-20 px-4" style={{ background: 'linear-gradient(135deg,#1C1A18 0%,#2D1F0E 100%)' }}>
                <div className="max-w-3xl mx-auto text-center">
                    <img src="/logo.jpeg" alt="Luminos Energy" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6"
                        style={{ border: '2px solid rgba(198,123,44,0.4)' }} />
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                        Ready to Start Earning?
                    </h2>
                    <p className="text-white/55 text-lg mb-10 max-w-xl mx-auto">
                        Join 900,000+ Users already earning daily returns from solar energy. Create your free account in 2 minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <AuthCTA
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white"
                            style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 8px 32px rgba(198,123,44,0.4)' }}
                        >
                            Create Free Account <ChevronRight size={18} />
                        </AuthCTA>
                        <Link to="/login" className="text-white/60 hover:text-white text-sm font-semibold transition-colors">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ background: '#111110' }}>
                <div className="max-w-5xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2.5 mb-4">
                                <img src="/logo.jpeg" alt="Luminos Energy" className="w-10 h-10 rounded-xl object-cover" />
                                <div>
                                    <p className="text-white font-extrabold text-sm">Luminos Energy</p>
                                    <p className="text-white/40 text-xs">Powering a Brighter Tomorrow</p>
                                </div>
                            </div>
                            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                               World's leading solar-backed investment platform. Earn daily returns from real solar energy infrastructure.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <p className="text-white font-bold text-sm mb-4">Platform</p>
                            <div className="space-y-2.5">
                                {['How It Works', 'Investment Plans', 'Referral Program', 'Wealth Funds'].map(item => (
                                    <a key={item} href="#" className="block text-white/45 hover:text-white text-sm transition-colors">{item}</a>
                                ))}
                            </div>
                        </div>

                        {/* Support */}
                        <div>
                            <p className="text-white font-bold text-sm mb-4">Support</p>
                            <div className="space-y-2.5">
                                <a href="https://t.me/Luminosenergy" target="_blank" rel="noopener noreferrer"
                                    className="block text-white/45 hover:text-white text-sm transition-colors">Telegram Community</a>
                                <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer"
                                    className="block text-white/45 hover:text-white text-sm transition-colors">WhatsApp Support</a>
                                <Link to="/login" className="block text-white/45 hover:text-white text-sm transition-colors">Sign In</Link>
                                <Link to="/register" className="block text-white/45 hover:text-white text-sm transition-colors">Create Account</Link>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <p className="text-white/30 text-xs">© 2025 Luminos Energy. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">Privacy Policy</a>
                            <a href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        <ScrollToTop />
        </div>
    )
}

export default Landing