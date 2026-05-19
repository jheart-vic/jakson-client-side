// import { useState, useEffect, useCallback } from 'react'
// import { Link, useNavigate, useLocation } from 'react-router-dom'
// import { Phone, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { getCaptcha, login } from '../../api/auth'
// import { useAuth } from '../../context/AuthContext'

// const Login = () => {
//   const navigate = useNavigate()
//   const location = useLocation()
//   const { login: authLogin } = useAuth()
//   const from = location.state?.from?.pathname || '/main/dashboard'

//   const [form, setForm]       = useState({ phone: '', password: '', captchaAnswer: '' })
//   const [captcha, setCaptcha] = useState({ id: '', image: '' })
//   const [showPw, setShowPw]   = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [captchaLoading, setCaptchaLoading] = useState(false)

//   const fetchCaptcha = useCallback(async () => {
//     setCaptchaLoading(true)
//     try {
//       const { data } = await getCaptcha()
//       setCaptcha({ id: data.captchaId, image: data.image })
//       setForm(f => ({ ...f, captchaAnswer: '' }))
//     } catch { toast.error('Failed to load captcha') }
//     finally { setCaptchaLoading(false) }
//   }, [])

//     useEffect(() => {
//   (async () => { await fetchCaptcha() })()
// }, [fetchCaptcha])

//   const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!form.phone || !form.password) return toast.error('Please fill all fields')
//     if (!form.captchaAnswer) return toast.error('Please enter the captcha')
//     setLoading(true)
//     try {
//       const { data } = await login({
//         phone: form.phone.trim(), password: form.password,
//         captchaId: captcha.id, captchaAnswer: form.captchaAnswer.trim(),
//       })
//       authLogin(data.token, data.user)
//       toast.success('Welcome back! 👋')
//       const dest = (data.user?.role === 'admin' || data.user?.role === 'superadmin')
//         ? '/admin/dashboard' : from
//       navigate(dest, { replace: true })
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Login failed')
//       fetchCaptcha()
//     } finally { setLoading(false) }
//   }

//   return (
//     <div className="min-h-dvh flex flex-col relative overflow-hidden"
//       style={{ background: 'linear-gradient(160deg,#0e6a8f 0%,#1a9fd4 50%,#38bdf8 100%)' }}>

//       {/* Blobs */}
//       <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
//       <div className="absolute bottom-32 -left-16 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />

//       {/* Logo */}
//       <div className="flex flex-col items-center pt-14 pb-6 px-6 animate-slide-up">
//         <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg border border-white/30">
//           <span className="text-4xl">☀️</span>
//         </div>
//         <h1 className="text-white text-2xl font-extrabold tracking-tight">Luminos Energy</h1>
//         <p className="text-white/70 text-sm mt-1 font-medium">Smart Solar Investment</p>
//       </div>

//       {/* Card */}
//       <div className="flex-1 px-5 pb-10">
//         <div className="card-glass p-6 animate-slide-up delay-100">
//           <h2 className="text-gray-800 text-xl font-bold mb-1">Welcome back</h2>
//           <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Phone */}
//             <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
//                             focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)] transition-all">
//               <span className="text-xs font-bold text-gray-500 border-r border-gray-200 pr-3 shrink-0">+234</span>
//               <Phone size={15} className="text-gray-400 shrink-0" />
//               <input type="tel" placeholder="Phone number" value={form.phone} onChange={set('phone')}
//                 className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent"
//                 inputMode="numeric" />
//             </div>

//             {/* Password */}
//             <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
//                             focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)] transition-all">
//               <Lock size={15} className="text-gray-400 shrink-0" />
//               <input type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={set('password')}
//                 className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent" />
//               <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 shrink-0">
//                 {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
//               </button>
//             </div>

//             {/* Captcha */}
//             <div className="space-y-2">
//               <div className="flex items-center gap-3">
//                 <div className="flex-1 h-12 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center">
//                   {captchaLoading
//                     ? <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin-slow" />
//                     : captcha.image && <img src={captcha.image} alt="captcha" className="h-full object-contain" />
//                   }
//                 </div>
//                 <button type="button" onClick={fetchCaptcha} disabled={captchaLoading}
//                   className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-primary
//                              active:scale-95 transition-transform disabled:opacity-50 shrink-0">
//                   <RefreshCw size={15} className={captchaLoading ? 'animate-spin-slow' : ''} />
//                 </button>
//               </div>
//               <input type="text" placeholder="Enter the 4 digits" value={form.captchaAnswer} onChange={set('captchaAnswer')}
//                 maxLength={4} inputMode="numeric"
//                 className="input text-center text-2xl font-bold tracking-[0.4em] rounded-2xl h-14" />
//             </div>

//             {/* Submit */}
//             <button type="submit" disabled={loading} className="btn btn-primary rounded-2xl h-14 mt-2">
//               {loading
//                 ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />Signing in…</>
//                 : 'Sign In'}
//             </button>
//           </form>

