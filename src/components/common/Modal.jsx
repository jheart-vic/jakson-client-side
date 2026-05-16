import { useEffect } from 'react'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, hideClose = false }) => {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return ()  => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={!hideClose ? onClose : undefined}
      />
      {/* Panel */}
      <div className="relative bg-white rounded-2xl w-[90%] max-w-sm p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {!hideClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
        {title && (
          <h2 className="text-center text-lg font-bold text-gray-800 mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}

export default Modal
