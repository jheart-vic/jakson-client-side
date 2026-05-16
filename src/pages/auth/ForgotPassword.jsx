import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, ChevronLeft, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { getSecurityQuestion, forgotPassword } from '../../api/auth'

const STEPS = ['Phone', 'Answer', 'Done']

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep]         = useState(0)
  const [phone, setPhone]       = useState('')
  const [question, setQuestion] = useState(null)
  const [questionId, setQuestionId] = useState(null)
  const [answer, setAnswer]     = useState('')
  const [resetToken, setResetToken] = useState('')
  const [loading, setLoading]   = useState(false)

  const handlePhone = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return toast.error('Enter your phone number')
    setLoading(true)
    try {
      const { data } = await getSecurityQuestion(phone.trim())
      if (!data.question) {
        toast.error('No account found with that phone number')
        return
      }
      setQuestion(data.question)
      setQuestionId(data.questionId)
      setStep(1)
    } catch { toast.error('Something went wrong') }
    finally { setLoading(false) }
  }

  const handleAnswer = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return toast.error('Enter your answer')
    setLoading(true)
    try {
      const { data } = await forgotPassword({
        phone: phone.trim(), securityQuestionId: questionId, securityAnswer: answer.trim(),
      })
      setResetToken(data.resetToken)
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect answer')
    } finally { setLoading(false) }
  }

  const goReset = () => navigate('/reset-password', { state: { resetToken } })

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#0e6a8f 0%,#1a9fd4 50%,#38bdf8 100%)' }}>

      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center px-5 pt-12 pb-6">
        {step === 0
          ? <Link to="/login" className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <ChevronLeft size={20} />
            </Link>
          : <button onClick={() => setStep(s => s - 1)} className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <ChevronLeft size={20} />
            </button>
        }
        <div className="flex-1 text-center">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Password Recovery</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2 pb-6">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300
            ${i === step ? 'w-6 bg-white' : i < step ? 'w-4 bg-white/70' : 'w-4 bg-white/30'}`} />
        ))}
      </div>

      <div className="flex-1 px-5 pb-10">
        <div className="card-glass p-6 animate-scale-in">

          {/* STEP 0 — Phone */}
          {step === 0 && (
            <form onSubmit={handlePhone} className="space-y-5">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
                  <Phone size={22} className="text-primary" />
                </div>
                <h2 className="text-gray-800 text-xl font-bold">Forgot Password?</h2>
                <p className="text-gray-500 text-sm mt-1">Enter your registered phone number to continue</p>
              </div>

              <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
                              focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)] transition-all">
                <span className="text-xs font-bold text-gray-500 border-r border-gray-200 pr-3 shrink-0">+234</span>
                <Phone size={15} className="text-gray-400 shrink-0" />
                <input type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)}
                  className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent"
                  inputMode="numeric" />
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary rounded-2xl h-14">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />Checking…</>
                  : 'Continue →'}
              </button>
            </form>
          )}

          {/* STEP 1 — Security Answer */}
          {step === 1 && (
            <form onSubmit={handleAnswer} className="space-y-5">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
                  <ShieldCheck size={22} className="text-primary" />
                </div>
                <h2 className="text-gray-800 text-xl font-bold">Security Check</h2>
                <p className="text-gray-500 text-sm mt-1">Answer your security question</p>
              </div>

              <div className="bg-primary-light rounded-2xl p-4">
                <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">Your Question</p>
                <p className="text-gray-800 text-sm font-semibold">{question}</p>
              </div>

              <input type="text" placeholder="Your answer" value={answer} onChange={e => setAnswer(e.target.value)}
                className="input rounded-2xl" />

              <button type="submit" disabled={loading} className="btn btn-primary rounded-2xl h-14">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />Verifying…</>
                  : 'Verify Answer →'}
              </button>
            </form>
          )}

          {/* STEP 2 — Success */}
          {step === 2 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto">
                <span className="text-4xl">✅</span>
              </div>
              <div>
                <h2 className="text-gray-800 text-xl font-bold">Identity Verified!</h2>
                <p className="text-gray-500 text-sm mt-2">You can now set a new password. This link expires in 15 minutes.</p>
              </div>
              <button onClick={goReset} className="btn btn-primary rounded-2xl h-14">
                Set New Password →
              </button>
            </div>
          )}

          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-gray-500">
              Remember it? <span className="text-primary font-bold">Sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
