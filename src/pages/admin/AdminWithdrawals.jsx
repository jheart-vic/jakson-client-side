import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Filter } from 'lucide-react'
import { adminGetWithdrawals, adminApproveWithdrawal, adminRejectWithdrawal } from '../../api/admin'
import { fmtUSD } from '../../utils/currency'
import { fmtDateTime } from '../../utils/date'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadWithdrawals = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const { data } = await adminGetWithdrawals(params)
      setWithdrawals(data.withdrawals || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load withdrawals')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    (async () => {
      await loadWithdrawals()
    })()
  }, [loadWithdrawals])

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this withdrawal?')) return
    setActionLoading(true)
    try {
      await adminApproveWithdrawal(id)
      toast.success('Withdrawal approved')
      loadWithdrawals()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setActionLoading(true)
    try {
      await adminRejectWithdrawal(id, rejectReason)
      toast.success('Withdrawal rejected and balance refunded')
      setSelectedWithdrawal(null)
      setRejectReason('')
      loadWithdrawals()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Withdrawals</h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input py-2 w-36 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No withdrawals found</div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((withdrawal) => (
            <div key={withdrawal._id} className="card p-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="font-bold text-gray-800">
                    {withdrawal.user?.phone || 'User ID: ' + withdrawal.user}
                  </p>
                  <p className="text-xs text-gray-500">{fmtDateTime(withdrawal.createdAt)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Bank: {withdrawal.bankSnapshot?.bankName} · {withdrawal.bankSnapshot?.accountNumber}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[withdrawal.status]}`}>
                  {withdrawal.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
                <div>
                  <p className="text-gray-400">Gross</p>
                  <p className="font-bold text-gray-800">{fmtUSD(withdrawal.amountUSD)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Fee ({withdrawal.feePercent}%)</p>
                  <p className="font-bold text-red-500">-{fmtUSD(withdrawal.feeAmountUSD)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Net</p>
                  <p className="font-bold text-green-600">{fmtUSD(withdrawal.netAmountUSD)}</p>
                </div>
              </div>

              {withdrawal.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleApprove(withdrawal._id)}
                    disabled={actionLoading}
                    className="flex-1 btn-primary py-2 rounded-xl text-sm flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => setSelectedWithdrawal(withdrawal)}
                    disabled={actionLoading}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl text-sm flex items-center justify-center gap-1"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      <Modal isOpen={!!selectedWithdrawal} onClose={() => { setSelectedWithdrawal(null); setRejectReason('') }} title="Reject Withdrawal">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Reject withdrawal of <strong>{fmtUSD(selectedWithdrawal?.amountUSD)}</strong>?<br />
            The user's balance will be refunded.
          </p>
          <textarea
            placeholder="Reason for rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="input min-h-20"
            rows={3}
          />
          <div className="flex gap-3">
            <button onClick={() => { setSelectedWithdrawal(null); setRejectReason('') }} className="flex-1 btn-outline">
              Cancel
            </button>
            <button onClick={() => handleReject(selectedWithdrawal?._id)} disabled={actionLoading} className="flex-1 btn-danger">
              {actionLoading ? <Spinner size="sm" /> : 'Confirm Reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}