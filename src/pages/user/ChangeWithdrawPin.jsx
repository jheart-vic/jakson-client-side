import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { changeWithdrawPassword } from '../../api/auth'
import PageHeader from '../../components/layout/PageHeader'

const PinBox = ({ value, onChange, label }) => {
  const digits = value.split('')
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}</p>
      <div className="flex gap-3 justify-center">
        {[...Array(6)].map((_, i) => (
          <div key={i}
            className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center text-lg font-extrabold transition-all
              ${i < digits.length
                ? 'border-primary bg-primary-light text-primary'
                : i === digits.length
                ? 'border-primary bg-white animate-pulse'
                : 'border-gray-200 bg-gray-50'}`}>
            {digits[i] ? '●' : ''}
          </div>
        ))}
      </div>
      {/* Hidden real input */}
      <input type="password" value={value} onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric" maxLength={6}
        className="sr-only" />
    </div>
  )
}

const ChangeWithdrawPin = () => {
  const navigate = useNavigate()
  const [loginPw, setLoginPw]   = useState('')
  const [pin, setPin]           = useState('')
  const [confirmPin, setConfirm]= useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [step, setStep]         = useState(0) // 0=verify login, 1=set pin, 2=confirm pin

  const handleNext = () => {
    if (step === 0) {
      if (!loginPw) return toast.error('Enter your login password')
      setStep(1)
    } else if (step === 1) {
      if (pin.length !== 6) return toast.error('Enter all 6 digits')
      setStep(2)
    }
  }

  const handleSubmit = async () => {
    if (confirmPin !== pin) return toast.error('PINs do not match')
    setLoading(true)
    try {
      await changeWithdrawPassword({ loginPassword: loginPw, newWithdrawPassword: pin })
      toast.success('Withdrawal PIN updated!')
      navigate(-1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update PIN')
      setStep(0); setPin(''); setConfirm('')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <PageHeader title="Withdrawal PIN" />

      {/* Step dots */}
      <div className="flex justify-center gap-2 py-5">
        {['Verify', 'New PIN', 'Confirm'].map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all
              ${i === step ? 'bg-primary text-white' : i < step ? 'bg-success text-white' : 'bg-gray-200 text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <p className="text-[10px] text-gray-400 font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="px-4 space-y-6">
        <div className="card card-p">

          {/* Step 0 — verify login password */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <p className="font-extrabold text-gray-800 text-base mb-1">Verify Identity</p>
                <p className="text-gray-500 text-sm">Enter your login password to continue</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-3.5 bg-gray-50 border-[1.5px] border-gray-200 rounded-2xl
                              focus-within:border-primary focus-within:shadow-input transition-all">
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input type={showPw ? 'text' : 'password'} placeholder="Login password" value={loginPw}
                  onChange={e => setLoginPw(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 shrink-0">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button onClick={handleNext} className="btn btn-primary rounded-2xl h-13">Continue →</button>
            </div>
          )}

          {/* Step 1 — enter new PIN */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="font-extrabold text-gray-800 text-base mb-1">Set New PIN</p>
                <p className="text-gray-500 text-sm">Enter a new 6-digit withdrawal PIN</p>
              </div>
              <div onClick={() => document.querySelector('input[type=password]')?.focus()}>
                <PinBox value={pin} onChange={setPin} label="New 6-digit PIN" />
              </div>
              <button onClick={handleNext} disabled={pin.length < 6}
                className="btn btn-primary rounded-2xl h-13 disabled:opacity-50">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 — confirm PIN */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="font-extrabold text-gray-800 text-base mb-1">Confirm PIN</p>
                <p className="text-gray-500 text-sm">Re-enter your new 6-digit PIN</p>
              </div>
              <PinBox value={confirmPin} onChange={setConfirm} label="Confirm PIN" />
              {confirmPin.length === 6 && confirmPin !== pin && (
                <p className="text-danger text-xs font-bold text-center">PINs do not match</p>
              )}
              <button onClick={handleSubmit}
                disabled={loading || confirmPin.length < 6 || confirmPin !== pin}
                className="btn btn-primary rounded-2xl h-13 disabled:opacity-50">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                  : 'Save PIN'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChangeWithdrawPin
