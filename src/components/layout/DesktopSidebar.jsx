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
          <img
            src="/logo.jpeg"
            alt="Luminos Energy"
            className="w-9 h-9 rounded-xl object-cover shrink-0"
            style={{ border: '1px solid rgba(198,123,44,0.3)' }}
          />
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

        {/* ── Support ── */}
        {collapsed
          ? <div className="my-3 mx-auto h-px w-8" style={{ background: '#ECEAE6' }} />
          : <p className="px-3 mt-5 mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#B5AFA9' }}>Support</p>
        }

        {/* WhatsApp */}
        <a
          href="https://wa.me/447470059551"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? 'WhatsApp' : undefined}
          className="flex items-center rounded-xl text-sm font-semibold transition-colors duration-150"
          style={{
            gap:            collapsed ? 0 : '0.75rem',
            padding:        collapsed ? '0.625rem' : '0.625rem 0.75rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color:          '#5C5652',
            border:         '1px solid transparent',
            textDecoration: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F0FAF4'; e.currentTarget.style.color = '#25D366' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5C5652' }}
        >
          {/* WhatsApp SVG */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: '#25D366' }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {!collapsed && <span className="flex-1">WhatsApp</span>}
        </a>

        {/* Telegram */}
        <a
          href="https://t.me/luminosenergy"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? 'Telegram' : undefined}
          className="flex items-center rounded-xl text-sm font-semibold transition-colors duration-150"
          style={{
            gap:            collapsed ? 0 : '0.75rem',
            padding:        collapsed ? '0.625rem' : '0.625rem 0.75rem',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color:          '#5C5652',
            border:         '1px solid transparent',
            textDecoration: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#EFF8FF'; e.currentTarget.style.color = '#0088CC' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5C5652' }}
        >
          {/* Telegram SVG */}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0, color: '#0088CC' }}>
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          {!collapsed && <span className="flex-1">Telegram</span>}
        </a>
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
              {user?.initials || user?.fullName?.charAt(0)?.toUpperCase() || user?.phone?.charAt(0) || 'U'}
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
                {user?.initials || user?.fullName?.charAt(0)?.toUpperCase() || user?.phone?.charAt(0) || 'U'}
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