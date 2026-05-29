import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, Shield, DollarSign,
  LogIn, UserCheck, UserX, RefreshCw,
  ArrowDownLeft, ArrowUpRight, Wallet,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminGetUser, adminSuspendUser, adminUnsuspendUser,
  adminLoginAsUser, adminAssignRole,
  adminCreditWallet, adminDeductWallet,
} from '../../api/admin'
import { fmtUSD } from '../../utils/currency'
import { fmtDateTime, fmtDate } from '../../utils/date'
import { useAuth } from '../../context/AuthContext'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'


const ROLE_OPTIONS = ['user', 'admin', 'superadmin']

const CATEGORY_LABELS = {
  deposit:        'Deposit',
  withdrawal:     'Withdrawal',
  investment:     'Investment',
  daily_income:   'Daily Income',
  referral_bonus: 'Referral',
  reward_code:    'Reward Code',
  daily_checkin:  'Check-in',
  refund:         'Refund',
}

const TABS = [
  { key: 'transactions', label: 'Txns'        },
  { key: 'investments',  label: 'Invests'     },
  { key: 'deposits',     label: 'Deposits'    },
  { key: 'withdrawals',  label: 'Withdrawals' },
]

const AdminUserDetail = () => {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { isSuperAdmin, login: authLogin } = useAuth()

  const [data,          setData]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [modal,         setModal]         = useState(null)
  const [working,       setWorking]       = useState(false)
  const [impersonating, setImpersonating] = useState(false)
  const [walletForm,    setWalletForm]    = useState({ amount: '', reason: '' })
  const [newRole,       setNewRole]       = useState('')
  const [suspendReason, setSuspendReason] = useState('')
  const [activeTab,     setActiveTab]     = useState('transactions')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: d } = await adminGetUser(id)
      setData(d)
    } catch {
      toast.error('Failed to load user')
      navigate('/admin/users')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => { ;(async () => { await load() })() }, [load])

  const handleSuspend = async () => {
    setWorking(true)
    try {
      if (data.user.isActive) {
        await adminSuspendUser(id, suspendReason)
        toast.success('User suspended')
      } else {
        await adminUnsuspendUser(id)
        toast.success('User reactivated')
      }
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setWorking(false) }
  }

  const handleWallet = async () => {
    const amount = parseFloat(walletForm.amount)
    if (!amount || amount <= 0)    return toast.error('Enter a valid amount')
    if (!walletForm.reason.trim()) return toast.error('Reason is required')
    setWorking(true)
    try {
      if (modal === 'credit') {
        const { data: d } = await adminCreditWallet(id, { amountUSD: amount, reason: walletForm.reason })
        toast.success(d.message)
      } else {
        const { data: d } = await adminDeductWallet(id, { amountUSD: amount, reason: walletForm.reason })
        toast.success(d.message)
      }
      setModal(null)
      setWalletForm({ amount: '', reason: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setWorking(false) }
  }

  const handleRole = async () => {
    if (!newRole) return toast.error('Select a role')
    setWorking(true)
    try {
      await adminAssignRole(id, newRole)
      toast.success(`Role updated to ${newRole}`)
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally { setWorking(false) }
  }

  const handleImpersonate = async () => {
    setImpersonating(true)
    try {
      const { data: d } = await adminLoginAsUser(id)
      toast.success(`Now viewing as ${d.targetUser.phone}`)
      // Set user immediately from response, then re-fetch from server
      // so isAdmin / role flags are correct before UserLayout renders
      localStorage.setItem('isImpersonating', 'true')
      authLogin(d.targetUser)
      // await refreshUser()
      navigate('/main/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
      setImpersonating(false)
    }
    // No finally reset — spinner persists through navigation intentionally
  }

  if (loading) return <div className="py-12"><Spinner /></div>
  if (!data)   return null

  const { user: u, stats, activity } = data

  return (
    <div className="space-y-4">

      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/users')}
          className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center
                     justify-center text-gray-500 hover:text-primary transition-colors shrink-0"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold text-gray-800 truncate">{u.phone}</h1>
          <p className="text-xs text-gray-400">ID: {u.id}</p>
        </div>
        <button onClick={load} className="ml-auto text-gray-400 hover:text-primary transition-colors shrink-0">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0
            ${u.isActive ? 'bg-primary-light' : 'bg-gray-100'}`}>
            {u.isActive
              ? <UserCheck size={20} className="text-primary" />
              : <UserX    size={20} className="text-gray-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-gray-800 truncate">{u.maskedPhone}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                ${u.role === 'superadmin' ? 'bg-purple-100 text-purple-700'
                : u.role === 'admin'      ? 'bg-primary-light text-primary'
                :                          'bg-gray-100 text-gray-500'}`}>
                {u.role}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                ${u.isActive ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
                {u.isActive ? 'Active' : 'Suspended'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                VIP{u.vipLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Balance',    val: fmtUSD(u.balance),           color: 'text-primary' },
            { label: 'Deposited',  val: fmtUSD(stats.totalDeposited), color: 'text-success' },
            { label: 'Withdrawn',  val: fmtUSD(stats.totalWithdrawn), color: 'text-danger'  },
            { label: 'Earnings',   val: fmtUSD(u.totalEarnings),     color: 'text-warning'  },
            { label: 'Invests',    val: stats.totalInvestments,       color: 'text-gray-700' },
            { label: 'Referrals',  val: stats.directReferrals,        color: 'text-gray-700' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className={`text-sm font-extrabold ${color}`}>{val}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-400 border-t border-gray-50 pt-3">
          <p>Joined: <span className="text-gray-600 font-semibold">{fmtDate(u.createdAt)}</span></p>
          <p>Last login: <span className="text-gray-600 font-semibold">{u.lastLogin ? fmtDate(u.lastLogin) : 'Never'}</span></p>
          <p>Referral: <span className="text-primary font-bold">{u.referralCode}</span></p>
          <p>Active invests: <span className="text-gray-600 font-semibold">{stats.activeInvestments}</span></p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setModal('credit'); setWalletForm({ amount: '', reason: '' }) }}
          className="flex items-center justify-center gap-2 bg-success text-white py-3 rounded-2xl
                     text-sm font-bold shadow-[0_4px_12px_rgba(16,185,129,0.25)] active:scale-95 transition-transform"
        >
          <DollarSign size={15} /> Credit
        </button>
        <button
          onClick={() => { setModal('deduct'); setWalletForm({ amount: '', reason: '' }) }}
          className="flex items-center justify-center gap-2 bg-danger text-white py-3 rounded-2xl
                     text-sm font-bold shadow-[0_4px_12px_rgba(239,68,68,0.25)] active:scale-95 transition-transform"
        >
          <Wallet size={15} /> Deduct
        </button>
        <button
          onClick={() => setModal('suspend')}
          className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold
                     active:scale-95 transition-transform
                     ${u.isActive
                       ? 'bg-warning-light text-warning border-2 border-warning/30'
                       : 'bg-success-light text-success border-2 border-success/30'}`}
        >
          {u.isActive
            ? <><UserX size={15} /> Suspend</>
            : <><UserCheck size={15} /> Reactivate</>}
        </button>
        <button
          onClick={handleImpersonate}
          disabled={impersonating}
          className="flex items-center justify-center gap-2 bg-primary-light text-primary
                     border-2 border-primary/20 py-3 rounded-2xl text-sm font-bold
                     active:scale-95 transition-transform disabled:opacity-70"
        >
          {impersonating ? (
            <>
              <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin-slow" />
              Logging in…
            </>
          ) : (
            <><LogIn size={15} /> Login As</>
          )}
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => { setNewRole(u.role); setModal('role') }}
            className="col-span-2 flex items-center justify-center gap-2 bg-purple-50 text-purple-700
                       border-2 border-purple-200 py-3 rounded-2xl text-sm font-bold
                       active:scale-95 transition-transform"
          >
            <Shield size={15} /> Assign Role
          </button>
        )}
      </div>

      {/* Activity tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-card">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all
              ${activeTab === t.key ? 'bg-primary text-white shadow-sm' : 'text-gray-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {!activity[activeTab] || activity[activeTab].length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No records</div>
        ) : activity[activeTab].map((item, i, arr) => {
          const notLast = i < arr.length - 1

          if (activeTab === 'transactions') {
            const isIn = item.type === 'in'
            return (
              <div key={item._id} className={`flex items-center gap-3 px-4 py-3.5 ${notLast ? 'border-b border-gray-50' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                  ${isIn ? 'bg-success-light' : 'bg-danger-light'}`}>
                  {isIn
                    ? <ArrowDownLeft size={14} className="text-success" />
                    : <ArrowUpRight  size={14} className="text-danger"  />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-800">{CATEGORY_LABELS[item.category] || item.category}</p>
                  <p className="text-[10px] text-gray-400 truncate">{fmtDateTime(item.createdAt)}</p>
                </div>
                <p className={`text-sm font-extrabold shrink-0 ${isIn ? 'text-success' : 'text-danger'}`}>
                  {isIn ? '+' : '-'}{fmtUSD(item.amountUSD)}
                </p>
              </div>
            )
          }

          if (activeTab === 'investments') {
            return (
              <div key={item._id} className={`px-4 py-3.5 ${notLast ? 'border-b border-gray-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <p className="text-xs font-bold text-gray-800">{item.productSnapshot?.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0
                    ${item.status === 'in_progress' ? 'bg-primary-light text-primary' : 'bg-success-light text-success'}`}>
                    {item.status === 'in_progress' ? 'Active' : 'Done'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  {fmtUSD(item.dailyIncome)}/day · Earned: {fmtUSD(item.totalEarned)} · {fmtDate(item.startDate)}
                </p>
              </div>
            )
          }

          // deposits + withdrawals
          return (
            <div key={item._id} className={`flex justify-between items-center px-4 py-3.5 ${notLast ? 'border-b border-gray-50' : ''}`}>
              <div>
                <p className="text-xs font-bold text-gray-800">
                  {item.method || item.bankSnapshot?.bankName || 'Bank'}
                </p>
                <p className="text-[10px] text-gray-400">{fmtDateTime(item.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-gray-800">{fmtUSD(item.amountUSD)}</p>
                <span className={`text-[10px] font-bold
                  ${item.status === 'approved' || item.status === 'completed' ? 'text-success'
                  : item.status === 'pending' ? 'text-warning'
                  : 'text-danger'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Credit / Deduct Modal ── */}
      <Modal
        isOpen={modal === 'credit' || modal === 'deduct'}
        onClose={() => !working && setModal(null)}
        title={modal === 'credit' ? '💰 Credit Wallet' : '💸 Deduct Wallet'}
      >
        <div className="space-y-4">
          <div className={`rounded-2xl p-3 text-center text-sm font-semibold
            ${modal === 'credit' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'}`}>
            Current balance: <strong>{fmtUSD(u.balance)}</strong>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Amount (USD) *</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl">
              <span className="text-gray-400 font-bold">$</span>
              <input
                type="number" placeholder="0.00" min="0" step="any"
                value={walletForm.amount}
                onChange={e => setWalletForm(f => ({ ...f, amount: e.target.value }))}
                className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Reason *</label>
            <textarea
              rows={3} placeholder="Required audit note…"
              value={walletForm.reason}
              onChange={e => setWalletForm(f => ({ ...f, reason: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800
                         outline-none focus:border-primary transition-all resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} disabled={working}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleWallet} disabled={working}
              className={`flex-1 py-3 rounded-2xl text-white text-sm font-bold active:scale-95 disabled:opacity-50
                ${modal === 'credit' ? 'bg-success' : 'bg-danger'}`}>
              {working
                ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                : modal === 'credit' ? 'Credit' : 'Deduct'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Suspend Modal ── */}
      <Modal
        isOpen={modal === 'suspend'}
        onClose={() => !working && setModal(null)}
        title={u.isActive ? '⚠️ Suspend User' : '✅ Reactivate User'}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            {u.isActive
              ? `Suspend ${u.maskedPhone}? They will lose access immediately.`
              : `Reactivate ${u.maskedPhone}? They will regain full access.`}
          </p>
          {u.isActive && (
            <textarea
              rows={2} placeholder="Reason for suspension (optional)"
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm
                         outline-none focus:border-primary transition-all resize-none"
            />
          )}
          <div className="flex gap-3">
            <button onClick={() => setModal(null)}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold">
              Cancel
            </button>
            <button onClick={handleSuspend} disabled={working}
              className={`flex-1 py-3 rounded-2xl text-white text-sm font-bold active:scale-95 disabled:opacity-50
                ${u.isActive ? 'bg-warning' : 'bg-success'}`}>
              {working
                ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                : u.isActive ? 'Suspend' : 'Reactivate'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Role Modal ── */}
      <Modal isOpen={modal === 'role'} onClose={() => !working && setModal(null)} title="🔑 Assign Role">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 text-center">
            Current role: <strong className="text-gray-800">{u.role}</strong>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map(r => (
              <button key={r} onClick={() => setNewRole(r)}
                className={`py-3 rounded-2xl text-sm font-bold capitalize transition-all
                  ${newRole === r
                    ? r === 'superadmin' ? 'bg-purple-600 text-white'
                    : r === 'admin'      ? 'bg-primary text-white'
                    :                     'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-500'}`}>
                {r}
              </button>
            ))}
          </div>
          {newRole === u.role && (
            <p className="text-xs text-center text-warning font-medium">This is the current role</p>
          )}
          {newRole === 'superadmin' && newRole !== u.role && (
            <p className="text-xs text-center text-danger font-medium bg-danger-light rounded-xl p-2">
              ⚠️ Superadmin has full unrestricted access including role assignment
            </p>
          )}
          <div className="flex gap-3">
            <button onClick={() => setModal(null)}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold">
              Cancel
            </button>
            <button onClick={handleRole} disabled={working || newRole === u.role}
              className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-bold active:scale-95 disabled:opacity-50">
              {working
                ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                : 'Assign Role'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminUserDetail