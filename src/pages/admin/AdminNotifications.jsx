import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Trash2, ToggleLeft, ToggleRight, Bell, Gift, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  adminGetNotifications,
  adminCreateNotification,
  adminUpdateNotification,
  adminDeleteNotification,
} from '../../api/admin'

const TYPE_META = {
  info:    { label: 'Info',    icon: Info,          color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-100' },
  success: { label: 'Success', icon: CheckCircle2,  color: 'text-green-500',  bg: 'bg-green-50',  border: 'border-green-100' },
  warning: { label: 'Warning', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
  bonus:   { label: 'Bonus',   icon: Gift,          color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
}

const EMPTY_FORM = {
  title: '',
  body: '',
  type: 'info',
  bonusCode: '',
  durationDays: '3',
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminGetNotifications()
      setNotifications(data.notifications || [])
    } catch { toast.error('Failed to load notifications') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { (async () => { await fetch() })() }, [fetch])

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      return toast.error('Title and body are required')
    }
    setSaving(true)
    try {
      await adminCreateNotification({
        title: form.title.trim(),
        body: form.body.trim(),
        type: form.type,
        bonusCode: form.bonusCode.trim() || null,
        durationDays: form.durationDays ? parseFloat(form.durationDays) : null,
      })
      toast.success('Notification sent!')
      setShowForm(false)
      setForm(EMPTY_FORM)
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create notification')
    } finally { setSaving(false) }
  }

  const handleToggle = async (id) => {
    try {
      const n = notifications.find(n => n._id === id)
      const { data } = await adminUpdateNotification(id, { isActive: !n.isActive })
      setNotifications(prev => prev.map(n => n._id === id ? data.notification : n))
      toast.success(data.notification.isActive ? 'Notification activated' : 'Notification paused')
    } catch { toast.error('Failed to toggle') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this notification permanently?')) return
    try {
      await adminDeleteNotification(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const isExpired = (n) => n.expiresAt && new Date(n.expiresAt) < new Date()

  return (
    <div className="space-y-5 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800">Announcements</h1>
          <p className="text-xs text-gray-400 mt-0.5">Banners shown at the top of the user dashboard</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 active:scale-95">
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-3 py-2 rounded-xl active:scale-95 transition-transform"
          >
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 space-y-4">
          <p className="text-sm font-bold text-gray-700">New Announcement</p>

          {/* Type selector */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Type</label>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {Object.entries(TYPE_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setForm(f => ({ ...f, type: key }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all
                    ${form.type === key
                      ? `${meta.bg} ${meta.color} ${meta.border} border`
                      : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                >
                  <meta.icon size={12} /> {meta.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Title</label>
            <input
              type="text"
              placeholder="e.g. New bonus code available!"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Body</label>
            <textarea
              rows={3}
              placeholder="Write the announcement message here…"
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bonus code (optional)</label>
              <input
                type="text"
                placeholder="e.g. BONUS2024"
                value={form.bonusCode}
                onChange={e => setForm(f => ({ ...f, bonusCode: e.target.value.toUpperCase() }))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold tracking-widest outline-none focus:border-primary"
              />
              <p className="text-[10px] text-gray-400 mt-1">Adds a "Copy code" button to the banner</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Duration (days)</label>
              <input
                type="number"
                placeholder="3"
                value={form.durationDays}
                onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))}
                className="mt-1 w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary"
              />
              <p className="text-[10px] text-gray-400 mt-1">0 = never expires</p>
            </div>
          </div>

          {/* Preview */}
          {(form.title || form.body) && (
            <div className={`rounded-2xl p-3 border ${TYPE_META[form.type].bg} ${TYPE_META[form.type].border}`}>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Preview</p>
              <div className="flex items-start gap-2">
                {(() => { const Icon = TYPE_META[form.type].icon; return <Icon size={14} className={`${TYPE_META[form.type].color} mt-0.5 shrink-0`} /> })()}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${TYPE_META[form.type].color}`}>{form.title || '…'}</p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-snug">{form.body || '…'}</p>
                  {form.bonusCode && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg bg-white/70 text-xs font-bold text-gray-700">
                      🎟 {form.bonusCode}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

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
              {saving ? 'Sending…' : 'Send Announcement'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          <Bell size={32} className="mx-auto mb-3 text-gray-200" />
          No announcements yet
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => {
            const meta = TYPE_META[n.type] || TYPE_META.info
            const Icon = meta.icon
            const expired = isExpired(n)
            return (
              <div key={n._id}
                className={`bg-white rounded-2xl p-4 shadow-card border transition-opacity overflow-hidden ${
                  !n.isActive || expired ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                    <Icon size={16} className={meta.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-gray-800 truncate">{n.title}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-snug line-clamp-2">{n.body}</p>
                    {n.bonusCode && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg bg-purple-50 text-xs font-bold text-purple-600">
                        🎟 {n.bonusCode}
                      </span>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[10px] text-gray-400">
                      <span>📅 Created {new Date(n.createdAt).toLocaleDateString()}</span>
                      {n.expiresAt ? (
                        <span className={expired ? 'text-red-400 font-semibold' : ''}>
                          ⏰ {expired ? 'Expired' : 'Expires'} {new Date(n.expiresAt).toLocaleDateString()}
                        </span>
                      ) : <span>⏰ No expiry</span>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 items-end shrink-0">
                    <button onClick={() => handleToggle(n._id)} className="text-gray-400 hover:text-primary">
                      {n.isActive ? <ToggleRight size={22} className="text-primary" /> : <ToggleLeft size={22} />}
                    </button>
                    <button onClick={() => handleDelete(n._id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminNotifications