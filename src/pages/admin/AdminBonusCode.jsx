import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight, Copy, CheckCircle, Wand2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminGetBonusCodes,
  adminCreateBonusCode,
  adminToggleBonusCode,
  adminDeleteBonusCode,
} from '../../api/admin'

const EMPTY_FORM = {
  code: '',
  amountUSD: '',
  maxUses: '1',
  expiresAt: '',
  autoGenerate: true,
}

const AdminBonusCodes = () => {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminGetBonusCodes()
      setCodes(data.codes || [])
    } catch { toast.error('Failed to load bonus codes') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { (async () => { await fetch() })() }, [fetch])

  const handleCreate = async () => {
    if (!form.amountUSD || parseFloat(form.amountUSD) <= 0) {
      return toast.error('Enter a valid USD amount')
    }
    setSaving(true)
    try {
      await adminCreateBonusCode({
        code: form.autoGenerate ? undefined : form.code || undefined,
        amountUSD: parseFloat(form.amountUSD),
        maxUses: form.maxUses === '' ? 1 : parseInt(form.maxUses),
        expiresAt: form.expiresAt || null,
        autoGenerate: form.autoGenerate,
      })
      toast.success('Bonus code created!')
      setShowForm(false)
      setForm(EMPTY_FORM)
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create code')
    } finally { setSaving(false) }
  }

  const handleToggle = async (id) => {
    try {
      const { data } = await adminToggleBonusCode(id)
      setCodes(prev => prev.map(c => c._id === id ? data.bonusCode : c))
      toast.success(data.message)
    } catch { toast.error('Failed to toggle code') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this bonus code? This cannot be undone.')) return
    try {
      await adminDeleteBonusCode(id)
      setCodes(prev => prev.filter(c => c._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
    toast.success(`Copied: ${code}`)
  }

  const usedRatio = (bc) => {
    if (bc.maxUses === -1) return `${bc.usedBy?.length ?? 0} / ∞`
    return `${bc.usedBy?.length ?? 0} / ${bc.maxUses}`
  }

  const isExpired = (bc) => bc.expiresAt && new Date(bc.expiresAt) < new Date()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800">Bonus Codes</h1>
          <p className="text-xs text-gray-400 mt-0.5">Generate codes users can redeem for balance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 active:scale-95">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            <Plus size={14} /> New Code
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 space-y-4">
          <p className="text-sm font-bold text-gray-700">New Bonus Code</p>

          {/* Auto-generate toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setForm(f => ({ ...f, autoGenerate: !f.autoGenerate, code: '' }))}
              className={`w-10 h-5 rounded-full transition-colors relative ${form.autoGenerate ? 'bg-primary' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.autoGenerate ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <Wand2 size={12} /> Auto-generate code
            </span>
          </label>

          {/* Manual code input */}
          {!form.autoGenerate && (
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Code</label>
              <input
                type="text"
                placeholder="e.g. WELCOME50"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold tracking-widest outline-none focus:border-primary"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Amount (USD)</label>
              <input
                type="number"
                placeholder="e.g. 5.00"
                value={form.amountUSD}
                onChange={e => setForm(f => ({ ...f, amountUSD: e.target.value }))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Uses (-1 = unlimited)</label>
              <input
                type="number"
                placeholder="1"
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Expiry date (optional)</label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-bold active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-bold active:scale-95 disabled:opacity-60"
            >
              {saving ? 'Creating…' : 'Create Code'}
            </button>
          </div>
        </div>
      )}

      {/* Codes list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No bonus codes yet</div>
      ) : (
        <div className="space-y-3">
          {codes.map(bc => (
            <div key={bc._id}
              className={`bg-white rounded-2xl p-4 shadow-card border transition-opacity ${
                !bc.isActive || isExpired(bc) ? 'opacity-50' : ''
              }`}
            >
              {/* Top row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-800 tracking-widest text-base">{bc.code}</span>
                  <button onClick={() => copyCode(bc.code)}
                    className={`p-1 rounded-lg transition-colors ${copied === bc.code ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {copied === bc.code ? <CheckCircle size={13} /> : <Copy size={13} />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleToggle(bc._id)} className="text-gray-400 hover:text-primary transition-colors">
                    {bc.isActive ? <ToggleRight size={22} className="text-primary" /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => handleDelete(bc._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>💵 <strong className="text-gray-700">${bc.amountUSD.toFixed(2)}</strong></span>
                <span>👥 Used: <strong className="text-gray-700">{usedRatio(bc)}</strong></span>
                {bc.expiresAt && (
                  <span className={isExpired(bc) ? 'text-red-500 font-semibold' : ''}>
                    ⏰ {isExpired(bc) ? 'Expired' : 'Expires'}: {new Date(bc.expiresAt).toLocaleDateString()}
                  </span>
                )}
                {!bc.expiresAt && <span>⏰ No expiry</span>}
                <span>📅 {new Date(bc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminBonusCodes