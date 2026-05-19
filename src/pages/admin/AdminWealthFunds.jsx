import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
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
    setModalOpen(true)
  }

  const openEditModal = (fund) => {
    setEditingFund(fund)
    setForm({
      name: fund.name,
      image: fund.image || '',
      amount: fund.amount,
      maturityAmount: fund.maturityAmount,
      durationType: fund.durationType,
      durationDays: fund.durationDays,
      maxUnits: fund.maxUnits,
      availableUnits: fund.availableUnits,
      isActive: fund.isActive,
      sortOrder: fund.sortOrder,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
        maturityAmount: parseFloat(form.maturityAmount),
        durationDays: parseInt(form.durationDays),
        maxUnits: parseInt(form.maxUnits),
        availableUnits: parseInt(form.availableUnits),
        sortOrder: parseInt(form.sortOrder),
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
    } catch (err) {
      console.error(err)
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (fund) => {
    if (!window.confirm(`Delete "${fund.name}"? This will set it to inactive.`)) return
    try {
      await adminDeleteWealthFund(fund._id)
      toast.success('Wealth fund deactivated')
      loadFunds()
    } catch (err) {
      console.error(err)
      toast.error('Delete failed')
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Wealth Funds</h1>
        <button onClick={openCreateModal} className="btn btn-primary flex items-center gap-2 w-auto">
          <Plus size={16} /> Add Fund
        </button>
      </div>

      <div className="space-y-3">
        {funds.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No wealth funds yet</div>
        ) : (
          funds.map((fund) => (
            <div key={fund._id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center overflow-hidden">
                  {fund.image ? (
                    <img src={fund.image} alt={fund.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{fund.name}</h3>
                  <p className="text-xs text-gray-500">
                    {fmtUSD(fund.amount)} → {fmtUSD(fund.maturityAmount)} | {fund.durationType} ({fund.durationDays}d)
                  </p>
                  <p className="text-xs text-gray-400">
                    Max: {fund.maxUnits} | Sort: {fund.sortOrder}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${fund.isActive ? 'bg-success-light text-success' : 'bg-gray-200 text-gray-500'}`}>
                  {fund.isActive ? 'Active' : 'Inactive'}
                </span>
                <button onClick={() => handleToggleActive(fund)} className="p-2 text-gray-500 hover:text-primary">
                  {fund.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={() => openEditModal(fund)} className="p-2 text-gray-500 hover:text-primary">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(fund)} className="p-2 text-gray-500 hover:text-danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingFund ? 'Edit Wealth Fund' : 'New Wealth Fund'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input" required />
          <input type="text" placeholder="Image URL (optional)" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="input" />
          <input type="number" placeholder="Investment Amount (USD)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="input" required />
          <input type="number" placeholder="Maturity Amount (USD)" value={form.maturityAmount} onChange={e => setForm({ ...form, maturityAmount: e.target.value })} className="input" required />
          <select value={form.durationType} onChange={e => setForm({ ...form, durationType: e.target.value })} className="input">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input type="number" placeholder="Duration Days (30 or 365)" value={form.durationDays} onChange={e => setForm({ ...form, durationDays: e.target.value })} className="input" required />
          <input type="number" placeholder="Max Units per User (default 1)" value={form.maxUnits} onChange={e => setForm({ ...form, maxUnits: e.target.value })} className="input" />
          <input type="number" placeholder="Available Units (total supply)" value={form.availableUnits} onChange={e => setForm({ ...form, availableUnits: e.target.value })} className="input" />
          <input type="number" placeholder="Sort Order" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: e.target.value })} className="input" />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
            <span className="text-sm">Active (visible to users)</span>
          </label>
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Saving...' : editingFund ? 'Update' : 'Create'}
          </button>
        </form>
      </Modal>
    </div>
  )
}