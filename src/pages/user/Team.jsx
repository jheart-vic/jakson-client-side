import { useState, useEffect, useCallback } from 'react'
import { Copy, Users, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTeamStats, getTierMembers } from '../../api/team'
import { fmtUSD } from '../../utils/currency'
import { fmtDate } from '../../utils/date'
import PageHeader from '../../components/layout/PageHeader'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import { handleApiError } from '../../utils/errorHandler'

const TIERS = [
  { level: 1, label: 'Tier 1 Membership', commission: '8%', color: '#1a9fd4', bg: '#e0f4fc' },
  { level: 2, label: 'Tier 2 Membership', commission: '3%', color: '#10b981', bg: '#ecfdf5' },
  { level: 3, label: 'Tier 3 Membership', commission: '1%', color: '#f97316', bg: '#fff4ed' },
]

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

  if (loading) return <div className="min-h-dvh bg-surface"><PageHeader title="Team" /><Spinner /></div>

  return (
    <div className="min-h-dvh bg-surface pb-24">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #C67B2C, #9E5E1F)' }}
        className="px-4 pt-12 pb-6">
        <h1 className="text-white text-xl font-extrabold">My Team</h1>

        {/* Earnings summary - FIXED: prevent overflow and keep centered */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Total Earnings', val: fmtUSD(stats?.totalEarnings || 0) },
            { label: 'Today',          val: fmtUSD(stats?.todayEarnings || 0) },
            { label: 'Yesterday',      val: fmtUSD(stats?.yesterdayEarnings || 0) },
          ].map(({ label, val }) => (
            <div key={label} className="bg-white/15 backdrop-blur rounded-2xl p-2 text-center border border-white/20 min-w-0">
              <p className="text-white font-bold text-xs sm:text-sm wrap-break-word leading-tight px-1">
                {val}
              </p>
              <p className="text-white/60 text-[10px] font-medium mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* People count */}
        <div className="card card-p">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total People', val: stats?.team?.totalPeople || 0 },
              { label: 'Today',        val: 0 },
            ].map(({ label, val }) => (
              <div key={label} className="text-center bg-gray-50 rounded-2xl p-4">
                <p className="text-3xl font-extrabold text-gray-800 wrap-break-word">{val}</p>
                <p className="text-xs text-gray-400 font-medium mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Invite link */}
        <div className="card card-p">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Your Invite Link</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-2xl p-3 border border-gray-200">
            <p className="flex-1 text-xs text-gray-600 font-medium truncate">{stats?.inviteLink}</p>
            <button onClick={copy}
              className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold
                         px-3 py-2 rounded-xl active:scale-95 transition-transform shrink-0">
              <Copy size={11} /> Copy
            </button>
          </div>
        </div>

        {/* Tier list */}
        <div className="card overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 pt-4 pb-3">Team Size</p>
          {TIERS.map((tier, i) => {
            const count = stats?.team?.[`tier${tier.level}`]?.count || 0
            return (
              <button key={tier.level} onClick={() => openTier(tier)}
                className={`w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 transition-colors
                  ${i < TIERS.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: tier.bg }}>
                  <span className="text-xs font-extrabold" style={{ color: tier.color }}>Lv{tier.level}</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-gray-800">{tier.label} {tier.commission}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{count} {count === 1 ? 'person' : 'people'}</p>
                </div>
                <ChevronRight size={15} className="text-gray-300" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Tier members modal */}
      <Modal isOpen={!!tierModal} onClose={() => { setTierModal(null); setMembers([]) }}
        title={tierModal ? `${tierModal.label} — ${tierModal.commission}` : ''}>
        <div className="max-h-72 overflow-y-auto space-y-2">
          {membersLoading ? <Spinner size="sm" /> : members.length === 0
            ? <EmptyState message="No members in this tier yet" icon="👥" />
            : members.map((m, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
                  <Users size={14} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{m.phone}</p>
                  <p className="text-xs text-gray-400">Joined {fmtDate(m.joinedAt)}</p>
                </div>
                <span className="text-xs text-gray-400">VIP{m.vipLevel}</span>
              </div>
            ))}
        </div>
      </Modal>
    </div>
  )
}

export default Team