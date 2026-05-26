import { useState, useEffect, useCallback } from 'react'
import { getWithdrawalLog } from '../../api/withdraw'
import { fmtUSD, fmtNGN } from '../../utils/currency'
import { fmtDateTime } from '../../utils/date'
import PageHeader from '../../components/layout/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import Skeleton from '../../components/common/Skeleton'

const WithdrawCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-4">
    <div className="flex items-start justify-between mb-3">
      <div>
        <Skeleton width={130} height={14} />
        <Skeleton width={95} height={11} className="mt-1.5" />
      </div>
      <Skeleton width={68} height={24} borderRadius={20} />
    </div>
    <div className="grid grid-cols-3 gap-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-2.5 text-center">
          <Skeleton width={40} height={10} className="mx-auto" />
          <Skeleton width={55} height={13} className="mx-auto mt-1" />
        </div>
      ))}
    </div>
    <Skeleton width={90} height={11} className="mt-2" />
  </div>
)

const WithdrawLog = () => {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try { const { data } = await getWithdrawalLog(); setItems(data.withdrawals) }
    // eslint-disable-next-line no-empty
    catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { ;(async () => { await load() })() }, [load])

  return (
    <div className="min-h-dvh pb-8">
      <PageHeader title="Withdrawal Records" />
      <div className="px-4 mt-4 space-y-3">
        {loading
          ? [...Array(4)].map((_, i) => <WithdrawCardSkeleton key={i} />)
          : items.length === 0
            ? <EmptyState message="No withdrawal records yet" icon="💸" />
            : items.map((w, i) => (
              <div key={w._id} className="card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{w.bankSnapshot?.bankName || 'Bank Transfer'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(w.createdAt)}</p>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Gross',  val: fmtUSD(w.amountUSD),    color: 'text-gray-800' },
                      { label: `Fee ${w.feePercent}%`, val: fmtUSD(w.feeAmountUSD), color: 'text-danger' },
                      { label: 'Net',    val: fmtUSD(w.netAmountUSD), color: 'text-success' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                        <p className={`text-xs font-bold mt-0.5 ${color}`}>{val}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">≈ {fmtNGN(w.netAmountNGN)}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}

export default WithdrawLog
