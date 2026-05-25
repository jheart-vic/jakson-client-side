import { useState, useEffect, useCallback } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { getTransactions } from '../../api/wallet'
import { fmtUSD } from '../../utils/currency'
import { fmtDateTime } from '../../utils/date'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'

const TABS = [
  { key: '',    label: 'All' },
  { key: 'in',  label: 'In'  },
  { key: 'out', label: 'Out' },
]

const CATEGORY_LABELS = {
  deposit:        'Deposit',
  withdrawal:     'Withdrawal',
  investment:     'Investment',
  daily_income:   'Daily Income',
  referral_bonus: 'Referral Bonus',
  reward_code:    'Reward Code',
  daily_checkin:  'Daily Check-in',
  refund:         'Refund',
}

const FundingDetails = () => {
  const [tab, setTab]         = useState('')
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (type) => {
    setLoading(true)
    try {
      const params = type ? { type } : {}
      const { data } = await getTransactions(params)
      setItems(data.transactions)
    // eslint-disable-next-line no-empty
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { ;(async () => { await load(tab) })() }, [load, tab])

  return (
    <div className="min-h-dvh pb-8">
      <PageHeader title="Funding Details" />

      {/* Tabs */}
      <div className="flex gap-1 mx-4 mt-4 bg-white rounded-2xl p-1 shadow-card">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all
              ${tab === t.key
                ? 'bg-primary text-white shadow-[0_2px_8px_rgba(26,159,212,0.3)]'
                : 'text-gray-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4 space-y-3">
        {loading ? <Spinner /> : items.length === 0
          ? <EmptyState message="No transactions yet" icon="📋" />
          : items.map((tx, i) => {
            const isIn = tx.type === 'in'
            return (
              <div key={tx._id} className="card animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="p-4 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0
                    ${isIn ? 'bg-success-light' : 'bg-danger-light'}`}>
                    {isIn
                      ? <ArrowDownLeft size={18} className="text-success" />
                      : <ArrowUpRight  size={18} className="text-danger"  />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      {CATEGORY_LABELS[tx.category] || tx.category}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{tx.description || fmtDateTime(tx.createdAt)}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">{fmtDateTime(tx.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-extrabold text-base ${isIn ? 'text-success' : 'text-danger'}`}>
                      {isIn ? '+' : '-'}{fmtUSD(tx.amountUSD)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Bal: {fmtUSD(tx.balanceAfter)}</p>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default FundingDetails
