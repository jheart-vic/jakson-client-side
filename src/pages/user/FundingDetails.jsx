import { useState, useEffect, useCallback } from 'react'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { getTransactions } from '../../api/wallet'
import { fmtUSD } from '../../utils/currency'
import { fmtDateTime } from '../../utils/date'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/common/EmptyState'
import Skeleton from '../../components/common/Skeleton'

const TABS = [
  { key: '',    label: 'All' },
  { key: 'in',  label: 'In'  },
  { key: 'out', label: 'Out' },
]

// Matches every value in the Transaction schema enum
const CATEGORY_LABELS = {
  deposit:            'Deposit',
  withdrawal:         'Withdrawal',
  investment:         'Investment',
  daily_income:       'Daily Income',
  referral_bonus:     'Referral Bonus',
  team_commission:    'Team Commission',
  reward_code:        'Reward Code',
  daily_checkin:      'Daily Check-in',
  refund:             'Refund',
  wealth_fund:        'Wealth Fund',
  wealth_fund_payout: 'Wealth Fund Payout',
}

const TxSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-card border border-gray-50">
    <Skeleton circle width={40} height={40} />
    <div className="flex-1">
      <Skeleton width={120} height={13} />
      <Skeleton width={85} height={11} className="mt-1.5" />
    </div>
    <Skeleton width={65} height={16} />
  </div>
)

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
        {loading
          ? [...Array(6)].map((_, i) => <TxSkeleton key={i} />)
          : items.length === 0
            ? <EmptyState message="No transactions found" icon="📋" />
            : items.map((tx, i) => {
                const isIn = tx.type === 'in'
                const amount = tx.amountUSD ?? tx.amount ?? 0
                return (
                  <div key={tx._id}
                    className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-card border border-gray-50 animate-slide-up"
                    style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
                      ${isIn ? 'bg-success-light' : 'bg-danger-light'}`}>
                      {isIn
                        ? <ArrowDownLeft size={18} className="text-success" />
                        : <ArrowUpRight  size={18} className="text-danger"  />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {CATEGORY_LABELS[tx.category] || tx.category}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(tx.createdAt)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-sm font-extrabold ${isIn ? 'text-success' : 'text-danger'}`}>
                        {isIn ? '+' : '-'}{fmtUSD(amount)}
                      </p>
                      {tx.balanceAfter != null && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Bal: {fmtUSD(tx.balanceAfter)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
      </div>
    </div>
  )
}

export default FundingDetails