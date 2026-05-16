import { Check, X } from 'lucide-react'

export const PASSWORD_RULES = [
  { key: 'length',   label: 'At least 8 characters',          test: (p) => p.length >= 8 },
  { key: 'upper',    label: 'One uppercase letter (A–Z)',      test: (p) => /[A-Z]/.test(p) },
  { key: 'lower',    label: 'One lowercase letter (a–z)',      test: (p) => /[a-z]/.test(p) },
  { key: 'number',   label: 'One number (0–9)',                test: (p) => /[0-9]/.test(p) },
  { key: 'special',  label: 'One special character (!@#$…)',   test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export const validatePassword = (password) =>
  PASSWORD_RULES.every(r => r.test(password))

const PasswordRules = ({ password }) => {
  if (!password) return null

  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Password Requirements</p>
      {PASSWORD_RULES.map(({ key, label, test }) => {
        const passed = test(password)
        return (
          <div key={key} className="flex items-center gap-2.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-200
              ${passed ? 'bg-success' : 'bg-gray-200'}`}>
              {passed
                ? <Check size={11} className="text-white" strokeWidth={3} />
                : <X size={11} className="text-gray-400" strokeWidth={3} />
              }
            </div>
            <span className={`text-xs font-medium transition-colors duration-200
              ${passed ? 'text-success' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default PasswordRules