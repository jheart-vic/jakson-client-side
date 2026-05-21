import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const Modal = ({ isOpen, onClose, title, children, hideClose = false }) => {
  const panelRef = useRef(null)

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else        document.body.style.overflow = ''
    return ()  => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape' && !hideClose) onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, hideClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={!hideClose ? onClose : undefined}
      />
      {/* Panel */}
      <div
        ref={panelRef}
        className="modal-panel relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm mx-auto shadow-2xl"
        style={{ maxHeight: '90dvh', overflowY: 'auto' }}
      >
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-6 pt-2 pb-6">
          {/* Header */}
          {(title || !hideClose) && (
            <div className="flex items-center justify-between mb-5">
              {title && (
                <h2 className="text-lg font-bold text-gray-800">{title}</h2>
              )}
              {!hideClose && (
                <button
                  onClick={onClose}
                  className="ml-auto w-8 h-8 flex items-center justify-center rounded-full
                             bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700
                             transition-all duration-150 active:scale-90"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
