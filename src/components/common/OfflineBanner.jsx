import { useNetwork } from '../../context/NetworkContext'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const { isOnline } = useNetwork()

  if (isOnline) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 bg-danger text-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 animate-slide-up">
      <WifiOff size={18} />
      <div className="flex-1">
        <p className="text-sm font-bold">No Internet Connection</p>
        <p className="text-xs opacity-80">Please check your network and try again</p>
      </div>
    </div>
  )
}