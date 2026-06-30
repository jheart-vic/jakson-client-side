import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, RefreshCw, ChevronLeft, ShieldCheck, Gift, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCaptcha, getSecurityQuestions, register } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import PasswordRules, { validatePassword } from '../../components/common/passwordRules'
import { handleApiError } from '../../utils/errorHandler'

const STEPS = ['Account', 'Security', 'Verify']

const Field = ({ icon: Icon, focused, error, match, children, amber }) => {
  let borderColor = focused ? '#C67B2C' : '#E2DDD6'
  let shadow = focused ? '0 0 0 3px rgba(198,123,44,0.12)' : 'none'
  if (error)  { borderColor = '#DC5F5F'; shadow = '0 0 0 3px rgba(220,95,95,0.12)' }
  if (match)  { borderColor = '#659B5E'; shadow = '0 0 0 3px rgba(101,155,94,0.12)' }
  return (
    <div className="flex items-center gap-3 px-4 h-12 rounded-xl border transition-all duration-150"
      style={{ borderColor, boxShadow: shadow, background: amber ? '#FFFBF2' : 'white' }}>
      {Icon && <Icon size={15} style={{ color: focused ? '#C67B2C' : '#9ca3af', flexShrink: 0, transition: 'color 150ms' }} />}
      {children}
    </div>
  )
}

