import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, Lock, History, AlertCircle, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { createWithdrawal } from '../../api/withdraw'
import { getBankAccounts } from '../../api/bank'
import { getBalance } from '../../api/wallet'
import { fmtUSD, fmtNGN, toNGN } from '../../utils/currency'
import PageHeader from '../../components/layout/PageHeader'
import Modal from '../../components/common/Modal'
import { usePublicSettings } from '../../hooks/usePublicSettings'

const Withdraw = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [account, setAccount] = useState(null)
  const [amount, setAmount] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState(null)

  // ── Public settings (all admin-configurable) ─────────────
  const {
    usd_to_ngn_rate,
    min_withdrawal,
    withdrawal_fee_below,   // % fee when amount < threshold
    withdrawal_fee_above,   // % fee when amount >= threshold
    withdrawal_fee_threshold,
    withdrawal_days,
    withdrawal_hours,
    loading: settingsLoading,
  } = usePublicSettings()

  // Safe fallbacks while loading
  const safeMinWithdrawal = min_withdrawal       ?? 11.5
  const safeFeeBelow      = withdrawal_fee_below  ?? 16
  const safeFeeAbove      = withdrawal_fee_above  ?? 10
  const safeThreshold     = withdrawal_fee_threshold ?? 100
  const safeRate          = usd_to_ngn_rate       ?? 1560
  const safeDays          = withdrawal_days        ?? 'Monday to Sunday'
  const safeHours         = withdrawal_hours       ?? '10:00 AM – 05:00 PM'

  // ── Fee calculation ───────────────────────────────────────
  const amountVal  = parseFloat(amount) || 0
  // Below threshold → higher fee (safeFeeBelow); at/above → lower fee (safeFeeAbove)
  const feePercent = amountVal < safeThreshold ? safeFeeBelow : safeFeeAbove
  const feeAmt     = +(amountVal * feePercent / 100).toFixed(4)
  const netAmt     = +(amountVal - feeAmt).toFixed(4)

  // ── Dynamic rules (driven by backend values) ─────────────
  const dynamicRules = [
    `Withdrawal time: ${safeDays}, ${safeHours}`,
    'Daily withdrawal: 1 time only',
    `Minimum withdrawal amount: $${safeMinWithdrawal.toFixed(2)}`,
    `Below $${safeThreshold} handling fee: ${safeFeeBelow}%`,
    `$${safeThreshold} and above handling fee: ${safeFeeAbove}%`,
    'Estimated arrival: 5 minutes to 48 hours',
  ]

  // ── Load user data ────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const [balRes, accRes] = await Promise.all([getBalance(), getBankAccounts()])
      setBalance(balRes.data.balance)
      setAccount(accRes.data.accounts?.[0] || null)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => { await load() })()
  }, [load])

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!account) return toast.error('Please bind a bank account first')
    if (amountVal < safeMinWithdrawal) {
      return toast.error(`Minimum withdrawal is $${safeMinWithdrawal.toFixed(2)}`)
    }
    if (amountVal > balance) return toast.error('Insufficient balance')
    if (pin.length !== 6)   return toast.error('Enter your 6-digit withdrawal PIN')

    setSubmitting(true)
    try {
      const { data } = await createWithdrawal({ amountUSD: amountVal, withdrawPassword: pin })
      setReceipt(data.withdrawal)
    } catch (err) {
      const message = err.response?.data?.message || 'Withdrawal failed'
      if (
        message.toLowerCase().includes('withdrawal password') ||
        message.toLowerCase().includes('set your withdrawal password')
      ) {
        toast.error('Please set your withdrawal PIN first')
        navigate('/main/change-withdraw-pin')
      } else {
        toast.error(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading state ─────────────────────────────────────────
  if (loading || settingsLoading) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <PageHeader
        title="Withdraw"
        right={
          <button
            onClick={() => navigate('/main/withdraw/log')}
            className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"
          >
            <History size={16} />
          </button>
        }
      />

      <div className="px-4 mt-4 space-y-4">

        {/* Balance Card */}
        <div className="card card-p text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-3">
            <DollarSign size={24} className="text-primary" />
          </div>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
            Available Balance
          </p>
          <p className="text-3xl font-extrabold text-gray-800 mt-1">{fmtUSD(balance)}</p>
          <p className="text-xs text-gray-400 mt-1">≈ {fmtNGN(toNGN(balance, safeRate))}</p>
        </div>

        {/* Bank Account Card */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Withdrawal Account
          </p>
          {account ? (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                <span className="text-lg">🏦</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">{account.bankName}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {account.accountName} · {account.accountNumber}
                </p>
              </div>
              <button onClick={() => navigate('/main/bank/accounts')} className="text-primary">
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/main/bank/accounts')}
              className="w-full flex items-center justify-between p-3 bg-orange-50 rounded-2xl border border-orange-100"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-orange-600">No account bound</span>
              </div>
              <span className="text-xs text-primary font-bold">Bind Now →</span>
            </button>
          )}
        </div>

        {/* Amount Input Card */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Withdrawal Amount{' '}
            <span className="text-gray-300 font-normal normal-case ml-1">
              ≈ {fmtNGN(toNGN(amountVal, safeRate))}
            </span>
          </p>
          <div className="flex items-center gap-2 px-4 py-3.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-2xl
                          focus-within:border-primary focus-within:shadow-input transition-all">
            <span className="text-gray-500 font-bold text-sm shrink-0">$</span>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
            />
            <button
              onClick={() => setAmount(String(balance))}
              className="text-xs text-primary font-bold bg-primary-light px-2.5 py-1.5 rounded-lg shrink-0"
            >
              MAX
            </button>
          </div>

          {/* Fee breakdown — visible once amount >= minimum */}
          {amountVal >= safeMinWithdrawal && (
            <div className="mt-3 space-y-1.5 bg-gray-50 rounded-2xl p-3">
              {[
                { label: 'Gross amount',       val: fmtUSD(amountVal) },
                { label: `Fee (${feePercent}%)`, val: `- ${fmtUSD(feeAmt)}`, color: 'text-danger' },
                { label: 'You receive',        val: fmtUSD(netAmt),   color: 'text-success font-extrabold' },
                { label: '≈ NGN',              val: fmtNGN(toNGN(netAmt, safeRate)), color: 'text-gray-500' },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">{label}</span>
                  <span className={`font-bold ${color || 'text-gray-700'}`}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PIN Input Card */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Withdrawal PIN
          </p>
          <div className="flex items-center gap-2 px-4 py-3.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-2xl
                          focus-within:border-primary focus-within:shadow-input transition-all">
            <Lock size={15} className="text-gray-400 shrink-0" />
            <input
              type="password"
              placeholder="6-digit withdrawal PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal tracking-widest"
            />
          </div>
        </div>

        {/* Dynamic Rules Card */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 space-y-1.5">
          {dynamicRules.map((rule, idx) => (
            <p key={idx} className="text-xs text-orange-600 font-medium flex gap-1.5">
              <span className="shrink-0 text-orange-400">•</span> {rule}
            </p>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting || loading}
          className="btn btn-primary rounded-2xl h-14"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
          ) : (
            'Withdraw'
          )}
        </button>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={!!receipt}
        onClose={() => { setReceipt(null); navigate('/main/withdraw/log') }}
        title="Withdrawal Submitted"
      >
        {receipt && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-success-light flex items-center justify-center mx-auto">
              <span className="text-3xl">✅</span>
            </div>
            <p className="text-gray-500 text-sm">
              Your withdrawal request has been submitted and will be processed shortly.
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2">
              {[
                { label: 'Amount',   val: fmtUSD(receipt.amountUSD) },
                { label: 'Fee',      val: `${receipt.feePercent}% = ${fmtUSD(receipt.feeAmountUSD)}` },
                { label: 'You get',  val: fmtUSD(receipt.netAmountUSD) },
                { label: '≈ NGN',    val: fmtNGN(receipt.netAmountNGN) },
                { label: 'Bank',     val: receipt.bankName },
                { label: 'Account',  val: receipt.accountNumber },
                { label: 'Status',   val: 'Pending review' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-400 font-medium">{label}</span>
                  <span className="text-gray-800 font-bold">{val}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setReceipt(null); navigate('/main/withdraw/log') }}
              className="btn btn-primary rounded-2xl h-12 text-sm"
            >
              View Records
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Withdraw