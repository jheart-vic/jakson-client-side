import { useState } from 'react'
import { useCallback } from 'react'
import { useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import { getMyInvestments, claimInvestmentIncome } from '../../api/invest'
import { fmtUSD } from '../../utils/currency'
import { fmtDateTime } from '../../utils/date'
import PageHeader from '../../components/layout/PageHeader'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import { handleApiError } from '../../utils/errorHandler'
import toast from 'react-hot-toast'

const STATUS_MAP = {
  in_progress: { label: 'In Progress', color: 'text-primary', bg: 'bg-primary-light', icon: Clock },
  completed:   { label: 'Completed',   color: 'text-success', bg: 'bg-success-light', icon: CheckCircle2 },
  cancelled:   { label: 'Cancelled',   color: 'text-danger',  bg: 'bg-danger-light',  icon: XCircle },
}

const fmtExpiry = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// Count only Mon-Fri days between now and expiryDate
const weekdaysRemaining = (expiryDate) => {
  if (!expiryDate) return 0
  const now    = new Date(); now.setHours(0,0,0,0)
  const expiry = new Date(expiryDate); expiry.setHours(0,0,0,0)
  if (expiry <= now) return 0
  let count = 0
  const cursor = new Date(now)
  while (cursor < expiry) {
    cursor.setDate(cursor.getDate() + 1)
    const dow = cursor.getDay()
    if (dow !== 0 && dow !== 6) count++
  }
  return count
}

// Skeleton that mirrors the exact card layout below
const InvestCardSkeleton = () => (
  <div className="card">
    <div className="p-4">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="min-w-0">
          <Skeleton width={150} height={14} />
          <Skeleton width={90} height={20} borderRadius={20} className="mt-1.5" />
        </div>
        <div className="shrink-0 text-right">
          <Skeleton width={40} height={10} />
          <Skeleton width={80} height={13} className="mt-1" />
        </div>
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-2.5">
            <Skeleton width={60} height={10} />
            <Skeleton width={80} height={14} className="mt-1" />
          </div>
        ))}
      </div>
      {/* Progress bar */}
      <Skeleton width={120} height={10} className="mb-1" />
      <Skeleton height={6} borderRadius={99} />
    </div>
  </div>
)

const InvestLog = () => {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  // Keyed by investment _id — each card has its own loading state
  const [claiming, setClaiming] = useState({}) // { [invId]: boolean }

  const load = useCallback(async () => {
    try { const { data } = await getMyInvestments(); setItems(data.investments) }
    catch (err) { handleApiError(err, 'Failed to load investment records') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { (async () => { await load() })() }, [load])

  // Each investment is claimed independently.
  // Only that card's button shows a spinner; others remain interactive.
  const handleClaim = async (invId, productName) => {
    setClaiming(prev => ({ ...prev, [invId]: true }))
    try {
      const { data } = await claimInvestmentIncome(invId)
      toast.success(`${productName}: +${fmtUSD(data.amountClaimed)} claimed! 💰`)
      await load() // wait for fresh data before re-enabling this button
    } catch (err) {
      handleApiError(err, 'Nothing to claim right now')
    } finally {
      setClaiming(prev => ({ ...prev, [invId]: false }))
    }
  }

  return (
    <div className="min-h-dvh pb-8">
      <PageHeader title="Investment Records" />

      <div className="px-4 mt-4 space-y-3">
        {loading
          ? [...Array(3)].map((_, i) => <InvestCardSkeleton key={i} />)
          : items.length === 0
          ? <EmptyState message="No investments yet" icon="📊" />
          : items.map((inv, i) => {
            const s              = STATUS_MAP[inv.status] || STATUS_MAP.in_progress
            const StatusIcon     = s.icon
            const days           = weekdaysRemaining(inv.expirationDate)
            const totalDays      = inv.productSnapshot?.cycleDays || 1
            const progress       = (inv.daysElapsed / totalDays) * 100
            const clampedPct     = Math.min(100, Math.max(0, progress))
            const isExpiringSoon = inv.status === 'in_progress' && days <= 3
            const isThisClaiming = !!claiming[inv._id]

            return (
              <div key={inv._id} className="card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="p-4">

                  {/* ── Card header ── */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="min-w-0">
                      <p className="font-extrabold text-gray-800 text-sm leading-tight truncate">
                        {inv.productSnapshot?.name}
                      </p>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-1 ${s.bg}`}>
                        <StatusIcon size={10} className={s.color} />
                        <span className={`text-[10px] font-bold ${s.color}`}>{s.label}</span>
                      </div>
                    </div>

                    {/* Expiry top-right */}
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400 leading-tight">
                        {inv.status === 'in_progress' ? 'Expires' : 'Expired'}
                      </p>
                      <p
                        className="text-[11px] font-extrabold mt-0.5"
                        style={{ color: isExpiringSoon ? '#DC5F5F' : '#5C5652' }}
                      >
                        {fmtExpiry(inv.expirationDate)}
                      </p>
                      {isExpiringSoon && (
                        <p className="text-[9px] font-bold text-red-400 mt-0.5">
                          {days === 0 ? 'Today!' : `${days}d left`}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── Stats grid ── */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                      { label: 'Investment',   val: fmtUSD(inv.investmentAmount) },
                      { label: 'Daily income', val: fmtUSD(inv.dailyIncome)      },
                      { label: 'Total earned', val: fmtUSD(inv.totalEarned)      },
                      { label: 'Started',      val: fmtDateTime(inv.startDate)   },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── Progress + claim (in_progress only) ── */}
                  {inv.status === 'in_progress' && (
                    <>
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>Day {inv.daysElapsed} of {totalDays}</span>
                          <span>{clampedPct.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-700"
                            style={{ width: `${clampedPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Claim button — shown when this investment has pending income */}
                      {inv.pendingIncome > 0 && (
                        <div
                          className="mt-3 flex items-center justify-between rounded-2xl px-3 py-2.5"
                          style={{ background: 'rgba(220,95,95,0.10)', border: '1px solid rgba(220,95,95,0.25)' }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">⏰</span>
                            <div>
                              <p className="text-xs font-extrabold" style={{ color: '#DC5F5F' }}>
                                {fmtUSD(inv.pendingIncome)} to claim
                              </p>
                              <p className="text-[10px] font-medium text-gray-400">
                                {days > 0
                                  ? `${days} weekday${days === 1 ? '' : 's'} left · Forfeited tomorrow morning`
                                  : 'Forfeited tomorrow morning'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleClaim(inv._id, inv.productSnapshot?.name)}
                            disabled={isThisClaiming}
                            className="text-xs font-extrabold px-4 py-2 rounded-xl active:scale-95 transition-transform disabled:opacity-60 text-white"
                            style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}
                          >
                            {isThisClaiming
                              ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin-slow inline-block" />
                              : 'Claim'
                            }
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default InvestLog