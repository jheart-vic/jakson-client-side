// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { History, Copy, CheckCircle } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { createDeposit } from '../../api/deposit'
// import { handleApiError } from '../../utils/errorHandler'
// import { fmtUSD, fmtNGN, toNGN } from '../../utils/currency'
// import PageHeader from '../../components/layout/PageHeader'
// import Modal from '../../components/common/Modal'
// import { usePublicSettings } from '../../hooks/usePublicSettings'
// import Skeleton from '../../components/common/Skeleton'

// const PRESETS = [11.5, 60, 174]

// const Deposit = () => {
//   const navigate = useNavigate()
//   const [selected, setSelected] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [receipt, setReceipt] = useState(null)
//   const [copied, setCopied] = useState(false)
//   const [amount, setAmount] = useState('')

//   const {
//     usd_to_ngn_rate,
//     min_deposit,
//     loading: settingsLoading,
//   } = usePublicSettings()

//   // Fallback defaults while loading
//   const safeRate = usd_to_ngn_rate ?? 1365
//   const safeMinDeposit = min_deposit ?? 11.5

//   const amountVal = selected ?? (parseFloat(amount) || 0)
//   const ngnVal = toNGN(amountVal, safeRate)

//   const pickPreset = (v) => {
//     setSelected(v)
//     setAmount(String(v))
//   }

//   const handleCustom = (e) => {
//     const v = e.target.value.replace(/[^0-9.]/g, '')
//     setAmount(v)
//     setSelected(null)
//   }

//   const handleSubmit = async () => {
//     if (!amountVal || amountVal < safeMinDeposit) {
//       return toast.error(`Minimum deposit is $${safeMinDeposit.toFixed(2)}`)
//     }
//     setLoading(true)
//     try {
//       const { data } = await createDeposit({ amountUSD: amountVal })
//       setReceipt(data.deposit)
//     } catch (err) {
//       handleApiError(err, 'Failed to initiate deposit')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const copyAccount = () => {
//     navigator.clipboard.writeText(receipt.accountNumber)
//       .then(() => {
//         setCopied(true)
//         setTimeout(() => setCopied(false), 2000)
//       })
//   }

//   // Skeleton while settings load
//   if (settingsLoading) {
//     return (
//       <div className="min-h-dvh pb-8">
//         <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
//           <Skeleton circle width={32} height={32} />
//           <Skeleton width={80} height={16} />
//         </div>
//         <div className="px-4 mt-6 space-y-4">
//           <div className="bg-white rounded-2xl shadow-card p-4">
//             <Skeleton width={100} height={11} />
//             <div className="flex gap-2 mt-3">
//               {[...Array(3)].map((_, i) => <Skeleton key={i} height={44} className="flex-1" borderRadius={12} />)}
//             </div>
//           </div>
//           <Skeleton height={60} borderRadius={16} />
//           <Skeleton height={52} borderRadius={16} />
//           <div className="space-y-2">
//             {[...Array(3)].map((_, i) => <Skeleton key={i} height={16} borderRadius={8} />)}
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-dvh pb-8">
//       <PageHeader
//         title="Recharge"
//         right={
//           <button
//             onClick={() => navigate('/main/deposit/log')}
//             className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"
//           >
//             <History size={16} />
//           </button>
//         }
//       />

//       <div className="px-4 mt-4 space-y-4">
//         {/* Preset amounts */}
//         <div className="card card-p">
//           <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
//             Recharge Amount
//           </p>
//           <div className="grid grid-cols-3 gap-2">
//             {PRESETS.map((v) => (
//               <button
//                 key={v}
//                 onClick={() => pickPreset(v)}
//                 className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95
//                   ${
//                     selected === v
//                       ? 'bg-primary text-white shadow-[0_4px_12px_rgba(26,159,212,0.3)]'
//                       : 'bg-gray-50 text-gray-700 border border-gray-200'
//                   }`}
//               >
//                 ${v}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Custom amount */}
//         <div className="card card-p">
//           <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
//             Other Amount
//           </p>
//           <div
//             className="flex items-center gap-2 px-4 py-3.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-2xl
//                         focus-within:border-primary focus-within:shadow-input transition-all"
//           >
//             <span className="text-gray-500 font-bold text-sm shrink-0">$</span>
//             <input
//               type="number"
//               placeholder={`Minimum $${safeMinDeposit.toFixed(2)}`}
//               value={amount}
//               onChange={handleCustom}
//               inputMode="decimal"
//               className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
//             />
//           </div>
//           {amountVal >= safeMinDeposit && (
//             <p className="text-xs text-gray-400 mt-2 ml-1">
//               ≈ {fmtNGN(ngnVal)} at ₦{safeRate}/$
//             </p>
//           )}
//         </div>

