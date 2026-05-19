// import { Outlet, NavLink, useNavigate } from 'react-router-dom'
// import {
//   LayoutDashboard, Package, Users, ArrowDownCircle,
//   ArrowUpCircle, Settings, LogOut,
// } from 'lucide-react'
// import { useAuth } from '../../context/AuthContext'

// const links = [
//   { to: '/admin/dashboard',    label: 'Dashboard',   icon: LayoutDashboard  },
//   { to: '/admin/products',     label: 'Products',    icon: Package          },
//   { to: '/admin/users',        label: 'Users',       icon: Users            },
//   { to: '/admin/deposits',     label: 'Deposits',    icon: ArrowDownCircle  },
//   { to: '/admin/withdrawals',  label: 'Withdrawals', icon: ArrowUpCircle    },
//   { to: '/admin/settings',     label: 'Settings',    icon: Settings         },
// ]

// const AdminLayout = () => {
//   const { user, logout } = useAuth()
//   const navigate = useNavigate()

//   const handleLogout = () => { logout(); navigate('/login') }

//   return (
//     <div className="flex min-h-screen max-w-[480px] mx-auto">
//       {/* Sidebar */}
//       <aside className="w-56 bg-gray-900 text-white flex flex-col fixed top-0 left-1/2 -translate-x-[240px] h-full z-40">
//         {/* Logo */}
//         <div className="px-5 py-5 border-b border-gray-700">
//           <p className="text-primary font-bold text-lg">Luminos Energy</p>
//           <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
//         </div>

//         {/* Nav links */}
//         <nav className="flex-1 px-3 py-4 space-y-1">
//           {links.map(({ to, label, icon: Icon }) => (
//             <NavLink
//               key={to}
//               to={to}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
//                  ${isActive
//                    ? 'bg-primary text-white'
//                    : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
//               }
//             >
//               <Icon size={18} />
//               {label}
//             </NavLink>
//           ))}
//         </nav>

//         {/* User + Logout */}
//         <div className="px-4 py-4 border-t border-gray-700">
//           <p className="text-xs text-gray-400 mb-1 truncate">{user?.phone}</p>
//           <p className="text-xs text-primary font-semibold uppercase mb-3">{user?.role}</p>
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
//           >
//             <LogOut size={16} /> Log out
//           </button>
//         </div>
//       </aside>

//       {/* Main content */}
//       <main className="ml-56 flex-1 p-6 bg-gray-50 min-h-screen">
//         <Outlet />
//       </main>
//     </div>
//   )
// }

// export default AdminLayout


import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, Users, ArrowDownCircle,
  ArrowUpCircle, Settings, LogOut, Menu, X,
  Landmark,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/admin/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/admin/products',    label: 'Products',    icon: Package         },
  { to: '/admin/users',       label: 'Users',       icon: Users           },
  { to: '/admin/deposits',    label: 'Deposits',    icon: ArrowDownCircle },
  { to: '/admin/withdrawals', label: 'Withdrawals', icon: ArrowUpCircle   },
  { to: '/admin/settings',    label: 'Settings',    icon: Settings        },
  { to: '/admin/wealth-funds', label: 'Wealth Funds', icon: Landmark }
]

const AdminLayout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/admin/login', { replace: true }) }
  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="min-h-screen bg-gray-50 max-w-120 mx-auto relative">

      {/* ── Top bar (mobile) ──────────────────────────── */}
      <header className="sticky top-0 z-30 bg-gray-900 text-white flex items-center justify-between px-4 py-3.5 shadow-lg">
        <div>
          <p className="text-primary font-bold text-base leading-tight">Luminos Energy</p>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest">Admin Panel</p>
        </div>
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-white
                     active:scale-95 transition-transform"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* ── Slide-down menu ───────────────────────────── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm"
            onClick={closeMenu}
          />

          {/* Menu panel */}
          <div className="fixed top-14.25 left-1/2 -translate-x-1/2 w-full max-w-120 z-30
                          bg-gray-900 shadow-2xl animate-slide-up">
            <nav className="px-3 py-3 space-y-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                     ${isActive
                       ? 'bg-primary text-white'
                       : 'text-gray-400 hover:text-white hover:bg-gray-800'}`
                  }
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* User + logout inside menu */}
            <div className="px-4 py-4 border-t border-gray-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 truncate">{user?.phone}</p>
                <p className="text-xs text-primary font-bold uppercase mt-0.5">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Page content ──────────────────────────────── */}
      <main className="p-4 pb-10">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout