import { useLoading } from '../../context/LoadingContext'
import Spinner from './Spinner'

export default function GlobalLoader() {
  const { activeRequests } = useLoading()

  if (activeRequests === 0) return null

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-5 shadow-xl flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-600 font-medium">Loading...</p>
        <p className="text-xs text-gray-400">Please wait, this may take a moment</p>
      </div>
    </div>
  )
}