//         {/* Method */}
//         <div className="card card-p">
//           <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
//             Recharge Method
//           </p>
//           <div className="flex items-center gap-3 p-3.5 bg-primary-light rounded-2xl border-2 border-primary">
//             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
//               <span className="text-white text-lg">🏦</span>
//             </div>
//             <div>
//               <p className="text-sm font-bold text-gray-800">Bank Transfer</p>
//               <p className="text-xs text-gray-500">OTPay · Instant confirmation</p>
//             </div>
//             <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
//               <CheckCircle size={12} className="text-white" />
//             </div>
//           </div>
//         </div>

//         {/* Warning */}
//         <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
//           <p className="text-orange-600 text-xs font-bold mb-1">⚠️ Please note!</p>
//           <p className="text-orange-500 text-xs leading-relaxed">
//             Do not save the account after transfer is completed. You will need a new account number for each deposit.
//           </p>
//         </div>

//         {/* Bottom summary + submit */}
//         <div className="bg-white rounded-2xl p-4 shadow-card">
//           <div className="flex justify-between items-center mb-4">
//             <span className="text-sm text-gray-500 font-medium">Recharge amount</span>
//             <div className="text-right">
//               <span className="text-primary font-extrabold text-lg">
//                 {fmtUSD(amountVal)}
//               </span>
//               <span className="text-gray-400 text-xs ml-2">≈ {fmtNGN(ngnVal)}</span>
//             </div>
//           </div>
//           <button
//             onClick={handleSubmit}
//             disabled={loading || amountVal < safeMinDeposit}
//             className="btn btn-primary rounded-2xl h-14"
//           >
//             {loading ? (
//               <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
//             ) : (
//               'Recharge Now'
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Bank details modal after deposit created */}
//       <Modal
//         isOpen={!!receipt}
//         onClose={() => {
//           setReceipt(null)
//           navigate('/main/deposit/log')
//         }}
//         title="Transfer Details"
//         hideClose
//       >
//         {receipt && (
//           <div className="space-y-4">
//             <div className="bg-success-light rounded-2xl p-4 text-center">
//               <CheckCircle size={28} className="text-success mx-auto mb-2" />
//               <p className="text-success font-bold text-sm">Deposit initiated!</p>
//               <p className="text-gray-500 text-xs mt-1">
//                 Please transfer the exact amount below
//               </p>
//             </div>

//             <div className="space-y-3">
//               {[
//                 { label: 'Amount (NGN)', val: fmtNGN(receipt.amountNGN), highlight: true },
//                 { label: 'Bank Name', val: receipt.bankName },
//                 { label: 'Account Name', val: receipt.accountName },
//               ].map(({ label, val, highlight }) => (
//                 <div
//                   key={label}
//                   className="flex justify-between items-center py-2 border-b border-gray-50"
//                 >
//                   <span className="text-xs text-gray-400 font-medium">{label}</span>
//                   <span
//                     className={`text-sm font-bold ${
//                       highlight ? 'text-primary text-base' : 'text-gray-800'
//                     }`}
//                   >
//                     {val}
//                   </span>
//                 </div>
//               ))}

