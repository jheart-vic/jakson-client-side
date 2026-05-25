import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, RefreshCw, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCaptcha, login } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { handleApiError } from '../../utils/errorHandler'

const Field = ({ icon: Icon, focused, children }) => (
  <div
    className="flex items-center gap-3 px-4 h-12 bg-white rounded-xl border transition-all duration-150"
    style={{
      borderColor: focused ? '#C67B2C' : '#E2DDD6',
      boxShadow:   focused ? '0 0 0 3px rgba(198,123,44,0.12)' : 'none',
    }}
  >
    {Icon && <Icon size={15} style={{ color: focused ? '#C67B2C' : '#9ca3af', flexShrink: 0, transition: 'color 150ms' }} />}
    {children}
  </div>
)

const Login = () => {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login: authLogin } = useAuth()
  const from = location.state?.from?.pathname || '/main/dashboard'

  const [form, setForm]               = useState({ phone: '', password: '', captchaAnswer: '' })
  const [captcha, setCaptcha]         = useState({ id: '', image: '' })
  const [showPw, setShowPw]           = useState(false)
  const [loading, setLoading]         = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [focus, setFocus]             = useState('')

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    try {
      const { data } = await getCaptcha()
      setCaptcha({ id: data.captchaId, image: data.image })
      setForm(f => ({ ...f, captchaAnswer: '' }))
    } catch { /* interceptor handles */ }
    finally { setCaptchaLoading(false) }
  }, [])

   useEffect(() => {
        ;(async () => {
            await fetchCaptcha()
        })()
    }, [fetchCaptcha])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.phone || !form.password) return toast.error('Please fill all fields')
    if (!form.captchaAnswer)           return toast.error('Please enter the captcha')
    setLoading(true)
    try {
      const { data } = await login({ phone: form.phone.trim(), password: form.password, captchaId: captcha.id, captchaAnswer: form.captchaAnswer.trim() })
      authLogin(data.user)
      toast.success('Welcome back!')
      const dest = data.user?.role === 'admin' || data.user?.role === 'superadmin' ? '/admin/dashboard' : from
      navigate(dest, { replace: true })
    } catch (err) { handleApiError(err, 'Login failed'); fetchCaptcha() }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh flex" style={{ background: '#F5F1EB' }}>

      {/* ── Left panel: branding (desktop only) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-105 shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #C67B2C 0%, #8A4E18 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10" style={{ background: 'white' }} />
        <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full opacity-5" style={{ background: 'white', transform: 'translateY(-50%)' }} />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <img src="/logo.jpeg" alt="Luminos Energy" className="w-14 h-14 rounded-2xl object-cover" style={{ border: '1px solid rgba(255,255,255,0.25)' }} />
            <div>
              <p className="text-white font-extrabold text-lg leading-tight tracking-tight">Luminos Energy</p>
              <p className="text-white/60 text-xs font-medium">Smart Solar Investment</p>
            </div>
          </div>

          <h2 className="text-white text-3xl font-extrabold leading-snug tracking-tight mb-4">
            Grow your wealth<br />with solar energy.
          </h2>
          <p className="text-white/65 text-sm leading-relaxed">
            Join thousands of investors earning daily returns on Nigeria's leading solar investment platform.
          </p>
        </div>

        {/* Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { label: 'Active Investors', val: '12,000+' },
            { label: 'Daily Returns',    val: 'Up to 8%'  },
            { label: 'Platform Rating',  val: '4.9 ★'     },
            { label: 'Established',      val: '2022'       },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/10 rounded-2xl p-4 border border-white/15">
              <p className="text-white font-extrabold text-xl leading-tight">{val}</p>
              <p className="text-white/55 text-xs mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile header */}
        <div
          className="lg:hidden flex flex-col items-center pt-12 pb-6 px-6"
          style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}
        >
          <img src="/logo.jpeg" alt="Luminos Energy" className="w-20 h-20 rounded-2xl object-cover mb-3" style={{ border: '1px solid rgba(255,255,255,0.25)' }} />
          <h1 className="text-white text-xl font-extrabold tracking-tight">Luminos Energy</h1>
          <p className="text-white/65 text-xs mt-1">Smart Solar Investment</p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h2 className="text-gray-900 text-2xl font-extrabold tracking-tight mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Phone */}
              <Field icon={Phone} focused={focus === 'phone'}>
                <span className="text-xs font-bold text-gray-400 border-r border-gray-200 pr-3 shrink-0 leading-none">+234</span>
                <input
                  type="tel" placeholder="Phone number" value={form.phone}
                  onChange={set('phone')} inputMode="numeric"
                  onFocus={() => setFocus('phone')} onBlur={() => setFocus('')}
                  className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0"
                />
              </Field>

              {/* Password */}
              <Field icon={Lock} focused={focus === 'password'}>
                <input
                  type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password}
                  onChange={set('password')} onFocus={() => setFocus('password')} onBlur={() => setFocus('')}
                  className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0"
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </Field>

              {/* Captcha */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-11 bg-white rounded-xl border border-[#E2DDD6] overflow-hidden flex items-center justify-center">
                  {captchaLoading
                    ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    : captcha.image && <img src={captcha.image} alt="captcha" className="h-full object-contain px-2" />
                  }
                </div>
                <button type="button" onClick={fetchCaptcha} disabled={captchaLoading}
                  className="w-11 h-11 bg-primary-light rounded-xl flex items-center justify-center text-primary transition-colors hover:bg-orange-100 disabled:opacity-50 shrink-0">
                  <RefreshCw size={14} className={captchaLoading ? 'animate-spin' : ''} />
                </button>
              </div>

              <Field focused={focus === 'captcha'}>
                <input
                  type="text" placeholder="Enter 4-digit code" value={form.captchaAnswer}
                  onChange={set('captchaAnswer')} maxLength={4} inputMode="numeric"
                  onFocus={() => setFocus('captcha')} onBlur={() => setFocus('')}
                  className="flex-1 outline-none text-sm font-bold tracking-[0.4em] text-gray-800
                             placeholder:text-gray-400 placeholder:tracking-normal bg-transparent text-center min-w-0"
                />
              </Field>

              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2
                           transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 2px 12px rgba(198,123,44,0.35)' }}
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" /> Signing in…</>
                  : <>Sign In <ArrowRight size={15} /></>
                }
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <Link to="/forgot-password" className="block text-center text-sm text-primary font-semibold hover:underline">
                Forgot password?
              </Link>
              <div className="flex items-center gap-3 text-gray-400 text-xs">
                <div className="flex-1 h-px bg-gray-200" />or<div className="flex-1 h-px bg-gray-200" />
              </div>
              <Link to="/register">
                <button className="w-full h-11 rounded-xl border-[1.5px] border-primary text-primary font-bold text-sm
                                   hover:bg-primary-light transition-colors duration-150">
                  Create an account
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Login