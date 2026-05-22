import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ArrowDownCircle,
  ArrowUpCircle, Settings, LogOut, Menu,
  Landmark, Tag, Bell, ChevronRight, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/admin/dashboard',     label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/admin/products',      label: 'Products',      icon: Package         },
  { to: '/admin/users',         label: 'Users',         icon: Users           },
  { to: '/admin/deposits',      label: 'Deposits',      icon: ArrowDownCircle },
  { to: '/admin/withdrawals',   label: 'Withdrawals',   icon: ArrowUpCircle   },
  { to: '/admin/wealth-funds',  label: 'Wealth Funds',  icon: Landmark        },
  { to: '/admin/bonus-codes',   label: 'Bonus Codes',   icon: Tag             },
  { to: '/admin/notifications', label: 'Announcements', icon: Bell            },
  { to: '/admin/settings',      label: 'Settings',      icon: Settings        },
]

const NavItem = ({ to, label, icon: Icon, collapsed, onClose }) => {
  const { pathname } = useLocation()
  const active = pathname === to || pathname.startsWith(to + '/')

  return (
    <NavLink
      to={to}
      onClick={() => onClose?.()}
      className="flex items-center rounded-xl text-sm font-semibold transition-colors duration-150"
      style={{
        gap: collapsed ? 0 : '0.75rem',
        padding: collapsed ? '0.625rem' : '0.625rem 0.75rem',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: active ? 'linear-gradient(135deg,rgba(198,123,44,0.12),rgba(198,123,44,0.06))' : 'transparent',
        color: active ? '#C67B2C' : '#5a5a5a',
        border: active ? '1px solid rgba(198,123,44,0.18)' : '1px solid transparent',
      }}
    >
      <Icon size={16} strokeWidth={active ? 2.3 : 1.9} style={{ flexShrink: 0 }} />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{label}</span>
          {active && <ChevronRight size={13} style={{ color: 'rgba(198,123,44,0.5)' }} />}
        </>
      )}
    </NavLink>
  )
}

const SidebarContent = ({ collapsed, onToggle, user, onLogout, onClose }) => (
  <div className="flex flex-col h-full">
    {/* Logo + toggle area */}
    <div
      className="flex items-center border-b border-gray-100 shrink-0"
      style={{
        padding: collapsed ? '1.125rem 0' : '1.125rem 1.25rem',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: 60,
      }}
    >
      {/* Logo mark (always visible) */}
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
            <p className="font-extrabold text-gray-900 text-sm leading-tight truncate">Luminos Energy</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Toggle button – only shown on desktop (when onToggle exists) */}
      {!collapsed && onToggle && (
        <button
          onClick={onToggle}
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

    {/* Navigation */}
    <nav
      className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden"
      style={{ padding: collapsed ? '1rem 0.5rem' : '1rem 0.75rem' }}
    >
      {/* Expand button – only shown on desktop (when collapsed and onToggle exists) */}
      {collapsed && onToggle && (
        <button
          onClick={onToggle}
          title="Expand sidebar"
          className="w-full flex items-center justify-center rounded-xl mb-3 transition-colors duration-150"
          style={{ padding: '0.5rem', color: '#B5AFA9' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5F3EF'; e.currentTarget.style.color = '#5C5652' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B5AFA9' }}
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      {/* Section label (hidden when collapsed) */}
      {!collapsed && (
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Menu</p>
      )}
      {links.map(link => (
        <NavItem key={link.to} {...link} collapsed={collapsed} onClose={onClose} />
      ))}
      {collapsed && <div className="my-3 mx-auto h-px w-8" style={{ background: '#ECEAE6' }} />}
    </nav>

    {/* User + logout */}
    <div
      className="border-t border-gray-100 shrink-0"
      style={{ padding: collapsed ? '0.75rem 0.5rem' : '0.75rem' }}
    >
      {collapsed ? (
        /* Collapsed: avatar + logout stacked */
        <div className="flex flex-col items-center gap-2">
          <div
            title={user?.phone || 'Admin'}
            className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm text-white cursor-default"
            style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}
          >
            {user?.phone?.charAt(0) || 'A'}
          </div>
          <button
            onClick={onLogout}
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
        /* Expanded: user card + logout button */
        <>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm text-white shrink-0"
              style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}
            >
              {user?.phone?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{user?.phone || 'Admin'}</p>
              <p className="text-[10px] font-bold text-primary uppercase">{user?.role || 'admin'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
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
  </div>
)

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Persist sidebar collapsed state in localStorage
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('admin_sb_collapsed') === 'true')

  const sidebarWidth = collapsed ? 64 : 224

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('admin_sb_collapsed', next)
  }

  const handleLogout = () => { logout(); navigate('/admin/login', { replace: true }) }

  const currentLink = links.find(l => pathname === l.to || pathname.startsWith(l.to + '/'))
  const pageTitle = currentLink?.label || 'Admin'

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 bg-white overflow-hidden"
        style={{
          width: sidebarWidth,
          borderRight: '1px solid #ECEAE6',
          boxShadow: '1px 0 8px rgba(0,0,0,0.04)',
          transition: 'width 220ms cubic-bezier(0,0,0.2,1)',
        }}
      >
        <SidebarContent collapsed={collapsed} onToggle={toggleCollapse} user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} style={{ animation: 'backdropIn 0.18s ease both' }} />
          <aside className="fixed top-0 left-0 h-screen w-64 bg-white z-50 lg:hidden flex flex-col" style={{ animation: 'slideInRight 0.2s ease both', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}>
            <SidebarContent collapsed={false} user={user} onLogout={handleLogout} onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content margin for desktop */}
      <style>{`@media(min-width:1024px){.admin-main{margin-left:${sidebarWidth}px}}`}</style>
      <div className="admin-main flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4 lg:px-6 w-full"
          style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)}
              className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="font-extrabold text-gray-900 text-sm leading-tight">{pageTitle}</h1>
              <p className="text-gray-400 text-[11px] hidden sm:block">Luminos Energy Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}>
              {user?.phone?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main key={pathname} className="flex-1 p-4 lg:p-6" style={{ animation: 'fadeIn 0.18s ease both' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout