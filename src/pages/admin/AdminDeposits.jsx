import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Filter, RefreshCw } from 'lucide-react'
import { adminGetDeposits, adminApproveDeposit, adminRejectDeposit } from '../../api/admin'
import { fmtUSD, fmtNGN } from '../../utils/currency'
import { fmtDateTime } from '../../utils/date'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

const STATUS_STYLE = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  expired:  'bg-gray-100 text-gray-500',
}

export default function AdminDeposits() {
  const [deposits,       setDeposits]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [statusFilter,   setStatusFilter]   = useState('')
  const [actionLoading,  setActionLoading]  = useState(false)

  // ── Modal state ──────────────────────────────────────────────
  const [approveTarget,  setApproveTarget]  = useState(null) // deposit to approve
  const [rejectTarget,   setRejectTarget]   = useState(null) // deposit to reject
  const [rejectReason,   setRejectReason]   = useState('')

  const loadDeposits = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const { data } = await adminGetDeposits(params)
      setDeposits(data.deposits || [])
    } catch {
      toast.error('Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    ;(async () => { await loadDeposits() })()
  }, [loadDeposits])

  // ── Approve ──────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!approveTarget) return
    setActionLoading(true)
    try {
      await adminApproveDeposit(approveTarget._id)
      toast.success(`Deposit of ${fmtUSD(approveTarget.amountUSD)} approved — balance credited`)
      setApproveTarget(null)
      loadDeposits()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed')
    } finally {
      setActionLoading(false) }
  }

  // ── Reject ───────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectTarget) return
    if (!rejectReason.trim()) { toast.error('Please provide a reason'); return }
    setActionLoading(true)
    try {
      await adminRejectDeposit(rejectTarget._id, rejectReason)
      toast.success('Deposit rejected')
      setRejectTarget(null)
      setRejectReason('')
      loadDeposits()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Deposits</h1>
          <p className="text-sm text-gray-400 mt-0.5">{deposits.length} records</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-sm text-gray-700 outline-none bg-transparent cursor-pointer"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <button
            onClick={loadDeposits}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400
                       hover:text-primary transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <Spinner />
      ) : deposits.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-card">
          <p className="text-sm font-medium">No deposits found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deposits.map(deposit => (
            <div key={deposit._id} className="bg-white rounded-2xl shadow-card p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="font-bold text-gray-800">
                    {deposit.user?.phone || `User: ${deposit.user}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDateTime(deposit.createdAt)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Method: {deposit.method} {deposit.paymentRef ? `· Ref: ${deposit.paymentRef}` : ''}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[deposit.status] || STATUS_STYLE.pending}`}>
                  {deposit.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[10px] text-gray-400 font-medium mb-0.5">Amount (USD)</p>
                  <p className="font-extrabold text-primary">{fmtUSD(deposit.amountUSD)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[10px] text-gray-400 font-medium mb-0.5">Amount (NGN)</p>
                  <p className="font-bold text-gray-700">{fmtNGN(deposit.amountNGN)}</p>
                </div>
              </div>

              {deposit.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setApproveTarget(deposit)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl
                               text-sm font-bold flex items-center justify-center gap-1.5
                               active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => { setRejectTarget(deposit); setRejectReason('') }}
                    disabled={actionLoading}
                    className="flex-1 bg-red-50 border border-red-200 text-red-600 py-2.5 rounded-xl
                               text-sm font-bold flex items-center justify-center gap-1.5
                               active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Approve confirm modal ───────────────────────────── */}
      <Modal
        isOpen={!!approveTarget}
        onClose={() => !actionLoading && setApproveTarget(null)}
        title="✅ Approve Deposit"
      >
        {approveTarget && (
          <div className="space-y-4">
            <div className="bg-green-50 rounded-2xl p-4 space-y-2">
              {[
                { label: 'User',       val: approveTarget.user?.phone || '—' },
                { label: 'Amount',     val: fmtUSD(approveTarget.amountUSD),  bold: true },
                { label: 'NGN equiv',  val: fmtNGN(approveTarget.amountNGN) },
                { label: 'Method',     val: approveTarget.method },
                { label: 'Submitted', val: fmtDateTime(approveTarget.createdAt) },
              ].map(({ label, val, bold }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className={bold ? 'text-green-600 font-extrabold text-base' : 'text-gray-800 font-semibold'}>{val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center">
              This will immediately credit <strong className="text-green-600">{fmtUSD(approveTarget.amountUSD)}</strong> to the user's wallet. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setApproveTarget(null)}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500
                           text-sm font-bold cursor-pointer disabled:opacity-50 active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-green-500 text-white text-sm font-bold
                           shadow-[0_4px_12px_rgba(16,185,129,0.3)] cursor-pointer
                           active:scale-95 transition-all disabled:opacity-50"
              >
                {actionLoading
                  ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                  : 'Approve & Credit'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reject modal ────────────────────────────────────── */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => { if (!actionLoading) { setRejectTarget(null); setRejectReason('') } }}
        title="❌ Reject Deposit"
      >
        {rejectTarget && (
          <div className="space-y-4">
            <div className="bg-red-50 rounded-2xl p-3 text-center">
              <p className="text-red-600 font-bold text-sm">{fmtUSD(rejectTarget.amountUSD)}</p>
              <p className="text-xs text-red-400 mt-0.5">User's balance will NOT be affected</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Payment not received in our account"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl
                           text-sm text-gray-800 outline-none focus:border-red-400 transition-all resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setRejectTarget(null); setRejectReason('') }}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500
                           text-sm font-bold cursor-pointer disabled:opacity-50 active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold
                           shadow-[0_4px_12px_rgba(239,68,68,0.25)] cursor-pointer
                           active:scale-95 transition-all disabled:opacity-50"
              >
                {actionLoading
                  ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                  : 'Reject Deposit'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
