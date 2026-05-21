import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BarChart2, Users, User,
  ArrowDownCircle, ArrowUpCircle, Bell,
  LogOut, Gift, ChevronRight,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const EXPANDED_W = 224   // px — matches w-56
const COLLAPSED_W = 64   // px — matches w-16

const mainLinks = [
  { to: '/main/dashboard', label: 'Dashboard',  icon: LayoutDashboard, tourId: 'nav-dashboard' },
  { to: '/main/invest',    label: 'Invest',      icon: BarChart2,       tourId: null            },
  { to: '/main/team',      label: 'Team',        icon: Users,           tourId: 'nav-team'      },
  { to: '/main/account',   label: 'Account',     icon: User,            tourId: null            },
]

const actionLinks = [
  { to: '/main/deposit',       label: 'Recharge',      icon: ArrowDownCircle, tourId: null         },
  { to: '/main/withdraw',      label: 'Withdraw',      icon: ArrowUpCircle,   tourId: null         },
  { to: '/main/team',          label: 'Invite & Earn', icon: Gift,            tourId: 'nav-invite' },
  { to: '/main/notifications', label: 'Notifications', icon: Bell,            tourId: null         },
]

// Individual nav item — adapts to collapsed/expanded
const NavItem = ({ to, label, icon: Icon, tourId, collapsed }) => (
  <NavLink
    to={to}
    title={collapsed ? label : undefined}
    {...(tourId ? { 'data-tour': tourId } : {})}
    className="flex items-center rounded-xl text-sm font-semibold transition-colors duration-150"
    style={({ isActive }) => ({
      gap:        collapsed ? 0 : '0.75rem',
      padding:    collapsed ? '0.625rem' : '0.625rem 0.75rem',
      justifyContent: collapsed ? 'center' : 'flex-start',
      background: isActive ? '#FEF3E4' : 'transparent',
      color:      isActive ? '#A25F1F' : '#5C5652',
      border:     isActive ? '1px solid #F5DDB8' : '1px solid transparent',
    })}
  >
    {({ isActive }) => (
      <>
        <Icon
          size={17}
          strokeWidth={isActive ? 2.3 : 1.9}
          style={{ flexShrink: 0, color: isActive ? '#C67B2C' : '#8A847F' }}
        />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            {isActive && <ChevronRight size={13} style={{ color: '#D4956A', flexShrink: 0 }} />}
          </>
        )}
      </>
    )}
  </NavLink>
)

const DesktopSidebar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Persist collapsed state in localStorage
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sb_collapsed') === 'true'
  )

  // Keep the CSS variable in sync so UserLayout shifts correctly
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-w',
      `${collapsed ? COLLAPSED_W : EXPANDED_W}px`
    )
  }, [collapsed])

  const toggle = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sb_collapsed', next)
  }

  const handleLogout = () => { logout(); navigate('/login', { replace: true }) }

  const sidebarWidth = collapsed ? COLLAPSED_W : EXPANDED_W

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 bg-white overflow-hidden"
      style={{
        width:       sidebarWidth,
        borderRight: '1px solid #ECEAE6',
        boxShadow:   '1px 0 8px rgba(0,0,0,0.04)',
        transition:  'width 220ms cubic-bezier(0,0,0.2,1)',
      }}
    >
      {/* ── Logo + toggle ── */}
      <div
        className="flex items-center border-b border-gray-100 shrink-0"
        style={{
          padding:        collapsed ? '1.125rem 0' : '1.125rem 1.25rem',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight:      60,
        }}
      >
        {/* Logo mark — always visible */}
        <div
          className="flex items-center gap-3 min-w-0"
          style={{ overflow: 'hidden', flex: collapsed ? '0 0 auto' : 1 }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}
          >
            <span className="text-lg leading-none">☀️</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-extrabold text-sm leading-tight truncate" style={{ color: '#1C1A18' }}>Luminos</p>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#C67B2C' }}>Energy</p>
            </div>
          )}
        </div>

        {/* Toggle button */}
        {!collapsed && (
          <button
            onClick={toggle}
            title="Collapse sidebar"
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150"
            style={{ color: '#B5AFA9' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F3EF'; e.currentTarget.style.color = '#5C5652' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B5AFA9' }}
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden"
        style={{ padding: collapsed ? '1rem 0.5rem' : '1rem 0.75rem' }}
      >
        {/* Expand button shown at top when collapsed */}
        {collapsed && (
          <button
            onClick={toggle}
            title="Expand sidebar"
            className="w-full flex items-center justify-center rounded-xl mb-3 transition-colors duration-150"
            style={{ padding: '0.5rem', color: '#B5AFA9' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F3EF'; e.currentTarget.style.color = '#5C5652' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B5AFA9' }}
          >
            <PanelLeftOpen size={16} />
          </button>
        )}

        {/* Section label — hidden when collapsed */}
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#B5AFA9' }}>Main</p>
        )}
        {mainLinks.map(l => (
          <NavItem key={l.to + l.label} {...l} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <p className="px-3 mt-5 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#B5AFA9' }}>Actions</p>
        )}
        {collapsed && <div className="my-3 mx-auto h-px w-8" style={{ background: '#ECEAE6' }} />}
        {actionLinks.map(l => (
          <NavItem key={l.to + l.label} {...l} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── User + logout ── */}
      <div
        className="border-t border-gray-100 shrink-0"
        style={{ padding: collapsed ? '0.75rem 0.5rem' : '0.75rem' }}
      >
        {collapsed ? (
          /* Collapsed: just avatar + logout stacked */
          <div className="flex flex-col items-center gap-2">
            <div
              title={user?.name || user?.phone || 'User'}
              className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm text-white cursor-default"
              style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || user?.phone?.charAt(0) || 'U'}
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-150"
              style={{ color: '#B5AFA9' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC5F5F' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B5AFA9' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          /* Expanded: user card + logout row */
          <>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2" style={{ background: '#FAF8F5' }}>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || user?.phone?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate" style={{ color: '#2C2825' }}>{user?.name || 'User'}</p>
                <p className="text-[10px] truncate" style={{ color: '#9B9690' }}>{user?.phone || ''}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors duration-150"
              style={{ color: '#8A847F' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC5F5F' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8A847F' }}
            >
              <LogOut size={15} style={{ flexShrink: 0 }} /> Log out
            </button>
          </>
        )}
      </div>
    </aside>
  )
}

export default DesktopSidebar