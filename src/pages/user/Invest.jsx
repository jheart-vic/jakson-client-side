import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    ShoppingCart,
    TrendingUp,
    Package,
    Zap,
    ChevronRight,
    Star,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getProducts, buyProduct } from '../../api/invest'
import { getMyInvestments } from '../../api/invest'
import { fmtUSD } from '../../utils/currency'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'
import { handleApiError } from '../../utils/errorHandler'

const Invest = () => {
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [myInvests, setMyInvests] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [buying, setBuying] = useState(false)
    const [activeTab, setActiveTab] = useState('all')
    const { refreshUser } = useAuth()

    const load = useCallback(async () => {
        try {
            const [prodRes, invRes] = await Promise.all([
                getProducts(),
                getMyInvestments({ limit: 100 }),
            ])

            // Safely extract arrays
            const productsArray = prodRes?.data?.products || prodRes?.products || []
            setProducts(productsArray)

            let investmentsArray = invRes?.data?.investments || invRes?.investments || []
            if (!Array.isArray(investmentsArray)) investmentsArray = []

            // Keep only active (in_progress) investments
            const activeInvestments = investmentsArray.filter(
                (i) => i.status === 'in_progress'
            )
            setMyInvests(activeInvestments)

        } catch (err) {
            console.error(err)
            handleApiError(err, 'Failed to load products')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
       (async () => {
            await load()
        })()
    }, [load])

    const handleBuy = async () => {
        if (!selected) return
        setBuying(true)
        try {
            await buyProduct(selected._id)
            toast.success(`Invested in ${selected.name}! 🎉`)
            await refreshUser()
            setSelected(null)
            load()
        } catch (err) {

        handleApiError(err, 'Investment failed')
        } finally {
            setBuying(false)
        }
    }

    const totalReturn = (p) => +(p.dailyIncome * p.cycleDays).toFixed(2)
    const roi = (p) =>
        p.amount > 0 ? +((totalReturn(p) / p.amount) * 100).toFixed(1) : 0

    // Check how many active units the user owns for a given product
    const ownedCount = (product) => {
        return myInvests.filter((investment) => {
            // Case 1: product field is populated (has _id)
            const productId = investment.product?._id || investment.product
            if (productId) return productId === product._id
            // Case 2: product is null – fallback to productSnapshot.name
            return investment.productSnapshot?.name === product.name
        }).length
    }

    // Products for "My Active" tab: only those the user owns at least one unit of
    const displayProducts =
        activeTab === 'active'
            ? products.filter((p) => ownedCount(p) > 0)
            : products

    return (
        <div className='min-h-dvh bg-surface pb-28'>
            {/* Header */}
            <div
                style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}
                className='px-4 pt-12 pb-6 relative overflow-hidden'
            >
                <div className='absolute -right-6 -top-6 w-36 h-36 rounded-full bg-white/10 blur-2xl pointer-events-none' />
                <div className='relative'>
                    <h1 className='text-white text-xl font-extrabold'>Invest</h1>
                    <p className='text-surface text-xs mt-0.5'>
                        Choose a product and start earning daily
                    </p>

                    {myInvests.length > 0 && (
                        <div className='mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1.5'>
                            <Zap size={12} className='text-yellow-300' />
                            <span className='text-white text-xs font-bold'>
                                {myInvests.length} active investment{myInvests.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className='flex gap-1 mx-4 mt-4 bg-white rounded-2xl p-1 shadow-card'>
                {[
                    { key: 'all', label: `All (${products.length})` },
                    { key: 'active', label: `My Active (${myInvests.length})` },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                        ${
                            activeTab === t.key
                                ? 'bg-primary text-white shadow-[0_2px_8px_rgba(26,159,212,0.35)]'
                                : 'text-gray-400'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* My Investments quick link */}
            <button
                onClick={() => navigate('/main/invest-log')}
                className='mx-4 mt-3 w-[calc(100%-2rem)] flex items-center justify-between
                           bg-white rounded-2xl px-4 py-3 shadow-card border border-gray-50
                           active:scale-[0.99] transition-transform'
            >
                <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center'>
                        <TrendingUp size={14} className='text-primary' />
                    </div>
                    <span className='text-sm font-bold text-gray-700'>
                        Investment Records
                    </span>
                </div>
                <ChevronRight size={15} className='text-gray-300' />
            </button>

            {/* Product list */}
            <div className='px-4 mt-4 space-y-4'>
                {loading ? (
                    <Spinner />
                ) : displayProducts.length === 0 ? (
                    <div className='text-center py-16 text-gray-400'>
                        <Package size={40} className='mx-auto mb-3 opacity-30' />
                        <p className='text-sm font-medium'>
                            {activeTab === 'active'
                                ? 'No active investments yet'
                                : 'No products available'}
                        </p>
                        {activeTab === 'active' && (
                            <button
                                onClick={() => setActiveTab('all')}
                                className='text-primary text-sm font-bold mt-2'
                            >
                                Browse products →
                            </button>
                        )}
                    </div>
                ) : (
                    displayProducts.map((p, i) => {
                        const soldOut = p.availableUnits <= 0
                        const owned = ownedCount(p)
                        const canBuy = !soldOut && owned < p.maxUnits

                        const tier =
                            p.amount === 0
                                ? 'free'
                                : p.amount <= 30
                                ? 'bronze'
                                : p.amount <= 100
                                ? 'silver'
                                : 'gold'

                        const TIER_STYLE = {
                            free: {
                                grad: 'from-emerald-500 to-teal-400',
                                badge: 'bg-emerald-100 text-emerald-700',
                                label: '⭐ Free Trial',
                            },
                            bronze: {
                                grad: 'from-primary to-blue-400',
                                badge: 'bg-blue-100 text-blue-700',
                                label: '🔵 Starter',
                            },
                            silver: {
                                grad: 'from-violet-500 to-purple-400',
                                badge: 'bg-violet-100 text-violet-700',
                                label: '💜 Popular',
                            },
                            gold: {
                                grad: 'from-amber-500 to-orange-400',
                                badge: 'bg-amber-100 text-amber-700',
                                label: '🏆 Premium',
                            },
                        }[tier]

                        return (
                            <div
                                key={p._id}
                                className='card overflow-hidden animate-slide-up'
                                style={{ animationDelay: `${i * 0.06}s` }}
                            >
                                {/* Top strip */}
                                <div
                                    className={`bg-linear-to-r ${TIER_STYLE.grad} px-4 py-3 flex items-center justify-between`}
                                >
                                    <div className='flex items-center gap-2'>
                                        {p.image ? (
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className='w-10 h-10 rounded-xl object-cover border-2 border-white/40'
                                            />
                                        ) : (
                                            <div className='w-10 h-10 rounded-xl bg-white/20 border-2 border-white/30 flex items-center justify-center'>
                                                <Package size={18} className='text-white/80' />
                                            </div>
                                        )}
                                        <div>
                                            <p className='text-white font-extrabold text-sm leading-tight'>
                                                {p.name}
                                            </p>
                                            <span
                                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TIER_STYLE.badge}`}
                                            >
                                                {TIER_STYLE.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status pill */}
                                    {soldOut ? (
                                        <span className='bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-full'>
                                            Sold Out
                                        </span>
                                    ) : p.isFree ? (
                                        <span className='bg-white text-emerald-600 text-[10px] font-extrabold px-2.5 py-1 rounded-full'>
                                            FREE
                                        </span>
                                    ) : (
                                        <span className='bg-white/20 border border-white/30 text-white text-[10px] font-bold px-2 py-1 rounded-full'>
                                            {p.availableUnits} left
                                        </span>
                                    )}
                                </div>

                                {/* Body */}
                                <div className='p-4'>
                                    <div className='grid grid-cols-2 gap-3 mb-4'>
                                        {[
                                            {
                                                icon: '💰',
                                                label: 'Cost',
                                                val: p.isFree ? 'Free' : fmtUSD(p.amount),
                                                bold: !p.isFree,
                                            },
                                            {
                                                icon: '📈',
                                                label: 'Daily Income',
                                                val: fmtUSD(p.dailyIncome),
                                                bold: true,
                                            },
                                            {
                                                icon: '📅',
                                                label: 'Cycle',
                                                val: `${p.cycleDays} days`,
                                                bold: false,
                                            },
                                            {
                                                icon: '🎯',
                                                label: 'Total Return',
                                                val: fmtUSD(totalReturn(p)),
                                                bold: true,
                                            },
                                        ].map(({ icon, label, val, bold }) => (
                                            <div key={label} className='bg-gray-50 rounded-xl p-3'>
                                                <p className='text-[10px] text-gray-400 font-medium mb-1'>
                                                    {icon} {label}
                                                </p>
                                                <p
                                                    className={`text-sm ${bold ? 'font-extrabold text-primary' : 'font-bold text-gray-700'}`}
                                                >
                                                    {val}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {!p.isFree && (
                                        <div className='mb-4'>
                                            <div className='flex justify-between text-[10px] text-gray-400 mb-1.5'>
                                                <span>
                                                    ROI: <strong className='text-success'>{roi(p)}%</strong>
                                                </span>
                                                <span>
                                                    Max {p.maxUnits} unit{p.maxUnits !== 1 ? 's' : ''}/person
                                                </span>
                                            </div>
                                            <div className='h-1.5 bg-gray-100 rounded-full overflow-hidden'>
                                                <div
                                                    className='h-full bg-linear-to-r from-success to-emerald-400 rounded-full'
                                                    style={{ width: `${Math.min(roi(p), 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {owned > 0 && (
                                        <div className='flex items-center gap-1.5 mb-3 bg-success-light rounded-xl px-3 py-2'>
                                            <Star size={12} className='text-success fill-success' />
                                            <span className='text-xs text-success font-bold'>
                                                You own {owned} active unit{owned !== 1 ? 's' : ''}
                                                {owned >= p.maxUnits ? ' (max reached)' : ''}
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => canBuy && setSelected(p)}
                                        disabled={!canBuy}
                                        className={`w-full py-3.5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2
                                            transition-all duration-150 active:scale-[0.98]
                                            ${
                                                !canBuy
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : `bg-linear-to-r ${TIER_STYLE.grad} text-white shadow-[0_4px_16px_rgba(26,159,212,0.3)]`
                                            }`}
                                    >
                                        {soldOut ? (
                                            '🔴 Sold Out'
                                        ) : owned >= p.maxUnits ? (
                                            '✅ Max Units Reached'
                                        ) : (
                                            <>
                                                <ShoppingCart size={15} /> Invest Now —{' '}
                                                {p.isFree ? 'Free' : fmtUSD(p.amount)}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Confirm Modal */}
            <Modal
                isOpen={!!selected}
                onClose={() => !buying && setSelected(null)}
                title='Confirm Investment'
            >
                {selected && (
                    <div className='space-y-4'>
                        <div className='flex items-center gap-3 bg-primary-light rounded-2xl p-3'>
                            <div className='w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm'>
                                {selected.image ? (
                                    <img
                                        src={selected.image}
                                        alt=''
                                        className='w-full h-full rounded-2xl object-cover'
                                    />
                                ) : (
                                    <Package size={20} className='text-primary/50' />
                                )}
                            </div>
                            <div>
                                <p className='font-extrabold text-gray-800 text-sm'>{selected.name}</p>
                                <p className='text-xs text-primary font-medium mt-0.5'>
                                    {selected.cycleDays}-day investment
                                </p>
                            </div>
                        </div>

                        <div className='space-y-2.5'>
                            {[
                                {
                                    label: 'Investment cost',
                                    val: selected.isFree ? 'Free' : fmtUSD(selected.amount),
                                    highlight: true,
                                },
                                {
                                    label: 'Daily income',
                                    val: fmtUSD(selected.dailyIncome),
                                },
                                {
                                    label: 'Cycle duration',
                                    val: `${selected.cycleDays} days`,
                                },
                                {
                                    label: 'Total return',
                                    val: fmtUSD(totalReturn(selected)),
                                    highlight: true,
                                },
                                { label: 'ROI', val: `${roi(selected)}%` },
                            ].map(({ label, val, highlight }) => (
                                <div
                                    key={label}
                                    className='flex justify-between items-center py-2 border-b border-gray-50 last:border-0'
                                >
                                    <span className='text-sm text-gray-400 font-medium'>{label}</span>
                                    <span className={`text-sm font-extrabold ${highlight ? 'text-primary' : 'text-gray-800'}`}>
                                        {val}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <p className='text-xs text-gray-400 text-center bg-gray-50 rounded-xl p-2.5'>
                            {selected.isFree
                                ? '✨ No balance deducted — this is a free trial product'
                                : `💳 ${fmtUSD(selected.amount)} will be deducted from your wallet`}
                        </p>

                        <div className='flex gap-3'>
                            <button
                                onClick={() => setSelected(null)}
                                disabled={buying}
                                className='flex-1 py-3.5 rounded-2xl border-2 border-gray-200 text-gray-500
                                           text-sm font-bold active:scale-95 transition-transform disabled:opacity-50'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBuy}
                                disabled={buying}
                                className='flex-1 btn btn-primary rounded-2xl h-13 text-sm'
                            >
                                {buying ? (
                                    <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow' />
                                ) : (
                                    'Confirm ✓'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default Invest