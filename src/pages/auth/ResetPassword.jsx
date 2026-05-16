import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { resetPassword } from '../../api/auth'
import PasswordRules, { validatePassword } from '../../components/common/passwordRules'

const ResetPassword = () => {
  const navigate   = useNavigate()
  const location   = useLocation()
  const resetToken = location.state?.resetToken || ''

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!resetToken) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6"
        style={{ background: 'linear-gradient(160deg,#0e6a8f 0%,#1a9fd4 50%,#38bdf8 100%)' }}>
        <div className="card-glass p-8 text-center space-y-4">
          <span className="text-4xl block">⚠️</span>
          <p className="text-gray-700 font-semibold">Invalid or expired reset link.</p>
          <Link to="/forgot-password">
            <button className="btn btn-primary rounded-2xl h-12">Start Over</button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.password) return toast.error('Enter a new password')
    if (!validatePassword(form.password))
      return toast.error('Password does not meet all requirements')
    if (form.password !== form.confirm)
      return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await resetPassword({ resetToken, newPassword: form.password })
      setDone(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Please start over.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#0e6a8f 0%,#1a9fd4 50%,#38bdf8 100%)' }}>

      <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center px-5 pt-12 pb-6">
        <Link to="/forgot-password"
          className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex-1 text-center">
          <p className="text-white text-base font-bold">Set New Password</p>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-5 pb-10 overflow-y-auto">
        <div className="card-glass p-6 animate-scale-in">
          {!done ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-3">
                  <Lock size={22} className="text-primary" />
                </div>
                <h2 className="text-gray-800 text-xl font-bold">New Password</h2>
                <p className="text-gray-500 text-sm mt-1">Must meet all requirements below</p>
              </div>

              {/* Password input */}
              <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
                              focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)] transition-all">
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input type={showPw ? 'text' : 'password'} placeholder="New password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="text-gray-400 shrink-0">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Live password rules */}
              <PasswordRules password={form.password} />

              {/* Confirm password */}
              <div className={`flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] rounded-2xl transition-all
                ${form.confirm
                    ? form.password === form.confirm
                      ? 'border-success shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
                      : 'border-danger  shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                    : 'border-gray-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)]'}`}>
                <Lock size={15} className="text-gray-400 shrink-0" />
                <input type="password" placeholder="Confirm new password"
                  value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  className="flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent" />
                {form.confirm && (
                  <span className="text-xs font-bold shrink-0">
                    {form.password === form.confirm
                      ? <span className="text-success">✓ Match</span>
                      : <span className="text-danger">✗ No match</span>}
                  </span>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary rounded-2xl h-14">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />Saving…</>
                  : 'Save New Password'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto">
                <span className="text-4xl">🔐</span>
              </div>
              <div>
                <h2 className="text-gray-800 text-xl font-bold">Password Reset!</h2>
                <p className="text-gray-500 text-sm mt-2">
                  Your password has been changed successfully. You can now sign in.
                </p>
              </div>
              <button onClick={() => navigate('/login')} className="btn btn-primary rounded-2xl h-14">
                Sign In Now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword