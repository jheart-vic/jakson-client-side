import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { changePassword } from '../../api/auth'
import PageHeader from '../../components/layout/PageHeader'
import PasswordRules, { validatePassword } from '../../components/common/PasswordRules'

const ChangePassword = () => {
  const navigate = useNavigate()
  const [form, setForm]     = useState({ current: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState({ current: false, password: false })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const toggleShow = (k) => setShowPw(s => ({ ...s, [k]: !s[k] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.current) return toast.error('Enter your current password')
    if (!validatePassword(form.password)) return toast.error('New password does not meet all requirements')
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password === form.current) return toast.error('New password must be different from current')
    setLoading(true)
    try {
      await changePassword({ currentPassword: form.current, newPassword: form.password })
      toast.success('Password changed successfully!')
      navigate(-1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setLoading(false) }
  }

  const PwField = ({ field, placeholder }) => (
    <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
                    focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)] transition-all">
      <Lock size={15} className="text-gray-400 shrink-0" />
      <input type={showPw[field] ? 'text' : 'password'} placeholder={placeholder}
        value={form[field]} onChange={set(field)}
        className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400" />
      <button type="button" onClick={() => toggleShow(field)} className="text-gray-400 shrink-0">
        {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <PageHeader title="Change Password" />
      <form onSubmit={handleSubmit} className="px-4 mt-6 space-y-4">
        <div className="card card-p space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Current Password</p>
            <PwField field="current" placeholder="Enter current password" />
          </div>
          <div className="border-t border-gray-50 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">New Password</p>
            <PwField field="password" placeholder="Create new password" />
            <div className="mt-3"><PasswordRules password={form.password} /></div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Confirm New Password</p>
            <div className={`flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] rounded-2xl transition-all
              ${form.confirm
                  ? form.password === form.confirm
                    ? 'border-success shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
                    : 'border-danger shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
                  : 'border-gray-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(26,159,212,0.15)]'}`}>
              <Lock size={15} className="text-gray-400 shrink-0" />
              <input type="password" placeholder="Confirm new password" value={form.confirm} onChange={set('confirm')}
                className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400" />
              {form.confirm && (
                <span className={`text-xs font-bold shrink-0 ${form.password === form.confirm ? 'text-success' : 'text-danger'}`}>
                  {form.password === form.confirm ? '✓' : '✗'}
                </span>
              )}
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary rounded-2xl h-14">
          {loading
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
            : 'Save Password'}
        </button>
      </form>
    </div>
  )
}

export default ChangePassword
