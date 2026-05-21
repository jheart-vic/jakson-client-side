import { useLocation, useNavigate } from 'react-router-dom'
import { Home, BarChart2, Users, User } from 'lucide-react'

const tabs = [
  { label: 'Home',    icon: Home,     path: '/main/dashboard', tourId: 'nav-dashboard' },
  { label: 'Invest',  icon: BarChart2, path: '/main/invest',   tourId: null            },
  { label: 'Team',    icon: Users,    path: '/main/team',      tourId: 'nav-team'      },
  { label: 'Account', icon: User,     path: '/main/account',   tourId: null            },
]

const BottomNav = () => {
  const location = useLocation()
  const navigate  = useNavigate()

  return (
    <nav data-tour="bottom-nav" className="bottom-nav">
      {tabs.map(({ label, icon: Icon, path, tourId }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`nav-item ${active ? 'active' : ''}`}
            {...(tourId ? { 'data-tour': tourId } : {})}
          >
            <div className="relative">
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              {active && (
                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </div>
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav