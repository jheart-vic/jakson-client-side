import { useState } from 'react'
import { X, Headphones, Lock, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const WHATSAPP_URL = 'https://wa.me/447470059551'
const TELEGRAM_URL = 'https://t.me/Cs_luminos_Energy'

// ── VIP Gate Modal ────────────────────────────────────────────────────────────
export const VipGateModal = ({ onClose }) => {
  const navigate = useNavigate()

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: 'rgba(28,26,24,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-t-3xl sm:rounded-2xl p-6 pb-8"
        style={{ background: '#fff', boxShadow: '0 -8px 40px rgba(0,0,0,0.14)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: '#F5F3EF', color: '#9B9690' }}
        >
          <X size={15} />
        </button>

        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg,#FEF3E4,#FDDCAA)' }}
        >
          <Lock size={24} style={{ color: '#C67B2C' }} />
        </div>

        {/* Copy */}
        <h2 className="text-center font-extrabold text-lg mb-1" style={{ color: '#1C1A18' }}>
          Support is a VIP perk
        </h2>
        <p className="text-center text-sm mb-6" style={{ color: '#7A7470', lineHeight: 1.6 }}>
          Upgrade to <strong style={{ color: '#C67B2C' }}>VIP 1</strong> or above to unlock
          direct access to our customer support team via WhatsApp and Telegram.
        </p>

        {/* Actions */}
        <button
          onClick={() => { onClose(); navigate('/main/invest') }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white mb-3 transition-opacity active:opacity-80"
          style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)', boxShadow: '0 4px 14px rgba(198,123,44,0.35)' }}
        >
          <Crown size={16} />
          Upgrade to VIP 1
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl font-semibold text-sm transition-colors"
          style={{ background: '#F5F3EF', color: '#7A7470' }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

// ── Mobile Support Button ─────────────────────────────────────────────────────
const MobileSupportButton = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [showGate, setShowGate] = useState(false)

  const isVip0 = !user?.vipLevel || user.vipLevel === 0

  const handleSupportClick = (e) => {
    if (isVip0) {
      e.preventDefault()
      setOpen(false)
      setShowGate(true)
    }
  }

  return (
    <>
      {showGate && <VipGateModal onClose={() => setShowGate(false)} />}

      {/* Only visible on mobile — hidden on desktop (sidebar handles it) */}
      <div className="lg:hidden fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2">

        {/* Expanded options */}
        {open && (
          <>
            {/* WhatsApp */}
            <a
              href={isVip0 ? undefined : WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { handleSupportClick(e); if (!isVip0) setOpen(false) }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-lg"
              style={{
                background:     isVip0 ? '#9B9690' : '#25D366',
                boxShadow:      isVip0 ? '0 4px 16px rgba(0,0,0,0.12)' : '0 4px 16px rgba(37,211,102,0.35)',
                animation:      'slideUp 0.18s cubic-bezier(0,0,0.2,1) both',
                animationDelay: '0.04s',
                textDecoration: 'none',
                cursor:         isVip0 ? 'pointer' : 'pointer',
              }}
            >
              {isVip0
                ? <Lock size={16} />
                : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                )
              }
              WhatsApp
            </a>

            {/* Telegram */}
            <a
              href={isVip0 ? undefined : TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { handleSupportClick(e); if (!isVip0) setOpen(false) }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-lg"
              style={{
                background:     isVip0 ? '#9B9690' : '#0088CC',
                boxShadow:      isVip0 ? '0 4px 16px rgba(0,0,0,0.12)' : '0 4px 16px rgba(0,136,204,0.35)',
                animation:      'slideUp 0.18s cubic-bezier(0,0,0.2,1) both',
                textDecoration: 'none',
              }}
            >
              {isVip0
                ? <Lock size={16} />
                : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                )
              }
              Telegram
            </a>
          </>
        )}

        {/* Toggle button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 active:scale-95"
          style={{
            background: open
              ? '#6B7280'
              : 'linear-gradient(135deg,#C67B2C,#A25F1F)',
            boxShadow: open
              ? '0 4px 12px rgba(0,0,0,0.2)'
              : '0 4px 16px rgba(198,123,44,0.4)',
          }}
          aria-label="Support"
        >
          {open ? <X size={20} /> : <Headphones size={20} />}
        </button>

      </div>
    </>
  )
}

export default MobileSupportButton