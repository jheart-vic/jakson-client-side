import { useState, useEffect, useCallback } from 'react'
import { getDepositLog } from '../../api/deposit'
import { fmtUSD, fmtNGN } from '../../utils/currency'
import { fmtDateTime } from '../../utils/date'
import PageHeader from '../../components/layout/PageHeader'
import StatusBadge from '../../components/common/StatusBadge'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'

const DepositLog = () => {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try { const { data } = await getDepositLog(); setItems(data.deposits) }
    // eslint-disable-next-line no-empty
    catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { ;(async () => { await load() })() }, [load])

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <PageHeader title="Recharge Records" />
      <div className="px-4 mt-4 space-y-3">
        {loading ? <Spinner /> : items.length === 0
          ? <EmptyState message="No recharge records yet" icon="💳" />
          : items.map((d, i) => (
            <div key={d._id} className="card animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{d.method === 'bank' ? 'Bank Transfer' : d.method}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(d.createdAt)}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                  <span className="text-xl font-extrabold text-primary">{fmtUSD(d.amountUSD)}</span>
                  <span className="text-xs text-gray-400 font-medium">≈ {fmtNGN(d.amountNGN)}</span>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default DepositLog
