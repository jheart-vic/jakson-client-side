import { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line no-unused-vars
import { Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react'
import { getMyInvestments } from '../../api/invest'
import { fmtUSD } from '../../utils/currency'
import { fmtDateTime, daysRemaining } from '../../utils/date'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'

const STATUS_MAP = {
  in_progress: { label: 'In Progress', color: 'text-primary',  bg: 'bg-primary-light',  icon: Clock },
  completed:   { label: 'Completed',   color: 'text-success',  bg: 'bg-success-light',  icon: CheckCircle2 },
  cancelled:   { label: 'Cancelled',   color: 'text-danger',   bg: 'bg-danger-light',   icon: XCircle },
}

const InvestLog = () => {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try { const { data } = await getMyInvestments(); setItems(data.investments) }
    catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { (async () => { await load() })() }, [load])

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <PageHeader title="Investment Records" />

      <div className="px-4 mt-4 space-y-3">
        {loading ? <Spinner /> : items.length === 0
          ? <EmptyState message="No investments yet" icon="📊" />
          : items.map((inv, i) => {
            const s = STATUS_MAP[inv.status] || STATUS_MAP.in_progress
            const StatusIcon = s.icon
            const days = daysRemaining(inv.expirationDate)
            const totalDays = inv.productSnapshot?.cycleDays || 1
            const progress = (inv.daysElapsed / totalDays) * 100
            const clampedProgress = Math.min(100, Math.max(0, progress))

            return (
              <div key={inv._id} className="card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-extrabold text-gray-800 text-sm">{inv.productSnapshot?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(inv.startDate)}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${s.bg}`}>
                      <StatusIcon size={11} className={s.color} />
                      <span className={`text-[10px] font-bold ${s.color}`}>{s.label}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {[
                      { label: 'Investment',  val: fmtUSD(inv.investmentAmount) },
                      { label: 'Daily income',val: fmtUSD(inv.dailyIncome) },
                      { label: 'Total earned',val: fmtUSD(inv.totalEarned) },
                      { label: inv.status === 'in_progress' ? 'Days left' : 'Expires',
                        val: inv.status === 'in_progress' ? `${days} days` : fmtDateTime(inv.expirationDate) },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">{val}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  {inv.status === 'in_progress' && (
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Day {inv.daysElapsed} of {totalDays}</span>
                        <span>{clampedProgress.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700"
                          style={{ width: `${clampedProgress}%` }} />
                      </div>
                    </div>
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