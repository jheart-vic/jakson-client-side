import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

const UserLayout = () => (
  <div className="min-h-screen bg-surface pb-20">
    <Outlet />
    <BottomNav />
  </div>
)

export default UserLayout
