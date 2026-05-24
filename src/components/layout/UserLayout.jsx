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

      {/* Watermark — logo.png as fixed background watermark */}
      <div
        aria-hidden="true"
        style={{
          position:           'fixed',
          top:                '50%',
          left:               '50%',
          transform:          'translate(-50%, -50%)',
          width:              'min(100vw, 700px)',
          height:             'min(100vw, 700px)',
          backgroundImage:    "url('/logo.png')",
          backgroundSize:     'contain',
          backgroundRepeat:   'no-repeat',
          backgroundPosition: 'center',
          opacity:            0.05,  // Increased to 25% for better visibility
          pointerEvents:      'none',
          zIndex:             5,
          userSelect:         'none',
        }}
      />

      <div className="flex flex-col min-h-screen transition-all duration-300 lg:ml-(--sidebar-w,224px)">
        <DesktopHeader />
        <main
          key={pathname}
          className="flex-1 pb-20 lg:pb-8 lg:bg-gray-50"
          style={{ animation: 'fadeIn 0.2s ease both' }}
        >
          <div className="lg:max-w-3xl lg:mx-auto lg:px-4 lg:py-6">
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