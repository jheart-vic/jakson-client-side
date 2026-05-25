import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from './BottomNav'
import OfflineBanner from '../common/OfflineBanner'
import DesktopSidebar from './DesktopSidebar'
import DesktopHeader from './DesktopHeader'
import MobileSupportButton from '../common/MobileSupportButton'

const UserLayout = () => {
  const { pathname } = useLocation()

  return (
    <>
      <DesktopSidebar />

      {/* Logo watermark */}
      <img
        aria-hidden="true"
        src="/logo.jpeg"
        alt=""
        style={{
          position:      'fixed',
          top:           '50%',
          left:          '50%',
          transform:     'translate(-50%, -50%)',
          width:         'min(65vw, 380px)',
          maxWidth:      '380px',
          minWidth:      '140px',
          opacity:       0.05,
          filter:        'invert(1) hue-rotate(180deg)',
          pointerEvents: 'none',
          zIndex:        5,
          userSelect:    'none',
          display:       'block',
          objectFit:     'contain',
        }}
      />

      <div className="flex flex-col min-h-screen transition-all duration-300 lg:ml-(--sidebar-w,224px)">
        <DesktopHeader />
        <main
          key={pathname}
          className="flex-1 pb-20 lg:pb-8 bg-surface lg:bg-gray-50"
          style={{ animation: 'fadeIn 0.2s ease both' }}
        >
          {/* Content container - centered with max width */}
          <div className="w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileSupportButton />
      <BottomNav />
      <OfflineBanner />
    </>
  )
}

export default UserLayout