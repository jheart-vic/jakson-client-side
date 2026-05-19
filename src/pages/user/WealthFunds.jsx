import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock3, AlertCircle, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/layout/PageHeader'
import { getWealthFunds, buyWealthFund, getMyWealthFunds } from '../../api/wealthFund'
import { fmtUSD } from '../../utils/currency'
import Spinner from '../../components/common/Spinner'
import { useAuth } from '../../context/AuthContext'

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
      toast.error('Failed to load wealth funds')
    } finally {
      setLoading(false)
    }
  }, [])

useEffect(() => { ;(async () => { await loadData() })() }, [loadData])

  const hasActiveInvestment = (fundId) => {
    return userInvestments.some((inv) => {
      const investedFundId = inv.wealthFund?._id || inv.wealthFund
      return investedFundId === fundId && !inv.isClaimed && inv.status === 'in_progress'
    })
  }

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
      toast.success('Wealth fund purchased successfully!')
      await refreshUser()
      navigate('/main/wealth-fund/me')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Purchase failed')
    } finally {
      setBuyingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-surface">
        <PageHeader
          title="Wealth Funds"
          right={
            <button
              onClick={() => navigate('/main/wealth-fund/me')}
              className="text-white text-sm font-bold bg-white/20 px-3 py-1.5 rounded-full"
            >
              My Funds
            </button>
          }
        />
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-24 bg-surface">
      <PageHeader
        title="Wealth Funds"
        right={
          <button
            onClick={() => navigate('/main/wealth-fund/me')}
            className="text-white text-sm font-bold bg-white/20 px-3 py-1.5 rounded-full"
          >
            My Funds
          </button>
        }
      />
      <div className="p-4 space-y-4">
        {funds.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <AlertCircle size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No wealth funds available</p>
            <button
              onClick={() => navigate('/main/dashboard')}
              className="mt-3 text-primary text-sm font-bold"
            >
              Back to Dashboard →
            </button>
          </div>
        ) : (
          funds.map((fund) => {
            const comingSoon = !fund.isActive
            const buttonDisabled = isButtonDisabled(fund)
            const buttonText = getButtonText(fund)

            return (
              <div key={fund._id || fund.id} className="card card-p rounded-3xl animate-slide-up">
                {/* Image + header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 rounded-xl bg-primary-light flex items-center justify-center overflow-hidden shrink-0">
                    {fund.image ? (
                      <img
                        src={fund.image}
                        alt={fund.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={24} className="text-primary" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-lg text-gray-800">{fund.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Clock3 size={14} /> {fund.durationType} plan · {fund.durationDays} days
                        </p>
                      </div>
                      {comingSoon && (
                        <span className="bg-gray-200 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-gray-400">Investment</p>
                    <p className="font-bold text-gray-800">{fmtUSD(fund.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Maturity Value</p>
                    <p className="font-bold text-primary">{fmtUSD(fund.maturityAmount)}</p>
                  </div>
                </div>

                <button
                  onClick={() => !comingSoon && !hasActiveInvestment(fund._id || fund.id) && handleBuy(fund._id || fund.id)}
                  disabled={buttonDisabled}
                  className={`btn rounded-2xl ${!buttonDisabled ? 'btn-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                >
                  {buyingId === (fund._id || fund.id) ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                  ) : (
                    buttonText
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