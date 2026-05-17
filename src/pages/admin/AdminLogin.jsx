// import { useState } from 'react'
// import { Navigate, useNavigate } from 'react-router-dom'
// import { Phone, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
// import toast from 'react-hot-toast'
// import { useAuth } from '../../context/AuthContext'
// import { adminLogin } from '../../api/auth'

// const AdminLogin = () => {
//   const { isAuthenticated, isAdmin, login } = useAuth()
//   const navigate = useNavigate()


//   const [form, setForm]       = useState({ phone: '', password: '' })
//   const [showPw, setShowPw]   = useState(false)
//   const [loading, setLoading] = useState(false)

//   if (isAuthenticated && isAdmin) {
//     return <Navigate to="/admin/dashboard" replace />
//   }

//   const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!form.phone.trim()) return toast.error('Enter your phone number')
//     if (!form.password)     return toast.error('Enter your password')

//     setLoading(true)
//     try {
//       const { data } = await adminLogin({
//         phone:    form.phone.trim(),
//         password: form.password,
//       })
//       login(data.token, data.user)
//       toast.success('Welcome back, Admin 👋')
//       navigate('/admin/dashboard', { replace: true })
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Invalid credentials')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div
//       className="min-h-dvh flex flex-col items-center justify-center px-5 relative overflow-hidden"
//       style={{ background: 'linear-gradient(160deg,#0e6a8f 0%,#1a9fd4 50%,#38bdf8 100%)' }}
//     >
//       {/* Background blobs */}
//       <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
//       <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

//       {/* Card */}
//       <div className="w-full max-w-sm card-glass p-8 animate-scale-in">

//         {/* Icon + Title */}
//         <div className="flex flex-col items-center mb-8">
//           <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center
//                           shadow-[0_8px_24px_rgba(14,106,143,0.4)] mb-4">
//             <ShieldCheck size={28} className="text-white" />
//           </div>
//           <h1 className="text-gray-800 text-2xl font-extrabold tracking-tight">Admin Portal</h1>
//           <p className="text-gray-400 text-sm mt-1">Restricted access — authorised personnel only</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">

//           {/* Phone */}
//           <div>
//             <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
//               Phone Number
//             </label>
//             <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
//                             focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)] transition-all">
//               <Phone size={15} className="text-gray-400 shrink-0" />
//               <input
//                 type="tel"
//                 placeholder="Admin phone number"
//                 value={form.phone}
//                 onChange={set('phone')}
//                 inputMode="numeric"
//                 autoComplete="username"
//                 className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent"
//               />
//             </div>
//           </div>

//           {/* Password */}
//           <div>
//             <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
//               Password
//             </label>
//             <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
//                             focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)] transition-all">
//               <Lock size={15} className="text-gray-400 shrink-0" />
//               <input
//                 type={showPw ? 'text' : 'password'}
//                 placeholder="Admin password"
//                 value={form.password}
//                 onChange={set('password')}
//                 autoComplete="current-password"
//                 className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPw(p => !p)}
//                 className="text-gray-400 shrink-0"
//               >
//                 {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
//               </button>
//             </div>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full flex items-center justify-center gap-2 h-14 rounded-2xl
//                        bg-primary text-white text-sm font-bold mt-2
//                        shadow-[0_4px_16px_rgba(26,159,212,0.4)]
//                        active:scale-95 transition-transform disabled:opacity-60"
//           >
//             {loading
//               ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//               : 'Sign In to Admin Panel'}
//           </button>
//         </form>

//         {/* Footer note */}
//         <p className="text-center text-gray-400 text-xs mt-6">
//           Not an admin?{' '}
//           <a href="/login" className="text-primary font-bold">Go to user login</a>
//         </p>
//       </div>
//     </div>
//   )
// }

// export default AdminLogin

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Phone, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { adminLogin } from '../../api/auth'

const AdminLogin = () => {
  const { isAuthenticated, isAdmin, login } = useAuth()
  const navigate = useNavigate()

  const [form,    setForm]    = useState({ phone: '', password: '' })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [focus,   setFocus]   = useState('')

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone.trim()) return toast.error('Enter your phone number')
    if (!form.password)     return toast.error('Enter your password')
    setLoading(true)
    try {
      const { data } = await adminLogin({ phone: form.phone.trim(), password: form.password })
      login(data.token, data.user)
      toast.success('Welcome back, Admin 👋')
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#0e6a8f 0%,#1a9fd4 50%,#38bdf8 100%)' }}
    >
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm card-glass p-8 animate-scale-in">

        {/* Icon + Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center
                          shadow-[0_8px_24px_rgba(14,106,143,0.4)] mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-gray-800 text-2xl font-extrabold tracking-tight">Admin Portal</h1>
          <p className="text-gray-400 text-sm mt-1 text-center">Restricted access — authorised personnel only</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Phone */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              Phone Number
            </label>
            <div className={`flex items-center gap-2.5 px-4 h-13 bg-white border-[1.5px] rounded-2xl transition-all duration-200
              ${focus === 'phone' ? 'border-primary shadow-input' : 'border-gray-200'}`}>
              <Phone size={14} className="text-gray-400 shrink-0" />
              <input
                type="tel" placeholder="Admin phone number" value={form.phone}
                onChange={set('phone')} inputMode="numeric" autoComplete="username"
                onFocus={() => setFocus('phone')} onBlur={() => setFocus('')}
                className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              Password
            </label>
            <div className={`flex items-center gap-2.5 px-4 h-13 bg-white border-[1.5px] rounded-2xl transition-all duration-200
              ${focus === 'password' ? 'border-primary shadow-input' : 'border-gray-200'}`}>
              <Lock size={14} className="text-gray-400 shrink-0" />
              <input
                type={showPw ? 'text' : 'password'} placeholder="Admin password"
                value={form.password} onChange={set('password')} autoComplete="current-password"
                onFocus={() => setFocus('password')} onBlur={() => setFocus('')}
                className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0"
              />
              <button
                type="button" onClick={() => setShowPw(p => !p)}
                className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
                           text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 h-13 rounded-2xl mt-2
                       bg-primary text-white text-sm font-bold
                       shadow-[0_4px_16px_rgba(26,159,212,0.4)]
                       active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Sign In to Admin Panel'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          Not an admin?{' '}
          <a href="/login" className="text-primary font-bold">Go to user login</a>
        </p>
      </div>
    </div>
  )
}

export default AdminLogin