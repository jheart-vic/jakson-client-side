import { useEffect, useState, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { Calendar, Gift } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { getMyWealthFunds, claimWealthFund } from '../../api/wealthFund'
import { fmtUSD } from '../../utils/currency'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { handleApiError } from '../../utils/errorHandler'

const MyFundCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card border border-gray-50 p-4">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton circle width={44} height={44} />
      <div className="flex-1">
        <Skeleton width={140} height={15} />
        <Skeleton width={90} height={11} className="mt-1.5" />
      </div>
      <Skeleton width={68} height={24} borderRadius={20} />
    </div>
    <div className="grid grid-cols-2 gap-2 mb-3">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-gray-50 rounded-xl p-3">
          <Skeleton width={50} height={10} />
          <Skeleton width={70} height={15} className="mt-1" />
        </div>
      ))}
    </div>
    <Skeleton height={44} borderRadius={14} />
  </div>
)

export default function MyWealthFunds() {
  const [funds, setFunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState(null)
  const now = useMemo(() => new Date(), [])
  const { refreshUser } = useAuth()

  const loadFunds = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getMyWealthFunds()
      let fundsArray = result
      if (result?.funds) fundsArray = result.funds
      else if (result?.data?.funds) fundsArray = result.data.funds
      setFunds(fundsArray || [])
    } catch (err) {
      console.error(err)
      handleApiError(err, 'Failed to load your wealth funds')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { ;(async () => { await loadFunds() })() }, [loadFunds])

  const handleClaim = async (investmentId) => {
    setClaimingId(investmentId)
    try {
      await claimWealthFund(investmentId)
      toast.success('Fund claimed successfully!')
      await refreshUser()
      await loadFunds()
    } catch (err) {
      handleApiError(err, 'Claim failed')
    } finally {
      setClaimingId(null)
    }
  }

  const statusOf = (inv) => {
    if (inv.isClaimed)
      return { label: 'Claimed', color: 'text-gray-400', bg: 'bg-gray-100' }
    // API field is maturityDate, not maturesAt
    const maturity = new Date(inv.maturityDate || inv.maturesAt)
    if (inv.status === 'matured' || maturity <= now)
      return { label: '✅ Matured', color: 'text-success', bg: 'bg-success-light' }
    return { label: 'In Progress', color: 'text-primary', bg: 'bg-primary-light' }
  }

  return (
    <div className="min-h-dvh pb-8">
      <PageHeader title="My Wealth Funds" />
      <div className="px-4 mt-4 space-y-4">
        {loading
          ? [...Array(3)].map((_, i) => <MyFundCardSkeleton key={i} />)
          : funds.length === 0
            ? <EmptyState message="No wealth fund investments yet" icon="💎" />
            : funds.map((inv, i) => {
                // Fund details live in fundSnapshot (wealthFund is a bare ID string)
                const fund = inv.fundSnapshot || (typeof inv.wealthFund === 'object' ? inv.wealthFund : {})

                const status = statusOf(inv)

                // Use maturityDate (API field); fall back to maturesAt for safety
                const maturityDate = new Date(inv.maturityDate || inv.maturesAt)
                const isValidDate = !isNaN(maturityDate.getTime())

                const matured = !inv.isClaimed && isValidDate && maturityDate <= now
                const daysLeft = isValidDate
                  ? Math.max(0, Math.ceil((maturityDate - now) / 86400000))
                  : null

                return (
                  <div
                    key={inv._id}
                    className="bg-white rounded-2xl shadow-card border border-gray-50 p-4 animate-slide-up"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-4">
                      {fund.image ? (
                        <img
                          src={fund.image}
                          alt={fund.name}
                          className="w-11 h-11 rounded-2xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-primary-light flex items-center justify-center shrink-0">
                          <span className="text-xl">💰</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-gray-800 text-sm truncate">
                          {fund.name || 'Wealth Fund'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {fund.durationDays}d · {fmtUSD(fund.maturityAmount ?? inv.maturityAmount ?? 0)} maturity
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full shrink-0 ${status.color} ${status.bg}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Calendar size={10} className="text-gray-400" />
                          <p className="text-[10px] text-gray-400 font-medium">Matures</p>
                        </div>
                        <p className="text-sm font-bold text-gray-700">
                          {isValidDate
                            ? maturityDate.toLocaleDateString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })
                            : '—'}
                        </p>
                        {!matured && !inv.isClaimed && daysLeft !== null && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{daysLeft}d remaining</p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Gift size={10} className="text-gray-400" />
                          <p className="text-[10px] text-gray-400 font-medium">Payout</p>
                        </div>
                        <p className="text-sm font-extrabold text-primary">
                          {fmtUSD(fund.maturityAmount ?? inv.maturityAmount ?? 0)}
                        </p>
                      </div>
                    </div>

                    {/* Action button */}
                    {matured ? (
                      <button
                        onClick={() => handleClaim(inv._id)}
                        disabled={claimingId === inv._id}
                        className="w-full py-3.5 rounded-2xl bg-success text-white text-sm font-extrabold active:scale-[0.98] transition-all disabled:opacity-60"
                      >
                        {claimingId === inv._id ? 'Claiming…' : '🎉 Claim Payout'}
                      </button>
                    ) : inv.isClaimed ? (
                      <div className="w-full py-3 rounded-2xl bg-gray-50 text-center text-sm font-bold text-gray-400">
                        ✓ Claimed
                      </div>
                    ) : (
                      <div className="w-full py-3 rounded-2xl bg-primary-light text-center text-sm font-bold text-primary">
                        ⏳ {daysLeft !== null ? `${daysLeft} days remaining` : 'In Progress'}
                      </div>
                    )}
                  </div>
                )
              })}
      </div>
    </div>
  )
}