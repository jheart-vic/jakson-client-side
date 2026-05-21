import { useEffect, useState, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { Calendar, Gift, } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'
import { getMyWealthFunds, claimWealthFund } from '../../api/wealthFund'
import { fmtUSD } from '../../utils/currency'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import { useAuth } from '../../context/AuthContext'
import { handleApiError } from '../../utils/errorHandler'

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
      // Extract array from possible wrappers
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

  if (loading) {
    return (
      <div className="min-h-dvh bg-surface">
        <PageHeader title="My Wealth Funds" />
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-24 bg-surface">
      <PageHeader title="My Wealth Funds" />
      <div className="p-4 space-y-4">
        {funds.length === 0 ? (
          <EmptyState
            message="You haven't invested in any wealth fund yet"
            icon={<Gift size={48} className="text-gray-300" />}
          />
        ) : (
          funds.map((fund) => {
            const mature = new Date() >= new Date(fund.maturityDate)
            const canClaim = mature && !fund.isClaimed
            const daysLeft = !mature
              ? Math.ceil((new Date(fund.maturityDate) - new Date()) / (1000 * 60 * 60 * 24))
              : 0

            return (
              <div key={fund._id} className="card card-p rounded-2xl animate-slide-up">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-extrabold text-gray-800">
                      {fund.fundSnapshot?.name || 'Wealth Fund'}
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Calendar size={12} /> Purchased {new Date(fund.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-bold
                    ${fund.isClaimed
                      ? 'bg-success-light text-success'
                      : mature
                      ? 'bg-primary-light text-primary'
                      : 'bg-gray-100 text-gray-500'}`}>
                    {fund.isClaimed ? 'Claimed' : mature ? 'Ready' : `${daysLeft} days left`}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-400">Invested</p>
                    <p className="font-bold text-gray-800">{fmtUSD(fund.investmentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Maturity Value</p>
                    <p className="font-bold text-primary">{fmtUSD(fund.maturityAmount)}</p>
                  </div>
                </div>

                {!fund.isClaimed && !mature && (
                  <div className="mb-4">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(0,
                            ((now - new Date(fund.startDate)) /
                            (new Date(fund.maturityDate) - new Date(fund.startDate))) * 100
                          ))}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleClaim(fund._id)}
                  disabled={!canClaim || claimingId === fund._id}
                  className={`w-full py-3 rounded-2xl text-sm font-bold transition-all
                    ${canClaim
                      ? 'btn-primary shadow-[0_4px_12px_rgba(198,123,44,0.3)]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {claimingId === fund._id ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                  ) : fund.isClaimed ? (
                    '✓ Claimed'
                  ) : canClaim ? (
                    'Claim Now 🎉'
                  ) : (
                    `Unlocks in ${daysLeft} days`
                  )}
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}