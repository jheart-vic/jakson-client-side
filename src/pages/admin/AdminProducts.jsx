import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Pencil, Trash2, Eye, EyeOff,
  Package, TrendingUp, RefreshCw, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminGetProducts, adminCreateProduct,
  adminUpdateProduct, adminDeleteProduct,
} from '../../api/admin'
import { fmtUSD } from '../../utils/currency'
import Spinner from '../../components/common/Spinner'
import Modal from '../../components/common/Modal'

const EMPTY_FORM = {
  name: '', image: '', amount: '', cycleDays: '',
  dailyIncome: '', vipLevel: '1', maxUnits: '1', availableUnits: '',
  isFree: false, sortOrder: '0',
}

const FIELDS = [
  { key: 'name',           label: 'Product Name',    type: 'text',   placeholder: 'e.g. Helia NXT Bifacial', span2: true,  required: true },
  { key: 'image',          label: 'Image URL',       type: 'url',    placeholder: 'https://...',              span2: true  },
  { key: 'amount',         label: 'Cost (USD)',       type: 'number', placeholder: '0 = Free',                required: true },
  { key: 'cycleDays',      label: 'Cycle (Days)',     type: 'number', placeholder: 'e.g. 35',                 required: true },
  { key: 'dailyIncome',    label: 'Daily Income ($)', type: 'number', placeholder: 'e.g. 0.40',               required: true },
  { key: 'vipLevel',      label: 'VIP Level',        type: 'number', placeholder: 'e.g. 1',                  required: true },
  { key: 'maxUnits',       label: 'Max Units/User',  type: 'number', placeholder: 'e.g. 3'  },
  { key: 'availableUnits', label: 'Stock Available', type: 'number', placeholder: 'Total units' },
  { key: 'sortOrder',      label: 'Sort Order',      type: 'number', placeholder: '0 = first' },
]

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)   // 'create' | 'edit' | 'delete'
  const [editing,  setEditing]  = useState(null)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [saving,   setSaving]   = useState(false)
  const [filter,   setFilter]   = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminGetProducts({ status: filter === 'all' ? undefined : filter })
      setProducts(data.products)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { ;(async () => { await load() })() }, [load])

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [k]: v }))
  }

  const openCreate = () => { setForm(EMPTY_FORM); setEditing(null); setModal('create') }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name:           p.name,
      image:          p.image || '',
      amount:         String(p.amount),
      cycleDays:      String(p.cycleDays),
      dailyIncome:    String(p.dailyIncome),
      vipLevel:       String(p.vipLevel ?? 1),
      maxUnits:       String(p.maxUnits),
      availableUnits: String(p.availableUnits),
      isFree:         p.isFree,
      sortOrder:      String(p.sortOrder),
    })
    setModal('edit')
  }

  const openDelete = (p) => { setEditing(p); setModal('delete') }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim())                   return toast.error('Product name is required')
    if (!form.cycleDays || !form.dailyIncome) return toast.error('Cycle and daily income are required')

    const payload = {
      name:           form.name.trim(),
      image:          form.image.trim() || null,
      amount:         parseFloat(form.amount)         || 0,
      cycleDays:      parseInt(form.cycleDays),
      dailyIncome:    parseFloat(form.dailyIncome),
      vipLevel:       parseInt(form.vipLevel)         || 1,
      maxUnits:       parseInt(form.maxUnits)         || 1,
      availableUnits: parseInt(form.availableUnits)   || 0,
      isFree:         form.isFree,
      sortOrder:      parseInt(form.sortOrder)        || 0,
    }

    setSaving(true)
    try {
      if (modal === 'create') {
        await adminCreateProduct(payload)
        toast.success('Product created!')
      } else {
        await adminUpdateProduct(editing._id, payload)
        toast.success('Product updated!')
      }
      setModal(null); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally { setSaving(false) }
  }

  const toggleActive = async (p) => {
    try {
      await adminUpdateProduct(p._id, { isActive: !p.isActive })
      toast.success(p.isActive ? 'Product hidden' : 'Product now visible')
      load()
    } catch { toast.error('Failed to update product') }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await adminDeleteProduct(editing._id)
      toast.success('Product deactivated')
      setModal(null); load()
    } catch { toast.error('Failed to deactivate product') }
    finally { setSaving(false) }
  }

  const totalReturn = (p) => +(p.dailyIncome * p.cycleDays).toFixed(2)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage investment products</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-primary text-white px-4 py-2.5 rounded-xl
                     text-sm font-bold shadow-[0_4px_12px_rgba(26,159,212,0.3)] active:scale-95 transition-transform"
        >
          <Plus size={15} /> New
        </button>
      </div>

      {/* Filter + refresh */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1 bg-white border border-gray-200 rounded-xl p-1">
          {[{ key: 'all', label: 'All' }, { key: 'active', label: 'Active' }, { key: 'inactive', label: 'Hidden' }].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all
                ${filter === f.key ? 'bg-primary text-white shadow-sm' : 'text-gray-400'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={load} className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-primary transition-colors shrink-0">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stats */}
      {!loading && products.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',    val: products.length },
            { label: 'Active',   val: products.filter(p => p.isActive).length },
            { label: 'Sold Out', val: products.filter(p => p.availableUnits <= 0).length },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white rounded-2xl p-3 shadow-card text-center">
              <p className="text-xl font-extrabold text-gray-800">{val}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Product cards */}
      {loading ? <div className="py-12"><Spinner /></div> : products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card py-16 text-center text-gray-400">
          <Package size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No products found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div
              key={p._id}
              className={`bg-white rounded-2xl shadow-card p-4 transition-opacity ${!p.isActive ? 'opacity-60' : ''}`}
            >
              {/* Top row: image + name + action buttons */}
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0 overflow-hidden">
                  {p.image
                    ? <img src={p.image} alt="" className="w-full h-full object-cover" />
                    : <Package size={18} className="text-primary/50" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {p.isFree && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">FREE</span>
                    )}
                    {!p.isActive && (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Hidden</span>
                    )}
                    {p.availableUnits <= 0 && (
                      <span className="text-[10px] font-bold text-danger bg-danger-light px-1.5 py-0.5 rounded-full">Sold Out</span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(p)}
                    className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => toggleActive(p)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors
                      ${p.isActive
                        ? 'bg-gray-100 text-gray-500 hover:bg-warning-light hover:text-warning'
                        : 'bg-success-light text-success hover:bg-success hover:text-white'}`}
                    title={p.isActive ? 'Hide' : 'Show'}
                  >
                    {p.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                  <button
                    onClick={() => openDelete(p)}
                    className="w-8 h-8 rounded-xl bg-danger-light text-danger flex items-center justify-center hover:bg-danger hover:text-white transition-colors"
                    title="Deactivate"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Bottom row: stats */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-50">
                <div className="text-center">
                  <p className="text-xs font-extrabold text-gray-800">{p.isFree ? 'Free' : fmtUSD(p.amount)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Cost</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-extrabold text-success">{fmtUSD(p.dailyIncome)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Daily</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-extrabold text-gray-800">{p.cycleDays}d</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Cycle</p>
                </div>
                <div className="text-center">
                  <p className={`text-xs font-extrabold ${p.availableUnits <= 0 ? 'text-danger' : 'text-gray-800'}`}>
                    {p.availableUnits}/{p.maxUnits}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Stock</p>
                </div>
              </div>

              {/* Total return */}
              <div className="mt-2 bg-primary-light rounded-xl px-3 py-1.5 flex items-center justify-between">
                <p className="text-[10px] text-gray-500 font-medium">Total return over {p.cycleDays} days</p>
                <p className="text-xs font-extrabold text-primary">{fmtUSD(totalReturn(p))}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={modal === 'create' || modal === 'edit'}
        onClose={() => !saving && setModal(null)}
        title={modal === 'create' ? 'Create New Product' : `Edit — ${editing?.name}`}
      >
        <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

          {/* Live preview */}
          {(form.name || form.dailyIncome) && (
            <div className="bg-primary-light rounded-2xl p-3 flex items-center gap-3 border border-primary/15">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <TrendingUp size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-gray-800 truncate">{form.name || 'Product name'}</p>
                <p className="text-xs text-primary font-medium mt-0.5">
                  {form.dailyIncome ? fmtUSD(parseFloat(form.dailyIncome) || 0) : '—'}/day ·{' '}
                  {form.cycleDays ? `${form.cycleDays}d` : '—'} · Total:{' '}
                  {form.dailyIncome && form.cycleDays
                    ? fmtUSD((parseFloat(form.dailyIncome) || 0) * (parseInt(form.cycleDays) || 0))
                    : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(({ key, label, type, placeholder, span2, required }) => (
              <div key={key} className={span2 ? 'col-span-2' : ''}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                  {label} {required && <span className="text-danger">*</span>}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                  step={type === 'number' ? 'any' : undefined}
                  min={type === 'number' ? '0' : undefined}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium
                             text-gray-800 outline-none focus:border-primary
                             focus:shadow-[0_0_0_3px_rgba(26,159,212,0.12)] transition-all"
                />
              </div>
            ))}
          </div>

          {/* Free toggle */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setForm(f => ({ ...f, isFree: !f.isFree }))}
          >
            <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0
              ${form.isFree ? 'bg-success' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm
                              transition-transform duration-200
                              ${form.isFree ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm font-semibold text-gray-700">Mark as free product (amount = $0)</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(null)} disabled={saving}
              className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold
                         active:scale-95 transition-transform disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl
                         bg-primary text-white text-sm font-bold
                         shadow-[0_4px_12px_rgba(26,159,212,0.3)] active:scale-95 transition-transform disabled:opacity-50">
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
                : <><Check size={15} /> {modal === 'create' ? 'Create' : 'Save Changes'}</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal isOpen={modal === 'delete'} onClose={() => !saving && setModal(null)} title="Delete  Product">
        {editing && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-danger-light flex items-center justify-center mx-auto">
              <Trash2 size={24} className="text-danger" />
            </div>
            <div>
              <p className="text-gray-700 font-semibold text-sm">
                Delete <strong>"{editing.name}"</strong>?
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Hidden from users and permanently deleted.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)}
                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold active:scale-95 transition-transform">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving}
                className="flex-1 py-3 rounded-2xl bg-danger text-white text-sm font-bold
                           shadow-[0_4px_12px_rgba(239,68,68,0.25)] active:scale-95 transition-transform disabled:opacity-50">
                {saving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow inline-block" />
                  : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default AdminProducts