import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, ArrowDownCircle, ArrowUpCircle, Package,
  TrendingUp, AlertCircle, RefreshCw, ChevronRight,
  UserCheck, UserX, DollarSign,
} from 'lucide-react'
import { getDashboard } from '../../api/admin'
import { fmtUSD } from '../../utils/currency'
import Spinner from '../../components/common/Spinner'

const StatCard = ({ icon: Icon, label, value, sub, color, bg, onClick }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`bg-white rounded-2xl p-4 shadow-card text-left w-full
                ${onClick ? 'active:scale-[0.98] transition-transform hover:shadow-float cursor-pointer' : 'cursor-default'}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
        <Icon size={18} style={{ color }} strokeWidth={2} />
      </div>
      {onClick && <ChevronRight size={14} className="text-gray-300 mt-1" />}
    </div>
    <p className="text-2xl font-extrabold text-gray-800">{value}</p>
    <p className="text-xs font-bold text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-[10px] text-gray-400 mt-1">{sub}</p>}
  </button>
)

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: d } = await getDashboard()
      setData(d)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { ;(async () => { await load() })() }, [load])

  if (loading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
      </div>
      <Spinner />
    </div>
  )

  const { users = {}, products = {}, finance = {} } = data || {}

  // net balance = total deposited minus total withdrawn
  const netBalance = (finance.totalDeposited ?? 0) - (finance.totalWithdrawn ?? 0)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Platform overview</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-sm text-gray-400 bg-white border border-gray-200
                     px-3 py-2 rounded-xl hover:text-primary transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Pending alerts */}
      {(finance.pendingDeposits > 0 || finance.pendingWithdrawals > 0) && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            {finance.pendingDeposits > 0 && (
              <button
                onClick={() => navigate('/admin/deposits')}
                className="flex items-center gap-2 text-sm font-bold text-orange-700 hover:text-orange-900"
              >
                ⚡ {finance.pendingDeposits} deposit{finance.pendingDeposits !== 1 ? 's' : ''} awaiting approval
                <ChevronRight size={13} />
              </button>
            )}
            {finance.pendingWithdrawals > 0 && (
              <button
                onClick={() => navigate('/admin/withdrawals')}
                className="flex items-center gap-2 text-sm font-bold text-orange-700 hover:text-orange-900"
              >
                ⚡ {finance.pendingWithdrawals} withdrawal{finance.pendingWithdrawals !== 1 ? 's' : ''} awaiting approval
                <ChevronRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* User stats */}
      <div>
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Users</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users}     label="Total Users"     value={users.total     ?? 0} color="#1a9fd4" bg="#e0f4fc" onClick={() => navigate('/admin/users')} />
          <StatCard icon={UserCheck} label="Active"          value={users.active    ?? 0} color="#10b981" bg="#ecfdf5" sub={`${users.newToday ?? 0} joined today`} />
          <StatCard icon={UserX}     label="Suspended"       value={users.suspended ?? 0} color="#ef4444" bg="#fef2f2" onClick={() => navigate('/admin/users?status=suspended')} />
          <StatCard icon={Package}   label="Active Products" value={products.active ?? 0} color="#8b5cf6" bg="#ede9fe" onClick={() => navigate('/admin/products')} />
        </div>
      </div>

      {/* Finance stats */}
      <div>
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Finance</p>

        {/* Net balance — full width highlight card */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary-light">
              <DollarSign size={18} className="text-primary" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">Net Platform Balance</p>
              <p className="text-[10px] text-gray-400">Total deposited − withdrawn</p>
            </div>
          </div>
          <p className={`text-xl font-extrabold ${netBalance >= 0 ? 'text-success' : 'text-danger'}`}>
            {fmtUSD(netBalance)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={ArrowDownCircle}
            label="Total Deposited"
            value={fmtUSD(finance.totalDeposited ?? 0)}
            color="#10b981"
            bg="#ecfdf5"
            onClick={() => navigate('/admin/deposits')}
          />
          <StatCard
            icon={ArrowUpCircle}
            label="Total Withdrawn"
            value={fmtUSD(finance.totalWithdrawn ?? 0)}
            color="#f97316"
            bg="#fff4ed"
            onClick={() => navigate('/admin/withdrawals')}
          />
          <StatCard
            icon={AlertCircle}
            label="Pending Deposits"
            value={finance.pendingDeposits ?? 0}
            color="#f59e0b"
            bg="#fffbeb"
            onClick={() => navigate('/admin/deposits')}
          />
          <StatCard
            icon={ArrowUpCircle}
            label="Pending Withdrawals"
            value={finance.pendingWithdrawals ?? 0}
            color="#ef4444"
            bg="#fef2f2"
            onClick={() => navigate('/admin/withdrawals')}
          />
        </div>
      </div>

      {/* Quick links */}
      <div>
        <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {[
            { label: 'Manage Users',        sub: 'View, suspend, credit wallets',         path: '/admin/users',       icon: Users,            color: '#1a9fd4' },
            { label: 'Manage Products',     sub: 'Create, edit, restock products',        path: '/admin/products',    icon: Package,          color: '#8b5cf6' },
            { label: 'Approve Deposits',    sub: `${finance.pendingDeposits ?? 0} pending`,    path: '/admin/deposits',    icon: ArrowDownCircle,  color: '#10b981' },
            { label: 'Approve Withdrawals', sub: `${finance.pendingWithdrawals ?? 0} pending`, path: '/admin/withdrawals', icon: ArrowUpCircle,    color: '#f97316' },
            { label: 'App Settings',        sub: 'Exchange rate, bank details',           path: '/admin/settings',    icon: TrendingUp,       color: '#6366f1' },
          ].map((item, i, arr) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100
                          transition-colors text-left ${i < arr.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${item.color}18` }}
              >
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard