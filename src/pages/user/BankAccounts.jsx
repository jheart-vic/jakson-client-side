import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CheckCircle, ChevronRight } from 'lucide-react'
import { getBankAccounts } from '../../api/bank'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/common/Spinner'

const BankAccounts = () => {
  const navigate  = useNavigate()
  const [accounts, setAccounts] = useState([])
  const [loading,  setLoading]  = useState(true)

  const load = useCallback(async () => {
    try { const { data } = await getBankAccounts(); setAccounts(data.accounts) }
    // eslint-disable-next-line no-empty
    catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { ;(async () => { await load() })() }, [load])

  return (
    <div className="min-h-dvh bg-surface pb-8">
      <PageHeader title="Withdrawal Account" />
      <div className="px-4 mt-4 space-y-4">

        {loading ? <Spinner /> : (
          <>
            {/* Bank */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Bank Account</p>
              </div>
              {accounts.length > 0 ? (
                accounts.map(acc => (
                  <div key={acc._id} className="flex items-center gap-3 p-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary-light flex items-center justify-center shrink-0">
                      <span className="text-xl">🏦</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800">{acc.bankName}</p>
                        {acc.isDefault && (
                          <span className="flex items-center gap-0.5 text-[10px] text-success font-bold">
                            <CheckCircle size={10} /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{acc.accountName}</p>
                      <p className="text-xs text-gray-400 font-mono">{acc.accountNumber}</p>
                    </div>
                    <button onClick={() => navigate('/main/bank/bind')} className="text-gray-300">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <button onClick={() => navigate('/main/bank/bind')}
                  className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xl">🏦</span>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-800">Bind Bank</p>
                      <p className="text-xs text-gray-400">To bind →</p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-gray-300" />
                </button>
              )}
            </div>

            {/* Add button */}
            <button onClick={() => navigate('/main/bank/bind')}
              className="btn btn-outline rounded-2xl h-13 text-sm font-bold flex items-center gap-2">
              <Plus size={16} /> Bind New Account
            </button>

            {/* Warning */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
              <p className="text-orange-600 text-xs font-medium leading-relaxed">
                ⚠️ Please ensure your account is a real-name verified account. Using an unverified account will cause withdrawal failure and account freeze.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default BankAccounts
