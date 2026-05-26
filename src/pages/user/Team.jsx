import { useState, useEffect, useCallback } from 'react'
import { Copy, Users, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTeamStats, getTierMembers } from '../../api/team'
import { fmtUSD } from '../../utils/currency'
import { fmtDate } from '../../utils/date'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import Skeleton from '../../components/common/Skeleton'
import { handleApiError } from '../../utils/errorHandler'

const TIERS = [
  { level: 1, label: 'Tier 1 Membership', commission: '8%', color: '#1a9fd4', bg: '#e0f4fc' },
  { level: 2, label: 'Tier 2 Membership', commission: '3%', color: '#10b981', bg: '#ecfdf5' },
  { level: 3, label: 'Tier 3 Membership', commission: '1%', color: '#f97316', bg: '#fff4ed' },
]

// Full-page skeleton that mirrors the actual layout
const TeamSkeleton = () => (
  <div className="min-h-dvh">
    <PageHeader title="Team" />
    {/* Stats header */}
    <div style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }} className="px-4 pt-4 pb-6">
      <Skeleton width={100} height={20} baseColor="rgba(255,255,255,0.15)" highlightColor="rgba(255,255,255,0.25)" />
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/10 rounded-2xl p-3 text-center">
            <Skeleton width={50} height={10} className="mx-auto" baseColor="rgba(255,255,255,0.15)" highlightColor="rgba(255,255,255,0.25)" />
            <Skeleton width={70} height={18} className="mx-auto mt-2" baseColor="rgba(255,255,255,0.15)" highlightColor="rgba(255,255,255,0.25)" />
          </div>
        ))}
      </div>
      {/* Invite link box */}
      <div className="mt-4 bg-white/10 rounded-2xl p-4">
        <Skeleton width={90} height={10} baseColor="rgba(255,255,255,0.15)" highlightColor="rgba(255,255,255,0.25)" />
        <div className="flex gap-2 mt-2">
          <Skeleton height={40} className="flex-1" borderRadius={12} baseColor="rgba(255,255,255,0.15)" highlightColor="rgba(255,255,255,0.25)" />
          <Skeleton width={64} height={40} borderRadius={12} baseColor="rgba(255,255,255,0.15)" highlightColor="rgba(255,255,255,0.25)" />
        </div>
      </div>
    </div>
    {/* Tiers */}
    <div className="px-4 mt-4 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-card border border-gray-50 p-4 flex items-center gap-3">
          <Skeleton circle width={44} height={44} />
          <div className="flex-1">
            <Skeleton width={130} height={14} />
            <Skeleton width={90} height={11} className="mt-1.5" />
          </div>
          <Skeleton width={40} height={14} />
          <Skeleton width={20} height={20} borderRadius={4} />
        </div>
      ))}
    </div>
  </div>
)

const Team = () => {
  const [stats, setStats]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [tierModal, setTierModal]   = useState(null)
  const [members, setMembers]       = useState([])
  const [membersLoading, setML]     = useState(false)

  const load = useCallback(async () => {
    try { const { data } = await getTeamStats(); setStats(data) }
    catch (err) { handleApiError(err, 'Failed to load team stats') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { ;(async () => { await load() })() }, [load])

  const openTier = async (tier) => {
    setTierModal(tier)
    setML(true)
    try { const { data } = await getTierMembers(tier.level); setMembers(data.members) }
    catch (err) { handleApiError(err, 'Failed to load tier members') }
    finally { setML(false) }
  }

  const copy = () => {
    navigator.clipboard.writeText(stats?.inviteLink || '')
      .then(() => toast.success('Invite link copied!'))
  }

  if (loading) return <TeamSkeleton />

  return (
    <div className="min-h-dvh pb-24">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}
        className="px-4 pt-12 pb-6">
        <h1 className="text-white text-xl font-extrabold">My Team</h1>

        {/* FIX: items-stretch keeps all 3 cards the same height even when a label wraps */}
        <div className="grid grid-cols-3 gap-2 mt-4 items-stretch">
          {[
            { label: 'Earnings', val: fmtUSD(stats?.totalEarnings || 0) },
            { label: 'Today',    val: fmtUSD(stats?.todayEarnings  || 0) },
            { label: 'Members',  val: stats?.totalMembers || 0 },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/15 rounded-2xl p-3 text-center border border-white/20 flex flex-col justify-center">
              <p className="text-white/70 text-[10px] font-medium leading-tight">{label}</p>
              <p className="text-white font-extrabold text-base mt-1 leading-tight truncate">{val}</p>
            </div>
          ))}
        </div>

        {/* Invite link — FIX: items-center aligns the link box and copy button on the same baseline */}
        <div className="mt-4 bg-white/10 rounded-2xl p-4 border border-white/15">
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-wide mb-2">Your Invite Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 bg-white/10 rounded-xl px-3 py-2.5 border border-white/20">
              <p className="text-white text-xs font-medium truncate">{stats?.inviteLink || '—'}</p>
            </div>
            <button onClick={copy}
              className="flex items-center gap-1.5 bg-white text-primary text-xs font-bold px-3 py-2.5 rounded-xl active:scale-95 transition-transform shrink-0">
              <Copy size={12} /> Copy
            </button>
          </div>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="px-4 mt-4 space-y-3">
        <p className="text-sm font-extrabold text-gray-700 mb-1">Team Tiers</p>
        {TIERS.map((tier, i) => {
          const count = stats?.[`tier${tier.level}Count`] || 0
          return (
            <button key={tier.level} onClick={() => openTier(tier)}
              className="w-full bg-white rounded-2xl shadow-card border border-gray-50 p-4 flex items-center gap-3 active:scale-[0.99] transition-transform animate-slide-up"
              style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: tier.bg }}>
                <Users size={18} style={{ color: tier.color }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-gray-800">{tier.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{count} member{count !== 1 ? 's' : ''}</p>
              </div>
              <span className="text-xs font-extrabold" style={{ color: tier.color }}>{tier.commission}</span>
              <ChevronRight size={15} className="text-gray-300" />
            </button>
          )
        })}
      </div>

      {/* Tier member modal */}
      <Modal isOpen={!!tierModal} onClose={() => setTierModal(null)} title={tierModal?.label}>
        {membersLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton circle width={36} height={36} />
                <div className="flex-1">
                  <Skeleton width={110} height={13} />
                  <Skeleton width={80} height={10} className="mt-1" />
                </div>
                <Skeleton width={60} height={12} />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState message="No members in this tier yet" icon="👥" />
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {members.map(m => (
              <div key={m._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                  <span className="text-sm font-extrabold text-primary">
                    {(m.displayName || m.userName || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">{m.displayName || m.userName}</p>
                  <p className="text-xs text-gray-400">{fmtDate(m.createdAt)}</p>
                </div>
                <p className="text-xs font-bold text-success shrink-0">{fmtUSD(m.totalInvested || 0)}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Team