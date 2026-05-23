import { useNavigate, useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PAGE_TITLES = {
  '/main/dashboard':          { title: 'Dashboard',        sub: 'Account overview'              },
  '/main/invest':             { title: 'Invest',           sub: 'Browse investment plans'       },
  '/main/team':               { title: 'Team',             sub: 'Your referral network'         },
  '/main/account':            { title: 'Account',          sub: 'Profile & settings'            },
  '/main/deposit':            { title: 'Recharge',         sub: 'Add funds to your account'     },
  '/main/withdraw':           { title: 'Withdraw',         sub: 'Withdraw your earnings'        },
  '/main/notifications':      { title: 'Notifications',    sub: 'Messages & alerts'             },
  '/main/wealth-fund':        { title: 'Wealth Funds',     sub: 'Premium investment plans'      },
  '/main/wealth-fund/me':     { title: 'My Wealth Funds',  sub: 'Your active plans'             },
  '/main/deposit/log':        { title: 'Deposit History',  sub: 'All deposits'                  },
  '/main/withdraw/log':       { title: 'Withdraw History', sub: 'All withdrawals'               },
  '/main/invest-log':         { title: 'Invest Log',       sub: 'Investment records'            },
  '/main/bank/accounts':      { title: 'Bank Accounts',    sub: 'Linked accounts'               },
  '/main/bank/bind':          { title: 'Bind Bank',        sub: 'Add bank account'              },
  '/main/change-password':    { title: 'Change Password',  sub: 'Update login password'         },
  '/main/change-withdraw-pin':{ title: 'Withdraw PIN',     sub: 'Set or update PIN'             },
}

const DesktopHeader = () => {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const page = PAGE_TITLES[pathname] || { title: 'Luminos Energy', sub: '' }

  return (
    <header className="hidden lg:flex items-center justify-between h-14 px-6 bg-white border-b border-gray-100 sticky top-0 z-30 w-full"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

      <div>
        <h1 className="text-gray-900 font-extrabold text-sm leading-tight">{page.title}</h1>
        {page.sub && <p className="text-gray-400 text-[11px]">{page.sub}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/main/notifications')}
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors duration-150">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
        </button>
        <button onClick={() => navigate('/main/account')}
          className="w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#C67B2C,#A25F1F)' }}>
          {user?.initials || user?.fullName?.charAt(0)?.toUpperCase() || user?.phone?.charAt(0) || 'U'}
        </button>
      </div>
    </header>
  )
}

export default DesktopHeader