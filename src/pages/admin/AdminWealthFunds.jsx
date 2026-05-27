import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Image as ImageIcon, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminGetWealthFunds,
  adminCreateWealthFund,
  adminUpdateWealthFund,
  adminDeleteWealthFund,
} from '../../api/admin'
import { fmtUSD } from '../../utils/currency'
import Modal from '../../components/common/Modal'
import Spinner from '../../components/common/Spinner'

export default function AdminWealthFunds() {
  const [funds, setFunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingFund, setEditingFund] = useState(null)
  const [form, setForm] = useState({
    name: '',
    image: '',
    amount: '',
    maturityAmount: '',
    durationType: 'monthly',
    durationDays: '',
    maxUnits: 1,
    availableUnits: 999999,
    isActive: true,
    sortOrder: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  const loadFunds = useCallback(async () => {
    try {
      const { data } = await adminGetWealthFunds()
      setFunds(data.funds || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load wealth funds')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { ;(async () => { await loadFunds() })() }, [loadFunds])

  const openCreateModal = () => {
    setEditingFund(null)
    setForm({
      name: '', image: '', amount: '', maturityAmount: '',
      durationType: 'monthly', durationDays: '',
      maxUnits: 1, availableUnits: 999999, isActive: true, sortOrder: 0,
    })
    setModalOpen(true)
  }

  const openEditModal = (fund) => {
    setEditingFund(fund)
    setForm({
      name: fund.name, image: fund.image || '',
      amount: fund.amount, maturityAmount: fund.maturityAmount,
      durationType: fund.durationType, durationDays: fund.durationDays,
      maxUnits: fund.maxUnits, availableUnits: fund.availableUnits,
      isActive: fund.isActive, sortOrder: fund.sortOrder,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        amount:         parseFloat(form.amount),
        maturityAmount: parseFloat(form.maturityAmount),
        durationDays:   parseInt(form.durationDays),
        maxUnits:       parseInt(form.maxUnits),
        availableUnits: parseInt(form.availableUnits),
        sortOrder:      parseInt(form.sortOrder),
      }
      if (editingFund) {
        await adminUpdateWealthFund(editingFund._id, payload)
        toast.success('Wealth fund updated')
      } else {
        await adminCreateWealthFund(payload)
        toast.success('Wealth fund created')
      }
      setModalOpen(false)
      loadFunds()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Operation failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (fund) => {
    try {
      await adminUpdateWealthFund(fund._id, { isActive: !fund.isActive })
      toast.success(`Fund ${!fund.isActive ? 'activated' : 'deactivated'}`)
      loadFunds()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (fund) => {
    if (!window.confirm(`Deactivate "${fund.name}"?`)) return
    try {
      await adminDeleteWealthFund(fund._id)
      toast.success('Wealth fund deactivated')
      loadFunds()
    } catch {
      toast.error('Delete failed')
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Wealth Funds</h1>
          <p className="text-sm text-gray-400 mt-0.5">{funds.length} fund{funds.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadFunds}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-primary transition-colors"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl
                       text-sm font-bold shadow-[0_4px_12px_rgba(26,159,212,0.3)] active:scale-95 transition-transform"
          >
            <Plus size={15} /> Add Fund
          </button>
        </div>
      </div>

      {/* Fund list */}
      {funds.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No wealth funds yet</div>
      ) : (
        <div className="space-y-3">
          {funds.map((fund) => {
            const profit = fund.maturityAmount - fund.amount
            const roi = fund.amount > 0 ? +((profit / fund.amount) * 100).toFixed(1) : 0
            return (
              <div key={fund._id} className="bg-white rounded-2xl shadow-card border border-gray-50 overflow-hidden">

                {/* Card top strip */}
                <div className="flex items-center gap-3 p-4 pb-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-2xl bg-primary-light flex items-center justify-center shrink-0 overflow-hidden">
                    {fund.image
                      ? <img src={fund.image} alt={fund.name} className="w-full h-full object-cover" />
                      : <ImageIcon size={18} className="text-primary" />}
                  </div>

                  {/* Name + badges */}
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-gray-800 text-sm truncate">{fund.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${fund.isActive ? 'bg-success-light text-success' : 'bg-gray-100 text-gray-400'}`}>
                        {fund.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary capitalize">
                        {fund.durationType}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                        {fund.durationDays}d
                      </span>
                    </div>
                  </div>

                  {/* Action buttons — top right */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleActive(fund)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors
                        ${fund.isActive
                          ? 'bg-gray-100 text-gray-500 hover:bg-warning-light hover:text-warning'
                          : 'bg-success-light text-success hover:bg-success hover:text-white'}`}
                      title={fund.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {fund.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={() => openEditModal(fund)}
                      className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(fund)}
                      className="w-8 h-8 rounded-xl bg-danger-light text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-4 gap-2 px-4 pb-4 pt-1 border-t border-gray-50">
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-gray-800">{fmtUSD(fund.amount)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Cost</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-success">{fmtUSD(fund.maturityAmount)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Payout</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-primary">+{roi}%</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">ROI</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-gray-800">{fund.maxUnits}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Max/User</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        title={editingFund ? `Edit — ${editingFund.name}` : 'New Wealth Fund'}
      >
        <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
              Fund Name <span className="text-danger">*</span>
            </label>
            <input
              type="text" placeholder="e.g. Wealth Fund Basic" required
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                         text-gray-800 outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Image URL</label>
            <input
              type="url" placeholder="https://..."
              value={form.image} onChange={e => setForm({ ...form, image: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                         text-gray-800 outline-none focus:border-primary transition-all"
            />
          </div>

          {/* Amount + Maturity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Cost (USD) <span className="text-danger">*</span>
              </label>
              <input
                type="number" placeholder="0.00" required min="0" step="any"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                           text-gray-800 outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Payout (USD) <span className="text-danger">*</span>
              </label>
              <input
                type="number" placeholder="0.00" required min="0" step="any"
                value={form.maturityAmount} onChange={e => setForm({ ...form, maturityAmount: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                           text-gray-800 outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Duration type + days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Type</label>
              <select
                value={form.durationType} onChange={e => setForm({ ...form, durationType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                           text-gray-800 outline-none focus:border-primary transition-all"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Days <span className="text-danger">*</span>
              </label>
              <input
                type="number" placeholder="30 or 365" required min="1"
                value={form.durationDays} onChange={e => setForm({ ...form, durationDays: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                           text-gray-800 outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Max units + available units + sort */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Max/User</label>
              <input
                type="number" min="1"
                value={form.maxUnits} onChange={e => setForm({ ...form, maxUnits: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                           text-gray-800 outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Supply</label>
              <input
                type="number" min="0"
                value={form.availableUnits} onChange={e => setForm({ ...form, availableUnits: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                           text-gray-800 outline-none focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Order</label>
              <input
                type="number"
                value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                           text-gray-800 outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Active toggle */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
          >
            <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0
              ${form.isActive ? 'bg-success' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200
                ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Active (visible to users)</span>
          </div>

          {/* Live preview */}
          {form.amount && form.maturityAmount && (
            <div className="bg-primary-light rounded-2xl p-3 flex justify-between items-center border border-primary/15">
              <div>
                <p className="text-xs font-bold text-gray-500">Profit</p>
                <p className="text-sm font-extrabold text-success">
                  +{fmtUSD(parseFloat(form.maturityAmount || 0) - parseFloat(form.amount || 0))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500">ROI</p>
                <p className="text-sm font-extrabold text-primary">
                  {form.amount > 0
                    ? (((parseFloat(form.maturityAmount || 0) - parseFloat(form.amount || 0)) / parseFloat(form.amount)) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={() => setModalOpen(false)} disabled={submitting}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold
                         active:scale-95 transition-transform disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={submitting}
              className="flex-1 py-3 rounded-2xl bg-primary text-white text-sm font-bold
                         shadow-[0_4px_12px_rgba(26,159,212,0.3)] active:scale-95 transition-transform disabled:opacity-50"
            >
              {submitting
                ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                : editingFund ? 'Save Changes' : 'Create Fund'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}