const Register = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login: authLogin } = useAuth()
  const [step, setStep]         = useState(0)
  const [form, setForm]         = useState({
    phone: '', password: '', confirmPassword: '',
    fullName: '', userName: '',
    securityQuestionId: '', securityAnswer: '',
    captchaAnswer: '', referralCode: searchParams.get('ref') || sessionStorage.getItem('referralCode') || '',
  })
  const [questions, setQuestions]         = useState([])
  const [captcha, setCaptcha]             = useState({ id: '', image: '' })
  const [showPw, setShowPw]               = useState(false)
  const [loading, setLoading]             = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [focus, setFocus]                 = useState('')

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    try { const { data } = await getCaptcha(); setCaptcha({ id: data.captchaId, image: data.image }); setForm(f => ({ ...f, captchaAnswer: '' })) }
    catch (err) { handleApiError(err, 'Failed to load captcha') }
    finally { setCaptchaLoading(false) }
  }, [])

  useEffect(() => {
    getSecurityQuestions().then(r => setQuestions(r.data.questions)).catch(err => handleApiError(err, 'Failed to load security questions'))
  }, [])

      useEffect(() => {
        if (step !== 2) return
        ;(async () => {
            await fetchCaptcha()
        })()
    }, [step, fetchCaptcha])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const nextStep = e => {
    e.preventDefault()
    if (step === 0) {
      if (!form.phone)                          return toast.error('Enter your phone number')
      if (!form.password)                       return toast.error('Enter a password')
      if (!validatePassword(form.password))     return toast.error('Password does not meet all requirements')
      if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    }
    if (step === 1) {
      if (!form.securityQuestionId || !form.securityAnswer.trim()) return toast.error('Select a question and enter your answer')
    }
    setStep(s => s + 1)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.captchaAnswer.trim()) return toast.error('Enter the captcha')
    setLoading(true)
    try {
      const { data } = await register({
        phone: form.phone.trim(), password: form.password, countryCode: '+234',
        fullName: form.fullName.trim() || undefined,
        userName: form.userName.trim() || undefined,
        securityQuestionId: parseInt(form.securityQuestionId),
        securityAnswer: form.securityAnswer.trim(),
        captchaId: captcha.id, captchaAnswer: form.captchaAnswer.trim(),
        ...(form.referralCode && { referralCode: form.referralCode.trim().toUpperCase() }),
      })
      authLogin(data.user)
      sessionStorage.removeItem('referralCode')
      toast.success('Account created! Welcome 🎉')
      navigate('/main/dashboard', { replace: true })
    } catch (err) { handleApiError(err, 'Failed to create account'); fetchCaptcha() }
    finally { setLoading(false) }
  }

  const confirmState = !form.confirmPassword ? '' : form.password === form.confirmPassword ? 'match' : 'error'

  return (
    <div className="min-h-dvh flex" style={{ background: '#F5F1EB' }}>

      {/* ── Left panel (desktop) ── */}
      <div className="hidden lg:flex flex-col justify-between w-105 shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #C67B2C 0%, #8A4E18 100%)' }}>
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10" style={{ background: 'white' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.jpeg" alt="Luminos Energy" className="w-14 h-14 rounded-2xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.25)' }} />
            <div>
              <p className="text-white font-extrabold text-lg leading-tight">Luminos Energy</p>
              <p className="text-white/60 text-xs font-medium">Smart Solar Investment</p>
            </div>
          </div>
          <h2 className="text-white text-3xl font-extrabold leading-snug tracking-tight mb-4">
            Start earning<br />in minutes.
          </h2>
          <p className="text-white/65 text-sm leading-relaxed">Create your free account and begin investing in solar energy today. No experience required.</p>
        </div>

        {/* Step progress on sidebar */}
        <div className="relative z-10 space-y-3">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 transition-all"
                style={{ background: i <= step ? 'white' : 'rgba(255,255,255,0.2)', color: i <= step ? '#C67B2C' : 'rgba(255,255,255,0.5)' }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-sm font-semibold transition-all" style={{ color: i <= step ? 'white' : 'rgba(255,255,255,0.45)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-4 px-5 pt-10 pb-4"
          style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}>
          {step > 0
            ? <button onClick={() => setStep(s => s - 1)} className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0"><ChevronLeft size={18} /></button>
            : <Link to="/login" className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0"><ChevronLeft size={18} /></Link>
          }
          <div className="flex-1 text-center">
            <p className="text-white/70 text-[10px] font-semibold uppercase tracking-widest">Create Account</p>
            <p className="text-white text-base font-bold">{STEPS[step]}</p>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            {STEPS.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-200"
                style={{ width: i === step ? 20 : 8, background: i <= step ? 'white' : 'rgba(255,255,255,0.3)' }} />
            ))}
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
          <div className="w-full max-w-sm">

            {/* Desktop step indicator */}
            <div className="hidden lg:flex items-center gap-2 mb-8">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold"
                    style={{ background: i <= step ? '#C67B2C' : '#E2DDD6', color: i <= step ? 'white' : '#9ca3af' }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: i <= step ? '#C67B2C' : '#9ca3af' }}>{label}</span>
                  {i < STEPS.length - 1 && <div className="w-8 h-px" style={{ background: i < step ? '#C67B2C' : '#E2DDD6' }} />}
                </div>
              ))}
            </div>

            {/* ── Step 0 ── */}
            {step === 0 && (
              <form onSubmit={nextStep} className="space-y-3">
                <div className="mb-6">
                  <h2 className="text-gray-900 text-2xl font-extrabold tracking-tight mb-1">Account Details</h2>
                  <p className="text-gray-500 text-sm">Set up your login credentials</p>
                </div>

                <Field icon={Phone} focused={focus === 'phone'}>
                  <span className="text-xs font-bold text-gray-400 border-r border-gray-200 pr-3 shrink-0 leading-none">+234</span>
                  <input type="tel" placeholder="Phone number" value={form.phone} onChange={set('phone')} inputMode="numeric"
                    onFocus={() => setFocus('phone')} onBlur={() => setFocus('')}
                    className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0" />
                </Field>

                <Field focused={focus === 'fullName'}>
                  <input type="text" placeholder="Full name (e.g. John Doe)" value={form.fullName} onChange={set('fullName')}
                    onFocus={() => setFocus('fullName')} onBlur={() => setFocus('')}
                    className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0" />
                </Field>

                <Field focused={focus === 'userName'}>
                  <span className="text-xs font-bold text-gray-400 border-r border-gray-200 pr-3 shrink-0 leading-none">@</span>
                  <input type="text" placeholder="Username (optional)" value={form.userName} onChange={set('userName')}
                    onFocus={() => setFocus('userName')} onBlur={() => setFocus('')}
                    className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0" />
                </Field>

                <Field icon={Lock} focused={focus === 'password'}>
                  <input type={showPw ? 'text' : 'password'} placeholder="Create password" value={form.password} onChange={set('password')}
                    onFocus={() => setFocus('password')} onBlur={() => setFocus('')}
                    className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0" />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </Field>

                <PasswordRules password={form.password} />

                <Field icon={Lock} focused={focus === 'confirm'} match={confirmState === 'match'} error={confirmState === 'error'}>
                  <input type="password" placeholder="Confirm password" value={form.confirmPassword} onChange={set('confirmPassword')}
                    onFocus={() => setFocus('confirm')} onBlur={() => setFocus('')}
                    className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0" />
                  {form.confirmPassword && (
                    <span className={`shrink-0 text-xs font-bold ${confirmState === 'match' ? 'text-green-500' : 'text-red-400'}`}>
                      {confirmState === 'match' ? '✓' : '✗'}
                    </span>
                  )}
                </Field>

                <Field icon={Gift} focused={focus === 'referral'} amber>
                  <input type="text" placeholder="Referral code (optional)" value={form.referralCode} onChange={set('referralCode')}
                    onFocus={() => setFocus('referral')} onBlur={() => setFocus('')}
                    className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent uppercase min-w-0" />
                </Field>

                <button type="submit" className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] mt-1"
                  style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 2px 12px rgba(198,123,44,0.3)' }}>
                  Continue <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* ── Step 1 ── */}
            {step === 1 && (
              <form onSubmit={nextStep} className="space-y-3">
                <div className="mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                    <ShieldCheck size={20} className="text-primary" />
                  </div>
                  <h2 className="text-gray-900 text-2xl font-extrabold tracking-tight mb-1">Security Question</h2>
                  <p className="text-gray-500 text-sm">Used to recover your password if forgotten</p>
                </div>

                <div className="relative">
                  <select value={form.securityQuestionId} onChange={set('securityQuestionId')}
                    className="w-full h-12 px-4 pr-10 bg-white border-[1.5px] border-[#E2DDD6] rounded-xl text-sm font-medium text-gray-800 outline-none appearance-none
                               focus:border-primary transition-all cursor-pointer">
                    <option value="">Select a security question</option>
                    {questions.map(q => <option key={q.id} value={q.id}>{q.question}</option>)}
                  </select>
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▾</span>
                </div>

                <Field focused={focus === 'answer'}>
                  <input type="text" placeholder="Your answer" value={form.securityAnswer} onChange={set('securityAnswer')}
                    onFocus={() => setFocus('answer')} onBlur={() => setFocus('')}
                    className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0" />
                </Field>

                <div className="rounded-xl p-3 text-xs text-primary font-medium leading-relaxed" style={{ background: '#FEF3E4', border: '1px solid #F5DDB8' }}>
                  💡 Remember this answer — it's required to reset your password.
                </div>

                <button type="submit" className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 2px 12px rgba(198,123,44,0.3)' }}>
                  Continue <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="mb-6">
                  <h2 className="text-gray-900 text-2xl font-extrabold tracking-tight mb-1">Almost there!</h2>
                  <p className="text-gray-500 text-sm">Verify you're human to complete sign up</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-11 bg-white rounded-xl border border-[#E2DDD6] overflow-hidden flex items-center justify-center">
                    {captchaLoading
                      ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      : captcha.image && <img src={captcha.image} alt="captcha" className="h-full object-contain px-2" />
                    }
                  </div>
                  <button type="button" onClick={fetchCaptcha} disabled={captchaLoading}
                    className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-primary hover:bg-orange-100 transition-colors disabled:opacity-50 shrink-0">
                    <RefreshCw size={14} className={captchaLoading ? 'animate-spin' : ''} />
                  </button>
                </div>

                <Field focused={focus === 'captcha'}>
                  <input type="text" placeholder="4-digit code" value={form.captchaAnswer} onChange={set('captchaAnswer')}
                    maxLength={4} inputMode="numeric" onFocus={() => setFocus('captcha')} onBlur={() => setFocus('')}
                    className="flex-1 outline-none text-base font-bold tracking-[0.5em] text-gray-800 placeholder:text-gray-400 placeholder:tracking-normal bg-transparent text-center min-w-0" />
                </Field>
              {/* ── Terms agreement ── */}
              <div className="flex items-start gap-3 px-1">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-0.5 w-4 h-4 rounded accent-primary shrink-0 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                  I have read and agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-primary font-bold hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" target="_blank" className="text-primary font-bold hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

                <button type="submit" disabled={loading}
                  className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 2px 12px rgba(198,123,44,0.3)' }}>
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" /> Creating account…</>
                    : 'Create Account 🎉'
                  }
                </button>
              </form>
            )}

            <p className="text-center text-gray-500 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register