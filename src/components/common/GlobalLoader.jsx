import { useDebounce } from '../../hooks/useDebounce'
import { useLoading } from '../../context/LoadingContext'

const MIN_LOADER_DELAY = 400  // slightly longer debounce feels less jittery

export default function GlobalLoader() {
  const { activeRequests } = useLoading()
  const debouncedActive = useDebounce(activeRequests, MIN_LOADER_DELAY)
  const showLoader = debouncedActive > 0

  if (!showLoader) return null

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)',
               animation: 'fadeIn 0.2s ease both' }}
    >
      <div
        className="bg-white rounded-2xl px-7 py-6 shadow-2xl flex flex-col items-center gap-3"
        style={{ animation: 'scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* Animated spinner with primary color */}
        <div className="relative w-10 h-10">
          <div
            className="absolute inset-0 rounded-full border-[3px]"
            style={{ borderColor: 'var(--color-primary-light)' }}
          />
          <div
            className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin-slow"
            style={{ borderTopColor: 'var(--color-primary)' }}
          />
        </div>
        <p className="text-sm text-gray-700 font-semibold tracking-tight">Loading…</p>
      </div>
    </div>
  )
}