//               {/* Account number with copy */}
//               <div className="flex justify-between items-center py-2 border-b border-gray-50">
//                 <span className="text-xs text-gray-400 font-medium">
//                   Account Number
//                 </span>
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm font-bold text-gray-800 font-mono">
//                     {receipt.accountNumber}
//                   </span>
//                   <button
//                     onClick={copyAccount}
//                     className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-all
//                       ${
//                         copied
//                           ? 'bg-success-light text-success'
//                           : 'bg-primary-light text-primary'
//                       }`}
//                   >
//                     {copied ? (
//                       <>
//                         <CheckCircle size={11} />
//                         Copied
//                       </>
//                     ) : (
//                       <>
//                         <Copy size={11} />
//                         Copy
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-orange-50 rounded-2xl p-3 text-xs text-orange-600 font-medium leading-relaxed">
//               ⚠️ Transfer the exact amount shown. Do not save this account number — it is
//               one-time use only.
//             </div>

//             <button
//               onClick={() => {
//                 setReceipt(null)
//                 navigate('/main/deposit/log')
//               }}
//               className="btn btn-primary rounded-2xl h-13 text-sm"
//             >
//               View Recharge Records
//             </button>
//           </div>
//         )}
//       </Modal>
//     </div>
//   )
// }

// export default Deposit

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { History, CheckCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { createDeposit } from '../../api/deposit'
import { handleApiError } from '../../utils/errorHandler'
import { fmtUSD, fmtNGN, toNGN } from '../../utils/currency'
import PageHeader from '../../components/layout/PageHeader'
import Modal from '../../components/common/Modal'
import { usePublicSettings } from '../../hooks/usePublicSettings'
import Skeleton from '../../components/common/Skeleton'

const PRESETS = [11.5, 60, 174]

const Deposit = () => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const [redirecting, setRedirecting] = useState(false)
  const [amount, setAmount] = useState('')

  const {
    usd_to_ngn_rate,
    min_deposit,
    loading: settingsLoading,
  } = usePublicSettings()

  // Fallback defaults while loading
  const safeRate = usd_to_ngn_rate ?? 1365
  const safeMinDeposit = min_deposit ?? 11.5

  const amountVal = selected ?? (parseFloat(amount) || 0)
  const ngnVal = toNGN(amountVal, safeRate)

  const pickPreset = (v) => {
    setSelected(v)
    setAmount(String(v))
  }

  const handleCustom = (e) => {
    const v = e.target.value.replace(/[^0-9.]/g, '')
    setAmount(v)
    setSelected(null)
  }

  const handleSubmit = async () => {
    if (!amountVal || amountVal < safeMinDeposit) {
      return toast.error(`Minimum deposit is $${safeMinDeposit.toFixed(2)}`)
    }
    setLoading(true)
    try {
      const { data } = await createDeposit({ amountUSD: amountVal })
      if (!data?.deposit?.payUrl) {
        return toast.error('Could not start payment. Please try again.')
      }
      setReceipt(data.deposit)
    } catch (err) {
      handleApiError(err, 'Failed to initiate deposit')
    } finally {
      setLoading(false)
    }
  }

  // Send the user to the gateway-hosted payment page.
  const goToPayment = () => {
    if (!receipt?.payUrl) return
    setRedirecting(true)
    window.location.href = receipt.payUrl
  }

  // Skeleton while settings load
  if (settingsLoading) {
    return (
      <div className="min-h-dvh pb-8">
        <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
          <Skeleton circle width={32} height={32} />
          <Skeleton width={80} height={16} />
        </div>
        <div className="px-4 mt-6 space-y-4">
          <div className="bg-white rounded-2xl shadow-card p-4">
            <Skeleton width={100} height={11} />
            <div className="flex gap-2 mt-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} height={44} className="flex-1" borderRadius={12} />)}
            </div>
          </div>
          <Skeleton height={60} borderRadius={16} />
          <Skeleton height={52} borderRadius={16} />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => <Skeleton key={i} height={16} borderRadius={8} />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-8">
      <PageHeader
        title="Recharge"
        right={
          <button
            onClick={() => navigate('/main/deposit/log')}
            className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"
          >
            <History size={16} />
          </button>
        }
      />

      <div className="px-4 mt-4 space-y-4">
        {/* Preset amounts */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Recharge Amount
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((v) => (
              <button
                key={v}
                onClick={() => pickPreset(v)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95
                  ${
                    selected === v
                      ? 'bg-primary text-white shadow-[0_4px_12px_rgba(26,159,212,0.3)]'
                      : 'bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
              >
                ${v}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Other Amount
          </p>
          <div
            className="flex items-center gap-2 px-4 py-3.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-2xl
                        focus-within:border-primary focus-within:shadow-input transition-all"
          >
            <span className="text-gray-500 font-bold text-sm shrink-0">$</span>
            <input
              type="number"
              placeholder={`Minimum $${safeMinDeposit.toFixed(2)}`}
              value={amount}
              onChange={handleCustom}
              inputMode="decimal"
              className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>
          {amountVal >= safeMinDeposit && (
            <p className="text-xs text-gray-400 mt-2 ml-1">
              ≈ {fmtNGN(ngnVal)} at ₦{safeRate}/$
            </p>
          )}
        </div>

        {/* Method */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
            Recharge Method
          </p>
          <div className="flex items-center gap-3 p-3.5 bg-primary-light rounded-2xl border-2 border-primary">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-lg">🏦</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Online Payment</p>
              <p className="text-xs text-gray-500">Secure gateway · Auto-confirmed</p>
            </div>
            <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle size={12} className="text-white" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-blue-600 text-xs font-bold mb-1">ℹ️ How it works</p>
          <p className="text-blue-500 text-xs leading-relaxed">
            After tapping Recharge, you'll be taken to a secure payment page to complete your
            transfer. Your balance updates automatically once payment is confirmed.
          </p>
        </div>

        {/* Bottom summary + submit */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 font-medium">Recharge amount</span>
            <div className="text-right">
              <span className="text-primary font-extrabold text-lg">
                {fmtUSD(amountVal)}
              </span>
              <span className="text-gray-400 text-xs ml-2">≈ {fmtNGN(ngnVal)}</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading || amountVal < safeMinDeposit}
            className="btn btn-primary rounded-2xl h-14"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
            ) : (
              'Recharge Now'
            )}
          </button>
        </div>
      </div>

      {/* Proceed-to-payment modal after deposit created */}
      <Modal
        isOpen={!!receipt}
        onClose={() => {
          setReceipt(null)
          navigate('/main/deposit/log')
        }}
        title="Complete Your Payment"
        hideClose
      >
        {receipt && (
          <div className="space-y-4">
            <div className="bg-success-light rounded-2xl p-4 text-center">
              <CheckCircle size={28} className="text-success mx-auto mb-2" />
              <p className="text-success font-bold text-sm">Deposit initiated!</p>
              <p className="text-gray-500 text-xs mt-1">
                Continue to the secure payment page to pay
              </p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Amount (USD)', val: fmtUSD(receipt.amountUSD) },
                { label: 'Amount (NGN)', val: fmtNGN(receipt.amountNGN), highlight: true },
              ].map(({ label, val, highlight }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2 border-b border-gray-50"
                >
                  <span className="text-xs text-gray-400 font-medium">{label}</span>
                  <span
                    className={`text-sm font-bold ${
                      highlight ? 'text-primary text-base' : 'text-gray-800'
                    }`}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-2xl p-3 text-xs text-blue-600 font-medium leading-relaxed">
              ℹ️ Your balance is credited automatically after payment is confirmed — no manual
              upload needed.
            </div>

            <button
              onClick={goToPayment}
              disabled={redirecting}
              className="btn btn-primary rounded-2xl h-14 text-sm flex items-center justify-center gap-2"
            >
              {redirecting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
              ) : (
                <>
                  <ExternalLink size={16} />
                  Proceed to Payment
                </>
              )}
            </button>

            <button
              onClick={() => {
                setReceipt(null)
                navigate('/main/deposit/log')
              }}
              className="w-full text-center text-xs text-gray-400 font-medium py-1"
            >
              I'll pay later — view records
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Deposit