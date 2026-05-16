import { useLocation, useNavigate } from 'react-router-dom'
import { Home, BarChart2, Users, User } from 'lucide-react'

const tabs = [
  { label: 'Home',   icon: Home,     path: '/main/dashboard' },
  { label: 'Invest', icon: BarChart2, path: '/main/invest'   },
  { label: 'Team',   icon: Users,    path: '/main/team'      },
  { label: 'Account',icon: User,     path: '/main/account'   },
]

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="bottom-nav">
      {tabs.map(({ label, icon: Icon, path }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`nav-item ${active ? 'active' : ''}`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
