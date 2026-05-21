import { Routes, Route, Navigate } from 'react-router-dom'

// Guards
import GuestRoute from './components/guards/GuestRoute'
import ProtectedRoute from './components/guards/ProtectedRoute'
import AdminRoute from './components/guards/AdminRoute'

// Layouts
import UserLayout from './components/layout/UserLayout'
import AdminLayout from './components/layout/AdminLayout'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// User pages
import Dashboard from './pages/user/Dashboard'
import Invest from './pages/user/Invest'
import Team from './pages/user/Team'
import Account from './pages/user/Account'
import Deposit from './pages/user/Deposit'
import DepositLog from './pages/user/DepositLog'
import Withdraw from './pages/user/Withdraw'
import WithdrawLog from './pages/user/WithdrawLog'
import InvestLog from './pages/user/InvestLog'
import FundingDetails from './pages/user/FundingDetails'
import BankAccounts from './pages/user/BankAccounts'
import BindBank from './pages/user/BindBank'
import SolarPanelRules from './pages/user/SolarPanelRules'
import ChangePassword from './pages/user/ChangePassword'
import ChangeWithdrawPin from './pages/user/ChangeWithdrawPin'
import WealthFunds from './pages/user/WealthFunds'
import MyWealthFunds from './pages/user/MyWealthFunds'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminDeposits from './pages/admin/AdminDeposits'
import AdminWithdrawals from './pages/admin/AdminWithdrawals'
import AdminSettings from './pages/admin/AdminSettings'
import AdminLogin from './pages/admin/AdminLogin'
import AdminWealthFunds from './pages/admin/AdminWealthFunds'
import AdminBonusCodes from './pages/admin/AdminBonusCode'
import AdminNotifications from './pages/admin/AdminNotifications'
import Notifications from './pages/user/Notification'

const App = () => (
    <Routes>
        {/* ── Root redirect ──────────────────────────────── */}
        <Route path='/' element={<Navigate to='/main/dashboard' replace />} />

        {/* ── Public / Guest routes ──────────────────────── */}
        <Route
            path='/login'
            element={
                <GuestRoute>
                    <Login />
                </GuestRoute>
            }
        />
        <Route
            path='/register'
            element={
                <GuestRoute>
                    <Register />
                </GuestRoute>
            }
        />
        <Route
            path='/forgot-password'
            element={
                <GuestRoute>
                    <ForgotPassword />
                </GuestRoute>
            }
        />
        <Route
            path='/reset-password'
            element={
                <GuestRoute>
                    <ResetPassword />
                </GuestRoute>
            }
        />
        <Route path='/admin/login' element={<AdminLogin />} />

        {/* ── User routes (authenticated) ────────────────── */}
        <Route
            path='/main'
            element={
                <ProtectedRoute>
                    <UserLayout />
                </ProtectedRoute>
            }
        >
            <Route index element={<Navigate to='dashboard' replace />} />
            <Route path='dashboard' element={<Dashboard />} />
            <Route path='invest' element={<Invest />} />
            <Route path='team' element={<Team />} />
            <Route path='account' element={<Account />} />

            {/* Sub pages (no bottom nav needed — handled inside UserLayout) */}
            <Route path='deposit' element={<Deposit />} />
            <Route path='deposit/log' element={<DepositLog />} />
            <Route path='withdraw' element={<Withdraw />} />
            <Route path='withdraw/log' element={<WithdrawLog />} />
            <Route path='invest-log' element={<InvestLog />} />
            <Route path='funding' element={<FundingDetails />} />
            <Route path='bank/accounts' element={<BankAccounts />} />
            <Route path='bank/bind' element={<BindBank />} />
            <Route path='solar-panel' element={<SolarPanelRules />} />
            <Route path='change-password' element={<ChangePassword />} />
            <Route path='change-withdraw-pin' element={<ChangeWithdrawPin />} />
            <Route path='wealth-fund' element={<WealthFunds />} />
            <Route path='wealth-fund/me' element={<MyWealthFunds />} />
            <Route path="/main/notifications" element={<Notifications />} />
        </Route>

        {/* ── Admin routes (admin or superadmin only) ─────── */}
        <Route
            path='/admin'
            element={
                <AdminRoute>
                    <AdminLayout />
                </AdminRoute>
            }
        >
            <Route index element={<Navigate to='dashboard' replace />} />
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='products' element={<AdminProducts />} />
            <Route path='users' element={<AdminUsers />} />
            <Route path='users/:id' element={<AdminUserDetail />} />
            <Route path='deposits' element={<AdminDeposits />} />
            <Route path='withdrawals' element={<AdminWithdrawals />} />
            <Route path='settings' element={<AdminSettings />} />
            <Route path="wealth-funds" element={<AdminWealthFunds />} />
            <Route path="/admin/bonus-codes"   element={<AdminBonusCodes />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
        </Route>

        {/* ── 404 ─────────────────────────────────────────── */}
        <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
)

export default App
