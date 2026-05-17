import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { getBankList, bindBankAccount } from '../../api/bank'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/common/Spinner'

const BindBank = () => {
  const navigate = useNavigate()
  const [banks, setBanks]     = useState([])
  const [form, setForm]       = useState({ bankName: '', accountName: '', accountNumber: '' })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSheet, setShowSheet]   = useState(false)

  const load = useCallback(async () => {
    try {
      const { data } = await getBankList()
      setBanks(data.banks)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { ;(async () => { await load() })() }, [load])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.bankName) return toast.error('Please select a bank')
    if (!form.accountName.trim()) return toast.error('Enter your account name')
    if (!form.accountNumber.trim() || form.accountNumber.length < 10)
      return toast.error('Enter a valid 10-digit account number')
    setSubmitting(true)
    try {
      await bindBankAccount(form)
      toast.success('Bank account bound successfully!')
      navigate(-1)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to bind account')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div className="min-h-dvh bg-surface"><PageHeader title="Bind Bank" /><Spinner /></div>

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <PageHeader title="Bind Bank Account" />

      <form onSubmit={handleSubmit} className="px-4 mt-4 space-y-4">

        {/* Bank selector */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Bank</p>
          <button type="button" onClick={() => setShowSheet(true)}
            className={`w-full flex items-center justify-between px-4 py-3.5 bg-gray-50 border-[1.5px] rounded-2xl transition-all
              ${form.bankName ? 'border-primary shadow-[0_0_0_3px_rgba(26,159,212,0.12)]' : 'border-gray-200'}`}>
            <span className={`text-sm font-semibold ${form.bankName ? 'text-gray-800' : 'text-gray-400'}`}>
              {form.bankName || 'Select a bank'}
            </span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>

        {/* Name */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Account Name</p>
          <input type="text" placeholder="Please enter your name" value={form.accountName} onChange={set('accountName')}
            className="input rounded-2xl" />
        </div>

        {/* Account number */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Account Number</p>
          <input type="tel" placeholder="10-digit account number" value={form.accountNumber}
            onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
            inputMode="numeric" maxLength={10}
            className="input rounded-2xl font-mono tracking-widest text-center text-lg" />
          <p className="text-xs text-gray-400 mt-2 text-center">{form.accountNumber.length}/10 digits</p>
        </div>

        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
          <p className="text-orange-600 text-xs font-medium leading-relaxed">
            ⚠️ Please ensure your account is your real-name account. A mismatch will cause withdrawal failure and account freeze.
          </p>
        </div>

        <button type="submit" disabled={submitting}
          className="btn btn-primary rounded-2xl h-14">
          {submitting
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
            : 'Bind Now'}
        </button>
      </form>

      {/* Bank bottom sheet */}
      {showSheet && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSheet(false)} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-120
                          bg-white rounded-t-3xl max-h-[75vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-800 text-base">Select Bank</h3>
              <button onClick={() => setShowSheet(false)} className="text-gray-400 text-sm font-bold">Done</button>
            </div>
            <div className="overflow-y-auto flex-1 py-2">
              {banks.map(bank => (
                <button key={bank} onClick={() => { setForm(f => ({ ...f, bankName: bank })); setShowSheet(false) }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-colors active:bg-gray-50
                    ${form.bankName === bank ? 'text-primary bg-primary-light' : 'text-gray-700'}`}>
                  {bank}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BindBank
