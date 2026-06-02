import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { changePassword } from '../../api/auth'
import PageHeader from '../../components/layout/PageHeader'
import PasswordRules, { validatePassword } from '../../components/common/passwordRules'
import { handleApiError } from '../../utils/errorHandler'


// ✅ Declare OUTSIDE
const PwField = ({
  placeholder,
  value,
  show,
  onChange,
  onToggle,
}) => (
  <div className="flex items-center gap-2 px-4 py-3.5 bg-white border-[1.5px] border-gray-200 rounded-2xl
                  focus-within:border-primary focus-within:shadow-input transition-all">
    <Lock size={15} className="text-gray-400 shrink-0" />

    <input
      type={show ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400"
    />

    <button
      type="button"
      onClick={onToggle}
      className="text-gray-400 shrink-0"
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  </div>
)


const ChangePassword = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    current: '',
    password: '',
    confirm: '',
  })

  const [showPw, setShowPw] = useState({
    current: false,
    password: false,
  })

  const [loading, setLoading] = useState(false)

  const set = (k) => (e) =>
    setForm((f) => ({
      ...f,
      [k]: e.target.value,
    }))

  const toggleShow = (k) =>
    setShowPw((s) => ({
      ...s,
      [k]: !s[k],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.current) {
      return toast.error('Enter your current password')
    }

    if (!validatePassword(form.password)) {
      return toast.error('New password does not meet all requirements')
    }

    // if (form.password !== form.confirm) {
    //   return toast.error('Passwords do not match')
    // }

    if (form.password === form.current) {
      return toast.error('New password must be different from current')
    }

    setLoading(true)

    try {
      await changePassword({
        currentPassword: form.current,
        newPassword: form.password,
      })

      toast.success('Password changed successfully!')
      navigate(-1)
    } catch (err) {
            handleApiError(err, 'Failed to load notifications')
        } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh pb-8">
      <PageHeader title="Change Password" />

      <form onSubmit={handleSubmit} className="px-4 mt-6 space-y-4">
        <div className="card card-p space-y-4">

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Current Password
            </p>

            <PwField
              field="current"
              placeholder="Enter current password"
              value={form.current}
              show={showPw.current}
              onChange={set('current')}
              onToggle={() => toggleShow('current')}
            />
          </div>

          <div className="border-t border-gray-50 pt-4">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              New Password
            </p>

            <PwField
              field="password"
              placeholder="Create new password"
              value={form.password}
              show={showPw.password}
              onChange={set('password')}
              onToggle={() => toggleShow('password')}
            />

            <div className="mt-3">
              <PasswordRules password={form.password} />
            </div>
          </div>

          {/* Confirm field stays as-is */}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary rounded-2xl h-14"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
          ) : (
            'Save Password'
          )}
        </button>
      </form>
    </div>
  )
}

export default ChangePassword