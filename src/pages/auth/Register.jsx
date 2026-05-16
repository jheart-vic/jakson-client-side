import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, RefreshCw, ChevronLeft, ShieldCheck, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCaptcha, getSecurityQuestions, register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import PasswordRules, { validatePassword } from '../../components/common/PasswordRules'

const STEPS = ['Account', 'Security', 'Verify']

const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login: authLogin } = useAuth()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    phone: '', password: '', confirmPassword: '',
    securityQuestionId: '', securityAnswer: '',
    captchaAnswer: '', referralCode: searchParams.get('c') || '',
  })
  const [questions, setQuestions] = useState([])
  const [captcha, setCaptcha]     = useState({ id: '', image: '' })
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    try {
      const { data } = await getCaptcha()
      setCaptcha({ id: data.captchaId, image: data.image })
      setForm(f => ({ ...f, captchaAnswer: '' }))
    } catch { toast.error('Failed to load captcha') }
    finally { setCaptchaLoading(false) }
  }, [])

  useEffect(() => {
    getSecurityQuestions().then(r => setQuestions(r.data.questions)).catch(() => {})
  }, [])

  useEffect(() => {
  if (step !== 2) return
  ;(async () => { await fetchCaptcha() })()
}, [step, fetchCaptcha])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const nextStep = (e) => {
    e.preventDefault()
    if (step === 0) {
      if (!form.phone) return toast.error('Enter your phone number')
      if (!form.password) return toast.error('Enter a password')
      if (!validatePassword(form.password))
        return toast.error('Password does not meet all requirements')
      if (form.password !== form.confirmPassword)
        return toast.error('Passwords do not match')
    }
    if (step === 1) {
      if (!form.securityQuestionId || !form.securityAnswer.trim())
        return toast.error('Select a question and enter your answer')
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.captchaAnswer.trim()) return toast.error('Enter the captcha')
    setLoading(true)
    try {
      const { data } = await register({
        phone: form.phone.trim(), password: form.password,
        countryCode: '+234',
        securityQuestionId: parseInt(form.securityQuestionId),
        securityAnswer: form.securityAnswer.trim(),
        captchaId: captcha.id, captchaAnswer: form.captchaAnswer.trim(),
        ...(form.referralCode && { referralCode: form.referralCode.trim().toUpperCase() }),
      })
      authLogin(data.token, data.user)
      toast.success('Account created! Welcome 🎉')
      navigate('/main/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
      fetchCaptcha()
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#0e6a8f 0%,#1a9fd4 50%,#38bdf8 100%)' }}>

      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center px-5 pt-12 pb-4">
        {step > 0
          ? <button onClick={() => setStep(s => s - 1)}
              className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <ChevronLeft size={20} />
            </button>
          : <Link to="/login"
              className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <ChevronLeft size={20} />
            </Link>
        }
        <div className="flex-1 text-center">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest">Create Account</p>
          <p className="text-white text-lg font-bold">{STEPS[step]}</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2 pb-5">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300
            ${i === step ? 'w-6 bg-white' : i < step ? 'w-4 bg-white/70' : 'w-4 bg-white/30'}`} />
        ))}
      </div>

      {/* Card */}
      <div className="flex-1 px-5 pb-10 overflow-y-auto">
        <div className="card-glass p-6 animate-scale-in">

          {/* STEP 0 — Account */}
          {step === 0 && (
            <form onSubmit={nextStep} className="space-y-4">
              <div>
                <h2 className="text-gray-800 text-xl font-bold">Account Details</h2>
                <p className="text-gray-500 text-sm mt-0.5">Set up your login credentials</p>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
                              focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)] transition-all">
                <span className="text-xs font-bold text-gray-500 border-r border-gray-200 pr-3 shrink-0">+234</span>
                <Phone size={15} className="text-gray-400 shrink-0" />
                <input type="tel" placeholder="Phone number" value={form.phone} onChange={set('phone')}
                  className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent"
                  inputMode="numeric" />
              </div>

              {/* Password */}
              <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
                              focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)] transition-all">
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input type={showPw ? 'text' : 'password'} placeholder="Create password"
                  value={form.password} onChange={set('password')}
                  className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 shrink-0">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Live password rules */}
              <PasswordRules password={form.password} />

              {/* Confirm password */}
              <div className={`flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] rounded-2xl transition-all
                ${form.confirmPassword
                    ? form.password === form.confirmPassword
                      ? 'border-success shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
                      : 'border-danger  shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                    : 'border-gray-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)]'}`}>
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input type="password" placeholder="Confirm password"
                  value={form.confirmPassword} onChange={set('confirmPassword')}
                  className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent" />
                {form.confirmPassword && (
                  <span className="text-xs font-bold shrink-0">
                    {form.password === form.confirmPassword
                      ? <span className="text-success">✓ Match</span>
                      : <span className="text-danger">✗ No match</span>}
                  </span>
                )}
              </div>

              {/* Referral code */}
              <div className="flex items-center gap-2 px-4 py-3.5 bg-amber-50 border-[1.5px] border-amber-200 rounded-2xl
                              focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(249,115,22,0.15)] transition-all">
                <Gift size={15} className="text-accent shrink-0" />
                <input type="text" placeholder="Referral code (optional)"
                  value={form.referralCode} onChange={set('referralCode')}
                  className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent uppercase" />
              </div>

              <button type="submit" className="btn btn-primary rounded-2xl h-14">Continue →</button>
            </form>
          )}

          {/* STEP 1 — Security Question (unchanged) */}
          {step === 1 && (
            <form onSubmit={nextStep} className="space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
                  <ShieldCheck size={22} className="text-primary" />
                </div>
                <h2 className="text-gray-800 text-xl font-bold">Security Question</h2>
                <p className="text-gray-500 text-sm mt-0.5">Used to recover your password</p>
              </div>

              <div className="relative">
                <select value={form.securityQuestionId} onChange={set('securityQuestionId')}
                  className="input rounded-2xl appearance-none pr-10 text-sm">
                  <option value="">Select a security question</option>
                  {questions.map(q => (
                    <option key={q.id} value={q.id}>{q.question}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
              </div>

              <input type="text" placeholder="Your answer" value={form.securityAnswer}
                onChange={set('securityAnswer')} className="input rounded-2xl" />

              <div className="bg-primary-light rounded-2xl p-3 text-xs text-primary font-medium">
                💡 Remember this answer — it's the only way to reset your password if you forget it.
              </div>

              <button type="submit" className="btn btn-primary rounded-2xl h-14">Continue →</button>
            </form>
          )}

          {/* STEP 2 — Captcha (unchanged) */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h2 className="text-gray-800 text-xl font-bold">Almost there!</h2>
                <p className="text-gray-500 text-sm mt-0.5">Verify you're human</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-14 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
                  {captchaLoading
                    ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin-slow" />
                    : captcha.image && <img src={captcha.image} alt="captcha" className="h-full object-contain" />
                  }
                </div>
                <button type="button" onClick={fetchCaptcha} disabled={captchaLoading}
                  className="w-14 h-14 bg-primary-light rounded-xl flex items-center justify-center text-primary
                             active:scale-95 transition-transform disabled:opacity-50 shrink-0">
                  <RefreshCw size={16} className={captchaLoading ? 'animate-spin-slow' : ''} />
                </button>
              </div>

              <input type="text" placeholder="Enter the 4 digits" value={form.captchaAnswer}
                onChange={set('captchaAnswer')} maxLength={4} inputMode="numeric"
                className="input text-center text-2xl font-bold tracking-[0.4em] rounded-2xl h-14" />

              <button type="submit" disabled={loading} className="btn btn-primary rounded-2xl h-14">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />Creating account…</>
                  : 'Create Account 🎉'}
              </button>
            </form>
          )}

          <p className="text-center text-gray-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register