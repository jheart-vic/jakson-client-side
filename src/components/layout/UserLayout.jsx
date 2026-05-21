import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import OfflineBanner from '../common/OfflineBanner'
import DesktopSidebar from './DesktopSidebar'
import DesktopHeader from './DesktopHeader'

const UserLayout = () => {
  const { pathname } = useLocation()

  return (
    <>
      <DesktopSidebar />

      {/* Only apply margin on desktop (≥1024px) */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300 lg:ml-(--sidebar-w,224px)"
      >
        <DesktopHeader />
        <main
          key={pathname}
          className="flex-1 pb-20 lg:pb-8 lg:bg-gray-50"
          style={{ animation: 'slideUp 0.22s cubic-bezier(0,0,0.2,1) both' }}
        >
          <div className="lg:max-w-3xl lg:mx-auto lg:px-4 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <BottomNav />
      <OfflineBanner />
    </>
  )
}

export default UserLayout