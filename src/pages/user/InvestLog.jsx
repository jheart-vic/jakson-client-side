import { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line no-unused-vars
import { Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import { getMyInvestments, claimDailyIncome } from '../../api/invest'
import { fmtUSD } from '../../utils/currency'
import { fmtDateTime } from '../../utils/date'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/common/Spinner'
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
    if (dow !== 0 && dow !== 6) count++ // skip Sun(0) and Sat(6)
  }
  return count
}

const InvestLog = () => {
  const [items,    setItems]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [claiming, setClaiming] = useState(false)

  const load = useCallback(async () => {
    try { const { data } = await getMyInvestments(); setItems(data.investments) }
    catch (err) { handleApiError(err, 'Failed to load investment records') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { (async () => { await load() })() }, [load])

  // All investments share the same user-level pending pool — one claim clears all
  const handleClaim = async () => {
    setClaiming(true)
    try {
      const { data } = await claimDailyIncome()
      toast.success(`Claimed! +${fmtUSD(data.amountClaimed)} 💰`)
      load() // reload to reflect cleared pendingIncome on each card
    } catch (err) {
      handleApiError(err, 'Nothing to claim right now')
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <PageHeader title="Investment Records" />

      <div className="px-4 mt-4 space-y-3">
        {loading ? <Spinner /> : items.length === 0
          ? <EmptyState message="No investments yet" icon="📊" />
          : items.map((inv, i) => {
            const s              = STATUS_MAP[inv.status] || STATUS_MAP.in_progress
            const StatusIcon     = s.icon
            const days           = weekdaysRemaining(inv.expirationDate)
            const totalDays      = inv.productSnapshot?.cycleDays || 1
            const progress       = (inv.daysElapsed / totalDays) * 100
            const clampedPct     = Math.min(100, Math.max(0, progress))
            const isExpiringSoon = inv.status === 'in_progress' && days <= 3

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
                                  ? `${days} weekday${days === 1 ? '' : 's'} left · Forfeited at midnight`
                                  : 'Forfeited at midnight'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleClaim}
                            disabled={claiming}
                            className="text-xs font-extrabold px-4 py-2 rounded-xl active:scale-95 transition-transform disabled:opacity-60 text-white"
                            style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}
                          >
                            {claiming
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