import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, RefreshCw, UserCheck, UserX, ChevronRight } from 'lucide-react'
import { adminGetUsers } from '../../api/admin'
import { fmtUSD } from '../../utils/currency'
import { fmtDate } from '../../utils/date'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'

const ROLES = {
  user:       { label: 'User',  color: 'text-gray-500',   bg: 'bg-gray-100'    },
  admin:      { label: 'Admin', color: 'text-primary',    bg: 'bg-primary-light'},
  superadmin: { label: 'Super', color: 'text-purple-600', bg: 'bg-purple-50'   },
}

const LIMIT = 20

const AdminUsers = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [status,  setStatus]  = useState(searchParams.get('status') || 'all')
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: LIMIT }
      if (status !== 'all') params.status = status
      if (search.trim())    params.phone  = search.trim()
      const { data } = await adminGetUsers(params)
      setUsers(data.users)
      setTotal(data.pagination.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => { ;(async () => { await load() })() }, [load])

  // Debounced search reset
  useEffect(() => {
    const t = setTimeout(() => { setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const pages = Math.ceil(total / LIMIT)

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} registered</p>
        </div>
        <button
          onClick={load}
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-primary transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
        />
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
        {['all', 'active', 'suspended'].map(s => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all
              ${status === s ? 'bg-primary text-white shadow-sm' : 'text-gray-400'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* User list */}
      {loading ? (
        <div className="py-12"><Spinner /></div>
      ) : users.length === 0 ? (
        <EmptyState message="No users found" icon="👥" />
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {users.map((u, i) => {
            const role = ROLES[u.role] || ROLES.user
            return (
              <div
                key={u.id}
                onClick={() => navigate(`/admin/users/${u.id}`)}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer
                            hover:bg-gray-50 active:bg-gray-100 transition-colors
                            ${i < users.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                  ${u.isActive ? 'bg-primary-light' : 'bg-gray-100'}`}>
                  {u.isActive
                    ? <UserCheck size={16} className="text-primary" />
                    : <UserX    size={16} className="text-gray-400" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-800 truncate">{u.maskedPhone}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${role.bg} ${role.color}`}>
                      {role.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-xs text-gray-400">{fmtDate(u.createdAt)}</p>
                    {!u.isActive && (
                      <span className="text-[10px] font-bold text-danger">Suspended</span>
                    )}
                  </div>
                </div>

                {/* Balance + chevron */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-gray-800">{fmtUSD(u.balance)}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">VIP{u.vipLevel}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300 shrink-0" />
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-gray-400">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500
                         disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-500
                         disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers