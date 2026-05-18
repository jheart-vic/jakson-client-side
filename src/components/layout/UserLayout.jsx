import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import OfflineBanner from '../common/OfflineBanner'

const UserLayout = () => (
  <div className="min-h-screen bg-surface pb-20">
    <Outlet />
    <BottomNav />
    <OfflineBanner />
  </div>
)

export default UserLayout