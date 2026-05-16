import { CheckCircle } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader'

const RULES = [
  'After the deposit is paid, it can be refunded at any time after waiting for 24 hours.',
  'If the account balance is in arrears, the deposit will be redeemed after the arrears are paid.',
  'If you refuse to return the solar panel, fail to pay the rental fee for a long time, or the solar panel is lost or damaged due to improper use, we have the right to deduct the corresponding fees directly from the deposit you paid.',
]

const SolarPanelRules = () => (
  <div className="min-h-dvh bg-surface pb-8">
    <PageHeader title="Solar Panel Rules" />

    <div className="px-4 mt-4 space-y-4">
      {/* Status card */}
      <div className="card card-p text-center">
        <div className="w-16 h-16 rounded-2xl bg-success-light flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={32} className="text-success" />
        </div>
        <p className="text-2xl font-extrabold text-success mb-1">Free</p>
        <p className="text-gray-500 text-sm">Congratulations! You do not need to pay a deposit.</p>
      </div>

      {/* Rules */}
      <div className="card card-p">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Solar Panel Deposit Rules</p>
        <div className="space-y-4">
          {RULES.map((rule, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary text-xs font-extrabold">{i + 1}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default SolarPanelRules
