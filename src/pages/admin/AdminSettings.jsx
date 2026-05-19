import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Save, RefreshCw, AlertCircle } from 'lucide-react'
import { adminGetSettings, adminUpdateSetting } from '../../api/admin'
import Spinner from '../../components/common/Spinner'

// ✅ Declared outside — never recreated during render
const SaveBtn = ({ keyName, value, label = 'Save', onSave, saving }) => (
  <button
    onClick={() => onSave(keyName, value)}
    disabled={saving[keyName]}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white
               text-sm font-bold cursor-pointer active:scale-95 transition-all
               shadow-[0_4px_12px_rgba(26,159,212,0.25)]
               disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
  >
    {saving[keyName]
      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
      : <Save size={14} />}
    {saving[keyName] ? 'Saving…' : label}
  </button>
)

export default function AdminSettings() {
  const [fields, setFields] = useState({
    usd_to_ngn_rate:          '',
    payment_bank_account:     { bankName: '', accountNumber: '', accountName: '' },
    withdrawal_fee_low:       '',
    withdrawal_fee_high:      '',
    withdrawal_fee_threshold: '',
    min_deposit:              '',
    min_withdrawal:           '',
    withdrawal_days:          '',
    withdrawal_hours:         '',
  })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState({})

  const loadSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await adminGetSettings()
      const map = {}
      ;(data.settings || []).forEach(s => { map[s.key] = s.value })
      setFields(prev => ({
        ...prev,
        usd_to_ngn_rate:          map.usd_to_ngn_rate          ?? prev.usd_to_ngn_rate,
        payment_bank_account:     map.payment_bank_account      ?? prev.payment_bank_account,
        withdrawal_fee_low:       map.withdrawal_fee_low        ?? prev.withdrawal_fee_low,
        withdrawal_fee_high:      map.withdrawal_fee_high       ?? prev.withdrawal_fee_high,
        withdrawal_fee_threshold: map.withdrawal_fee_threshold  ?? prev.withdrawal_fee_threshold,
        min_deposit:              map.min_deposit               ?? prev.min_deposit,
        min_withdrawal:           map.min_withdrawal            ?? prev.min_withdrawal,
        withdrawal_days:          map.withdrawal_days           ?? prev.withdrawal_days,
        withdrawal_hours:         map.withdrawal_hours          ?? prev.withdrawal_hours,
      }))
    } catch {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => { await loadSettings() })()
  }, [loadSettings])

  const save = async (key, value) => {
    setSaving(s => ({ ...s, [key]: true }))
    try {
      await adminUpdateSetting(key, value)
      toast.success('Saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(s => ({ ...s, [key]: false }))
    }
  }

  const set    = (key, value)   => setFields(f => ({ ...f, [key]: value }))
  const setBank = (field, value) => setFields(f => ({
    ...f,
    payment_bank_account: { ...f.payment_bank_account, [field]: value },
  }))

  if (loading) return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold text-gray-800">Settings</h1>
      <Spinner />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">App Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Each setting saves independently</p>
        </div>
        <button
          onClick={loadSettings}
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400
                     hover:text-primary transition-colors cursor-pointer"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Warning */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
        <p className="text-sm text-orange-700 font-medium">
          Changes take effect immediately for all new transactions.
        </p>
      </div>

      {/* ── Exchange Rate ── */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="font-extrabold text-gray-800 mb-1">USD → NGN Exchange Rate</h2>
        <p className="text-xs text-gray-400 mb-4">Used for all NGN conversions on deposits and withdrawals</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <span className="text-gray-400 font-bold text-sm shrink-0">₦</span>
            <input
              type="number"
              value={fields.usd_to_ngn_rate}
              onChange={e => set('usd_to_ngn_rate', parseFloat(e.target.value))}
              className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 min-w-0"
              step="1" min="1"
            />
            <span className="text-gray-400 text-xs font-medium shrink-0">per $1</span>
          </div>
          <SaveBtn keyName="usd_to_ngn_rate" value={fields.usd_to_ngn_rate} onSave={save} saving={saving} />
        </div>
      </div>

      {/* ── Payment Bank Account ── */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="font-extrabold text-gray-800 mb-1">Payment Bank Account</h2>
        <p className="text-xs text-gray-400 mb-4">Account users transfer deposits to (OTPay)</p>
        <div className="space-y-3">
          {[
            { field: 'bankName',      label: 'Bank Name',      placeholder: 'e.g. OTPay'              },
            { field: 'accountNumber', label: 'Account Number', placeholder: '10-digit account number' },
            { field: 'accountName',   label: 'Account Name',   placeholder: 'Jakson Solar'             },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                {label}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                value={fields.payment_bank_account?.[field] || ''}
                onChange={e => setBank(field, e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                           text-gray-800 outline-none focus:border-primary transition-all"
              />
            </div>
          ))}
          <div className="pt-1">
            <SaveBtn
              keyName="payment_bank_account"
              value={fields.payment_bank_account}
              label="Save Bank Details"
              onSave={save}
              saving={saving}
            />
          </div>
        </div>
      </div>

      {/* ── Withdrawal Fees ── */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="font-extrabold text-gray-800 mb-1">Withdrawal Fees</h2>
        <p className="text-xs text-gray-400 mb-4">Each field saves independently</p>
        <div className="space-y-4">

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Fee below threshold (%)
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <input
                  type="number"
                  value={fields.withdrawal_fee_low}
                  onChange={e => set('withdrawal_fee_low', parseFloat(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 min-w-0"
                  step="1" min="0" max="100"
                />
                <span className="text-gray-400 text-sm font-bold shrink-0">%</span>
              </div>
            </div>
            <SaveBtn keyName="withdrawal_fee_low" value={fields.withdrawal_fee_low} onSave={save} saving={saving} />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Fee above threshold (%)
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <input
                  type="number"
                  value={fields.withdrawal_fee_high}
                  onChange={e => set('withdrawal_fee_high', parseFloat(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 min-w-0"
                  step="1" min="0" max="100"
                />
                <span className="text-gray-400 text-sm font-bold shrink-0">%</span>
              </div>
            </div>
            <SaveBtn keyName="withdrawal_fee_high" value={fields.withdrawal_fee_high} onSave={save} saving={saving} />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Threshold amount (USD)
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-gray-400 font-bold text-sm shrink-0">$</span>
                <input
                  type="number"
                  value={fields.withdrawal_fee_threshold}
                  onChange={e => set('withdrawal_fee_threshold', parseFloat(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 min-w-0"
                  step="10" min="0"
                />
              </div>
            </div>
            <SaveBtn keyName="withdrawal_fee_threshold" value={fields.withdrawal_fee_threshold} onSave={save} saving={saving} />
          </div>

          {/* Live preview */}
          <div className="bg-primary-light rounded-xl p-3 text-xs text-primary font-medium">
            Preview: withdrawals below{' '}
            <strong>${fields.withdrawal_fee_threshold || '—'}</strong> → <strong>{fields.withdrawal_fee_low || '—'}%</strong> fee
            &nbsp;·&nbsp;
            above → <strong>{fields.withdrawal_fee_high || '—'}%</strong> fee
          </div>
        </div>
      </div>

      {/* ── Minimums ── */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="font-extrabold text-gray-800 mb-4">Transaction Minimums</h2>
        <div className="space-y-4">

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Min Deposit (USD)
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-gray-400 font-bold text-sm shrink-0">$</span>
                <input
                  type="number"
                  value={fields.min_deposit}
                  onChange={e => set('min_deposit', parseFloat(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 min-w-0"
                  step="1" min="0"
                />
              </div>
            </div>
            <SaveBtn keyName="min_deposit" value={fields.min_deposit} onSave={save} saving={saving} />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Min Withdrawal (USD)
              </label>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <span className="text-gray-400 font-bold text-sm shrink-0">$</span>
                <input
                  type="number"
                  value={fields.min_withdrawal}
                  onChange={e => set('min_withdrawal', parseFloat(e.target.value))}
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-gray-800 min-w-0"
                  step="1" min="0"
                />
              </div>
            </div>
            <SaveBtn keyName="min_withdrawal" value={fields.min_withdrawal} onSave={save} saving={saving} />
          </div>
        </div>
      </div>

      {/* ── Withdrawal Schedule ── */}
      <div className="bg-white rounded-2xl shadow-card p-5">
        <h2 className="font-extrabold text-gray-800 mb-4">Withdrawal Schedule</h2>
        <div className="space-y-4">

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Allowed Days
              </label>
              <input
                type="text"
                value={fields.withdrawal_days}
                onChange={e => set('withdrawal_days', e.target.value)}
                placeholder="e.g. Monday to Friday"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                           text-gray-800 outline-none focus:border-primary transition-all"
              />
            </div>
            <SaveBtn keyName="withdrawal_days" value={fields.withdrawal_days} onSave={save} saving={saving} />
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Allowed Hours
              </label>
              <input
                type="text"
                value={fields.withdrawal_hours}
                onChange={e => set('withdrawal_hours', e.target.value)}
                placeholder="e.g. 10:00 AM - 06:00 PM"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm
                           text-gray-800 outline-none focus:border-primary transition-all"
              />
            </div>
            <SaveBtn keyName="withdrawal_hours" value={fields.withdrawal_hours} onSave={save} saving={saving} />
          </div>
        </div>
      </div>

    </div>
  )
}