//           <div className="mt-5 space-y-3">
//             <Link to="/forgot-password" className="block text-center text-sm text-primary font-semibold">
//               Forgot password?
//             </Link>
//             <div className="divider">or</div>
//             <Link to="/register">
//               <button className="btn btn-outline rounded-2xl h-13 text-sm font-bold">
//                 Create an account
//               </button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Login

import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCaptcha, login } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'

const InputWrap = ({ children, focused }) => (
  <div className={`flex items-center gap-2.5 px-4 h-13 bg-white border-[1.5px] rounded-2xl transition-all duration-200
    ${focused
      ? 'border-primary shadow-input'
      : 'border-gray-200'}`}>
    {children}
  </div>
)

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login: authLogin } = useAuth()
  const from = location.state?.from?.pathname || '/main/dashboard'

  const [form, setForm]       = useState({ phone: '', password: '', captchaAnswer: '' })
  const [captcha, setCaptcha] = useState({ id: '', image: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaLoading, setCaptchaLoading] = useState(false)
  const [focus, setFocus]     = useState('')

  const fetchCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    try {
      const { data } = await getCaptcha()
      setCaptcha({ id: data.captchaId, image: data.image })
      setForm(f => ({ ...f, captchaAnswer: '' }))
    } catch { toast.error('Failed to load captcha') }
    finally { setCaptchaLoading(false) }
  }, [])

  useEffect(() => { ;(async () => { await fetchCaptcha() })() }, [fetchCaptcha])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone || !form.password) return toast.error('Please fill all fields')
    if (!form.captchaAnswer) return toast.error('Please enter the captcha')
    setLoading(true)
    try {
      const { data } = await login({
        phone: form.phone.trim(), password: form.password,
        captchaId: captcha.id, captchaAnswer: form.captchaAnswer.trim(),
      })
      authLogin(data.token, data.user)
      toast.success('Welcome back! 👋')
      const dest = (data.user?.role === 'admin' || data.user?.role === 'superadmin')
        ? '/admin/dashboard' : from
      navigate(dest, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
      fetchCaptcha()
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}>

      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 -left-16 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex flex-col items-center pt-14 pb-6 px-6 animate-slide-up">
        <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4
                        shadow-lg border border-white/30">
          <span className="text-4xl">☀️</span>
        </div>
        <h1 className="text-white text-2xl font-extrabold tracking-tight">Luminos Energy</h1>
        <p className="text-white/70 text-sm mt-1 font-medium">Smart Solar Investment</p>
      </div>

      {/* Card */}
      <div className="flex-1 px-5 pb-10">
        <div className="card-glass p-6 animate-slide-up">
          <h2 className="text-gray-800 text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-3.5">

            {/* Phone */}
            <InputWrap focused={focus === 'phone'}>
              <span className="text-xs font-bold text-gray-400 border-r border-gray-200 pr-3 shrink-0 leading-none">+234</span>
              <Phone size={14} className="text-gray-400 shrink-0" />
              <input
                type="tel" placeholder="Phone number" value={form.phone}
                onChange={set('phone')} inputMode="numeric"
                onFocus={() => setFocus('phone')} onBlur={() => setFocus('')}
                className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0"
              />
            </InputWrap>

            {/* Password */}
            <InputWrap focused={focus === 'password'}>
              <Lock size={14} className="text-gray-400 shrink-0" />
              <input
                type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password}
                onChange={set('password')}
                onFocus={() => setFocus('password')} onBlur={() => setFocus('')}
                className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0"
              />
              <button
                type="button" onClick={() => setShowPw(p => !p)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400
                           hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </InputWrap>

            {/* Captcha image */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 h-12 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden
                              flex items-center justify-center">
                {captchaLoading
                  ? <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  : captcha.image && <img src={captcha.image} alt="captcha" className="h-full object-contain px-2" />
                }
              </div>
              <button
                type="button" onClick={fetchCaptcha} disabled={captchaLoading}
                className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center text-primary
                           active:scale-95 transition-transform disabled:opacity-50 shrink-0"
              >
                <RefreshCw size={14} className={captchaLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Captcha input — fixed font size */}
            <InputWrap focused={focus === 'captcha'}>
              <input
                type="text" placeholder="Enter 4-digit code" value={form.captchaAnswer}
                onChange={set('captchaAnswer')} maxLength={4} inputMode="numeric"
                onFocus={() => setFocus('captcha')} onBlur={() => setFocus('')}
                className="flex-1 outline-none text-sm font-bold tracking-[0.5em] text-gray-800
                           placeholder:text-gray-400 placeholder:tracking-normal bg-transparent text-center min-w-0"
              />
            </InputWrap>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-13 rounded-2xl mt-1
                         bg-primary text-white text-sm font-bold
                         shadow-[0_4px_16px_rgba(26,159,212,0.35)] active:scale-[0.98] transition-transform disabled:opacity-60">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</>
                : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 space-y-3">
            <Link to="/forgot-password" className="block text-center text-sm text-primary font-semibold">
              Forgot password?
            </Link>
            <div className="divider">or</div>
            <Link to="/register">
              <button className="btn btn-outline rounded-2xl h-13 text-sm font-bold w-full">
                Create an account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login