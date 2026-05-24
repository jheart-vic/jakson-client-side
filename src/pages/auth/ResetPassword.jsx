import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { resetPassword } from '../../api/auth'
import PasswordRules, {
    validatePassword,
} from '../../components/common/passwordRules'
import { handleApiError } from '../../utils/errorHandler'

const ResetPassword = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const resetToken = location.state?.resetToken || ''

    const [form, setForm] = useState({ password: '', confirm: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [focus, setFocus] = useState('')

    if (!resetToken) {
        return (
            <div
                className='min-h-dvh flex flex-col items-center justify-center px-6'
                style={{
                    background:
                        'linear-gradient(160deg,#0e6a8f 0%,#1a9fd4 50%,#38bdf8 100%)',
                }}
            >
                <div className='card-glass p-8 text-center space-y-4 w-full max-w-sm'>
                    <span className='text-4xl block'>⚠️</span>
                    <p className='text-gray-700 font-semibold'>
                        Invalid or expired reset link.
                    </p>
                    <Link to='/forgot-password'>
                        <button className='btn btn-primary rounded-2xl h-12 w-full'>
                            Start Over
                        </button>
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
            handleApiError(err, 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    // confirm border state
    const confirmState = !form.confirm
        ? focus === 'confirm'
            ? 'focused'
            : ''
        : form.password === form.confirm
          ? 'match'
          : 'error'

    const borderClass = (state) =>
        state === 'match'
            ? 'border-success shadow-[0_0_0_3px_rgba(16,185,129,0.12)]'
            : state === 'error'
              ? 'border-danger shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
              : state === 'focused'
                ? 'border-primary shadow-[0_0_0_3px_rgba(26,159,212,0.15)]'
                : 'border-gray-200'

    return (
        <div
            className='min-h-dvh flex flex-col relative overflow-hidden'
            style={{
                background:
                    'linear-gradient(160deg,#0e6a8f 0%,#1a9fd4 50%,#38bdf8 100%)',
            }}
        >
            <div className='absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none' />

            {/* Header */}
            <div className='flex items-center px-5 pt-12 pb-6'>
                <Link
                    to='/forgot-password'
                    className='w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0'
                >
                    <ChevronLeft size={20} />
                </Link>
                <div className='flex-1 flex flex-col items-center gap-1'>
                    <img src='/logo.jpeg' alt='Luminos Energy' className='w-10 h-10 rounded-xl object-cover' style={{ border: '1px solid rgba(255,255,255,0.25)' }} />
                    <p className='text-white text-sm font-bold'>Set New Password</p>
                </div>
                <div className='w-10 shrink-0' />
            </div>

            <div className='flex-1 px-5 pb-10 overflow-y-auto'>
                <div className='card-glass p-6 animate-scale-in'>
                    {!done ? (
                        <form onSubmit={handleSubmit} className='space-y-3.5'>
                            <div className='mb-1'>
                                <div className='w-11 h-11 rounded-2xl bg-primary-light flex items-center justify-center mb-3'>
                                    <Lock size={20} className='text-primary' />
                                </div>
                                <h2 className='text-gray-800 text-xl font-bold'>
                                    New Password
                                </h2>
                                <p className='text-gray-500 text-sm mt-1'>
                                    Must meet all requirements below
                                </p>
                            </div>

                            {/* Password */}
                            <div
                                className={`flex items-center gap-2.5 px-4 h-13 bg-white border-[1.5px] rounded-2xl transition-all duration-200
                ${focus === 'password' ? 'border-primary shadow-input' : 'border-gray-200'}`}
                            >
                                <Lock
                                    size={14}
                                    className='text-gray-400 shrink-0'
                                />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    placeholder='New password'
                                    value={form.password}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            password: e.target.value,
                                        }))
                                    }
                                    onFocus={() => setFocus('password')}
                                    onBlur={() => setFocus('')}
                                    className='flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0'
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPw((p) => !p)}
                                    className='shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
                             text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
                                >
                                    {showPw ? (
                                        <EyeOff size={14} />
                                    ) : (
                                        <Eye size={14} />
                                    )}
                                </button>
                            </div>

                            <PasswordRules password={form.password} />

                            {/* Confirm password */}
                            <div
                                className={`flex items-center gap-2.5 px-4 h-13 bg-white border-[1.5px] rounded-2xl transition-all duration-200
                ${borderClass(confirmState)}`}
                            >
                                <Lock
                                    size={14}
                                    className='text-gray-400 shrink-0'
                                />
                                <input
                                    type='password'
                                    placeholder='Confirm new password'
                                    value={form.confirm}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            confirm: e.target.value,
                                        }))
                                    }
                                    onFocus={() => setFocus('confirm')}
                                    onBlur={() => setFocus('')}
                                    className='flex-1 outline-none text-sm font-medium text-gray-800 placeholder:text-gray-400 bg-transparent min-w-0'
                                />
                                {form.confirm && (
                                    <span
                                        className={`shrink-0 text-[11px] font-bold leading-none
                    ${form.password === form.confirm ? 'text-success' : 'text-danger'}`}
                                    >
                                        {form.password === form.confirm
                                            ? '✓'
                                            : '✗'}
                                    </span>
                                )}
                            </div>

                            <button
                                type='submit'
                                disabled={loading}
                                className='btn btn-primary rounded-2xl h-13 w-full flex items-center justify-center gap-2 mt-1'
                            >
                                {loading ? (
                                    <>
                                        <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                        Saving…
                                    </>
                                ) : (
                                    'Save New Password'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className='text-center space-y-5 py-4'>
                            <div className='w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto'>
                                <span className='text-4xl'>🔐</span>
                            </div>
                            <div>
                                <h2 className='text-gray-800 text-xl font-bold'>
                                    Password Reset!
                                </h2>
                                <p className='text-gray-500 text-sm mt-2 leading-relaxed'>
                                    Your password has been changed successfully.
                                    You can now sign in.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className='btn btn-primary rounded-2xl h-13 w-full'
                            >
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