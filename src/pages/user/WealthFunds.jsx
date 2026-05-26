import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock3, AlertCircle, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/layout/PageHeader'
import { getWealthFunds, buyWealthFund, getMyWealthFunds } from '../../api/wealthFund'
import { fmtUSD } from '../../utils/currency'
import Skeleton from '../../components/common/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { handleApiError } from '../../utils/errorHandler'

const FundCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">
    <div className="bg-gray-100 px-4 py-4">
      <div className="flex items-center gap-3">
        <Skeleton circle width={48} height={48} baseColor="#e0ddd9" highlightColor="#eceae6" />
        <div>
          <Skeleton width={130} height={16} baseColor="#e0ddd9" highlightColor="#eceae6" />
          <Skeleton width={90} height={11} className="mt-1.5" baseColor="#e0ddd9" highlightColor="#eceae6" />
        </div>
      </div>
    </div>
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-3">
            <Skeleton width={40} height={10} />
            <Skeleton width={55} height={14} className="mt-1" />
          </div>
        ))}
      </div>
      <Skeleton height={44} borderRadius={14} />
    </div>
  </div>
)

export default function WealthFunds() {
  const navigate = useNavigate()
  const [funds, setFunds] = useState([])
  const [userInvestments, setUserInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [buyingId, setBuyingId] = useState(null)
  const { refreshUser } = useAuth()

  const loadData = useCallback(async () => {
    try {
      const [fundsRes, myFundsRes] = await Promise.all([
        getWealthFunds(),
        getMyWealthFunds(),
      ])
      let fundsArray = fundsRes?.funds || fundsRes?.data?.funds || fundsRes
      let myArray = myFundsRes?.funds || myFundsRes?.data?.funds || myFundsRes
      setFunds(fundsArray || [])
      setUserInvestments(myArray || [])
    } catch (err) {
      console.error(err)
      handleApiError(err, 'Failed to load wealth funds')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { ;(async () => { await loadData() })() }, [loadData])

  const hasActiveInvestment = (fundId) =>
    userInvestments.some((inv) => {
      const investedFundId = inv.wealthFund?._id || inv.wealthFund
      return investedFundId === fundId && !inv.isClaimed && inv.status === 'in_progress'
    })

  const getButtonText = (fund) => {
    if (!fund.isActive) return 'Coming Soon'
    if (hasActiveInvestment(fund._id || fund.id)) return 'Already Invested'
    return 'Buy Now'
  }

  const isButtonDisabled = (fund) => {
    if (!fund.isActive) return true
    if (hasActiveInvestment(fund._id || fund.id)) return true
    return buyingId === (fund._id || fund.id)
  }

  const handleBuy = async (fundId) => {
    setBuyingId(fundId)
    try {
      await buyWealthFund(fundId)
      toast.success('Wealth Fund purchased! 🎉')
      await refreshUser()
      await loadData()
    } catch (err) {
      handleApiError(err, 'Purchase failed')
    } finally {
      setBuyingId(null)
    }
  }

  const gradients = [
    'linear-gradient(135deg,#065f46,#10b981)',
    'linear-gradient(135deg,#0e6a8f,#1a9fd4)',
    'linear-gradient(135deg,#7c2d12,#f97316)',
    'linear-gradient(135deg,#4c1d95,#8b5cf6)',
  ]

  return (
    <div className="min-h-dvh pb-8">
      {/* PageHeader — keeps desktop nav button; we add our own visible button below */}
      <PageHeader
        title="Wealth Funds"
        action={{ label: 'My Funds', onClick: () => navigate('/main/my-wealth-funds/me') }}
      />

      {/* ── My Funds button — always visible on mobile AND desktop ── */}
      <div className="px-4 mt-4">
        <button
          onClick={() => navigate('/main/my-wealth-funds/me')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-extrabold active:scale-[0.98] transition-transform"
          style={{
            background: 'linear-gradient(135deg,#C67B2C,#9E5E1F)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(198,123,44,0.35)',
          }}
        >
          <Wallet size={15} strokeWidth={2.2} />
          My Wealth Funds
        </button>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-3 bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-2">
        <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-amber-700 text-xs leading-relaxed">
          Wealth Funds are long-term plans with a fixed maturity payout. Invest once and claim the full return when it matures.
        </p>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {loading
          ? [...Array(3)].map((_, i) => <FundCardSkeleton key={i} />)
          : funds.map((fund, i) => {
              const fundId = fund._id || fund.id
              const disabled = isButtonDisabled(fund)
              const btnText = buyingId === fundId ? 'Processing…' : getButtonText(fund)
              const grad = gradients[i % gradients.length]

              return (
                <div
                  key={fundId}
                  className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden animate-slide-up"
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {/* Top strip */}
                  <div className="px-4 py-4 flex items-center gap-3" style={{ background: grad }}>
                    {fund.image ? (
                      <img
                        src={fund.image}
                        alt={fund.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white/40 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0">
                        <span className="text-2xl">💰</span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-extrabold text-base leading-tight">{fund.name}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block
                          ${fund.isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60'}`}
                      >
                        {fund.isActive ? '⚡ Active' : '🔜 Coming Soon'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: '💰 Amount',   val: fmtUSD(fund.amount) },
                        { label: '📅 Duration', val: `${fund.durationDays}d` },
                        { label: '🎯 Maturity', val: fmtUSD(fund.maturityAmount) },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 font-medium mb-1">{label}</p>
                          <p className="text-sm font-extrabold text-primary">{val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                      <Clock3 size={12} />
                      <span>Matures after {fund.durationDays} days</span>
                    </div>

                    <button
                      onClick={() => !disabled && handleBuy(fundId)}
                      disabled={disabled}
                      className={`w-full py-3.5 rounded-2xl text-sm font-extrabold transition-all active:scale-[0.98]
                        ${disabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)]'}`}
                      style={disabled ? {} : { background: grad }}
                    >
                      {btnText}
                    </button>
                  </div>
                </div>
              )
            })}
      </div>
    </div>
  )
}