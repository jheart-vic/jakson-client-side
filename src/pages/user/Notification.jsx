import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import {
    Bell,
    Gift,
    Info,
    CheckCircle2,
    Copy,
    Check,
    ArrowDownCircle,
    ArrowUpCircle,
    Users,
    Calendar,
    ShieldCheck,
    Trash2,
    MailOpen,
    Loader2,
    Eye,
    AlertTriangle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../components/layout/PageHeader'
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
} from '../../api/notification'
import { handleApiError } from '../../utils/errorHandler'
import { getAnnouncements } from '../../api/settings'
import Skeleton from '../../components/common/Skeleton'
import Modal from '../../components/common/Modal'

const TYPE_META = {
    deposit:        { icon: ArrowDownCircle, color: 'text-blue-500',   bg: 'bg-blue-50',   label: 'Deposit'    },
    withdrawal:     { icon: ArrowUpCircle,   color: 'text-orange-500', bg: 'bg-orange-50', label: 'Withdrawal' },
    bonus_code:     { icon: Gift,            color: 'text-purple-500', bg: 'bg-purple-50', label: 'Bonus'      },
    daily_income:   { icon: CheckCircle2,    color: 'text-green-500',  bg: 'bg-green-50',  label: 'Income'     },
    referral_bonus: { icon: Users,           color: 'text-pink-500',   bg: 'bg-pink-50',   label: 'Referral'   },
    invitee:        { icon: Users,           color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Invitee'    },
    checkin:        { icon: Calendar,        color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Check-in'   },
    admin:          { icon: ShieldCheck,     color: 'text-gray-500',   bg: 'bg-gray-100',  label: 'Admin'      },
    system:         { icon: Info,            color: 'text-sky-500',    bg: 'bg-sky-50',    label: 'System'     },
}

const FILTERS = [
    { key: 'all',           label: 'All'             },
    { key: 'announcements', label: '📢 Announcements' },
    { key: 'unread',        label: 'Unread'          },
    { key: 'bonus_code',    label: 'Bonus'           },
    { key: 'deposit',       label: 'Deposit'         },
    { key: 'withdrawal',    label: 'Withdraw'        },
    { key: 'daily_income',  label: 'Income'          },
    { key: 'referral_bonus',label: 'Referral'        },
    { key: 'invitee',       label: 'Invitee'         },
    { key: 'checkin',       label: 'Check-in'        },
]

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days  = Math.floor(diff / 86400000)
    if (mins < 1)   return 'Just now'
    if (mins < 60)  return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
}

const Notifications = () => {
    const [notifications,        setNotifications]        = useState([])
    const [unreadCount,          setUnreadCount]          = useState(0)
    const [loading,              setLoading]              = useState(true)
    const { search }  = useLocation()
    const initTab     = new URLSearchParams(search).get('tab') || 'all'
    const [activeFilter,         setActiveFilter]         = useState(initTab)
    const [copiedId,             setCopiedId]             = useState(null)
    const [actionLoading,        setActionLoading]        = useState(null)
    const [announcements,        setAnnouncements]        = useState([])
    const [announcementsLoading, setAnnouncementsLoading] = useState(false)
    const [copiedCode,           setCopiedCode]           = useState(null)

    // ── Confirm modal state ──────────────────────────────────────────────────
    const [confirmModal, setConfirmModal] = useState(null)
    // confirmModal shape: { type: 'deleteOne' | 'deleteAll', id?: string, title, body, onConfirm }

    const load = useCallback(async (filter) => {
        setLoading(true)
        try {
            const params = {}
            if (filter === 'unread')     params.filter = 'unread'
            else if (filter !== 'all')   params.type   = filter
            const { data } = await getNotifications(params)
            setNotifications(data?.notifications || [])
            setUnreadCount(data?.unreadCount ?? 0)
        } catch (err) {
            handleApiError(err, 'Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }, [])

    const loadAnnouncements = useCallback(async () => {
        setAnnouncementsLoading(true)
        try {
            const { data } = await getAnnouncements()
            setAnnouncements(data?.notifications || [])
        } catch { /* silent */ }
        finally { setAnnouncementsLoading(false) }
    }, [])

    useEffect(() => {
        if (activeFilter === 'announcements') {
            ;(async () => { await loadAnnouncements() })()
        } else {
            ;(async () => { await load(activeFilter) })()
        }
    }, [load, loadAnnouncements, activeFilter])

    const handleMarkRead = async (id) => {
        if (actionLoading) return
        setActionLoading(id)
        try {
            await markAsRead(id)
            setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n))
            setUnreadCount((c) => Math.max(0, c - 1))
            toast.success('Marked as read')
        } catch (err) {
            handleApiError(err, 'Failed to mark as read')
        } finally {
            setActionLoading(null)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead()
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            setUnreadCount(0)
            toast.success('All marked as read')
        } catch (err) {
            handleApiError(err, 'Failed to mark all as read')
        }
    }

    const handleDelete = async (id) => {
        setConfirmModal({
            type: 'deleteOne',
            title: 'Delete Notification',
            body: 'Are you sure you want to delete this notification?',
            onConfirm: async () => {
                setConfirmModal(null)
                setActionLoading(id + '_del')
                try {
                    await deleteNotification(id)
                    setNotifications((prev) => {
                        const deleted = prev.find((n) => n._id === id)
                        if (deleted && !deleted.isRead) setUnreadCount((c) => Math.max(0, c - 1))
                        return prev.filter((n) => n._id !== id)
                    })
                    toast.success('Notification deleted')
                } catch (err) {
                    handleApiError(err, 'Failed to delete')
                } finally {
                    setActionLoading(null)
                }
            },
        })
    }

    const handleDeleteAll = () => {
        setConfirmModal({
            type: 'deleteAll',
            title: 'Clear All Notifications',
            body: 'This will permanently delete all your notifications. This cannot be undone.',
            onConfirm: async () => {
                setConfirmModal(null)
                try {
                    await deleteAllNotifications()
                    setNotifications([])
                    setUnreadCount(0)
                    toast.success('All notifications deleted')
                } catch (err) {
                    handleApiError(err, 'Failed to delete all notifications')
                }
            },
        })
    }

    const copyCode = (id, code) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        toast.success(`Copied: ${code}`)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const unreadInList = notifications.filter(n => !n.isRead).length
    const hasUnread    = unreadCount > 0 || unreadInList > 0

    const actionBtn = notifications.length > 0 ? (
        <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:gap-2">
            {hasUnread && (
                <button
                    onClick={handleMarkAllRead}
                    className="flex items-center justify-center gap-1 text-xs font-bold text-primary bg-primary-light px-2.5 py-1.5 rounded-xl"
                >
                    <MailOpen size={12} /> Read all
                </button>
            )}
            <button
                onClick={handleDeleteAll}
                className="flex items-center justify-center gap-1 text-xs font-bold text-red-400 bg-red-50 px-2.5 py-1.5 rounded-xl"
            >
                <Trash2 size={12} /> Clear all
            </button>
        </div>
    ) : null

    return (
        <div className='min-h-dvh pb-8'>
            <PageHeader
                title='Notifications'
                right={<div className="lg:hidden">{actionBtn}</div>}
            />

            {/* Filter tabs + desktop action button */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-3 pb-1">
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setActiveFilter(f.key)}
                            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all
                                ${activeFilter === f.key ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-100'}`}
                        >
                            {f.label}
                            {f.key === 'unread' && hasUnread && (
                                <span className='ml-1 bg-white text-primary rounded-full px-1.5 text-[10px] font-extrabold'>
                                    {unreadCount || unreadInList}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                <div className="hidden lg:block">{actionBtn}</div>
            </div>

            {/* Announcements tab */}
            {activeFilter === 'announcements' && (
                <div className='px-4 mt-3 space-y-3'>
                    {announcementsLoading ? (
                        <div className='flex justify-center py-20'>
                            <div className='w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin' />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-24 text-center'>
                            <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                                <Bell size={28} className='text-gray-300' />
                            </div>
                            <p className='text-gray-400 font-semibold text-sm'>No announcements yet</p>
                        </div>
                    ) : announcements.map((n) => {
                        const colorMap = { info: '#1a9fd4', success: '#10b981', warning: '#f97316', bonus: '#8b5cf6' }
                        const bgMap    = { info: '#e0f4fc', success: '#ecfdf5', warning: '#fff4ed', bonus: '#ede9fe' }
                        const IconMap  = { info: Info, success: CheckCircle2, warning: AlertTriangle, bonus: Gift }
                        const Icon     = IconMap[n.type] || Bell
                        return (
                            <div key={n._id} className='bg-white rounded-2xl p-4 border border-gray-100 shadow-card'>
                                <div className='flex items-start gap-3'>
                                    <div className='w-10 h-10 rounded-xl flex items-center justify-center shrink-0'
                                        style={{ backgroundColor: bgMap[n.type] || '#f3f4f6' }}>
                                        <Icon size={18} style={{ color: colorMap[n.type] || '#6b7280' }} strokeWidth={2} />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center justify-between gap-2 mb-1'>
                                            <p className='text-sm font-bold text-gray-800 leading-tight'>{n.title}</p>
                                            <span className='text-[10px] text-gray-400 font-medium shrink-0'>{timeAgo(n.createdAt)}</span>
                                        </div>
                                        <p className='text-xs text-gray-500 leading-relaxed'>{n.body}</p>
                                        {n.bonusCode && (
                                            <div className='mt-2.5 flex items-center gap-2'>
                                                <div className='flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-3 py-1.5 flex-1 min-w-0'>
                                                    <Gift size={12} className='text-purple-500 shrink-0' />
                                                    <span className='text-purple-700 font-extrabold text-xs tracking-widest truncate'>{n.bonusCode}</span>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(n.bonusCode)
                                                        setCopiedCode(n._id)
                                                        toast.success('Code copied!')
                                                        setTimeout(() => setCopiedCode(null), 2000)
                                                    }}
                                                    className='flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 transition-all active:scale-95'
                                                    style={{
                                                        background: copiedCode === n._id ? '#ecfdf5' : '#ede9fe',
                                                        color:      copiedCode === n._id ? '#10b981' : '#8b5cf6',
                                                    }}
                                                >
                                                    {copiedCode === n._id
                                                        ? <><Check size={11} /> Copied</>
                                                        : <><Copy size={11} /> Copy</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Personal notifications list */}
            {activeFilter !== 'announcements' && (
                <div className='px-4 mt-3 space-y-2'>
                    {loading ? (
                        <div className='space-y-2'>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className='bg-white rounded-2xl p-4 flex gap-3 border border-gray-50 shadow-card'>
                                    <Skeleton circle width={40} height={40} />
                                    <div className='flex-1'>
                                        <div className='flex justify-between'>
                                            <Skeleton width={130} height={13} />
                                            <Skeleton width={40} height={11} />
                                        </div>
                                        <Skeleton width='90%' height={11} className='mt-1.5' />
                                        <Skeleton width='65%' height={11} className='mt-1' />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-24 text-center'>
                            <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                                <Bell size={28} className='text-gray-300' />
                            </div>
                            <p className='text-sm font-bold text-gray-400'>No notifications here</p>
                            <p className='text-xs text-gray-300 mt-1'>
                                {activeFilter !== 'all' ? 'Try switching to "All"' : 'Check back later'}
                            </p>
                        </div>
                    ) : (
                        notifications.map((n) => {
                            const meta       = TYPE_META[n.type] || TYPE_META.system
                            const Icon       = meta.icon
                            const isDeleting = actionLoading === n._id + '_del'
                            const isMarking  = actionLoading === n._id

                            return (
                                <div
                                    key={n._id}
                                    className={`relative rounded-2xl border p-4 transition-all
                                        ${n.isRead ? 'bg-white border-gray-100' : 'bg-primary/5 border-primary/20'}`}
                                >
                                    {!n.isRead && (
                                        <div className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary shadow-sm' />
                                    )}

                                    <div className='flex items-start gap-3'>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}>
                                            <Icon size={18} className={meta.color} />
                                        </div>
                                        <div className='flex-1 min-w-0 pr-6'>
                                            <div className='flex items-center justify-between gap-2 mb-0.5'>
                                                <p className={`text-sm leading-tight ${n.isRead ? 'font-semibold text-gray-700' : 'font-bold text-gray-800'}`}>
                                                    {n.title}
                                                </p>
                                                <span className='text-[10px] text-gray-400 shrink-0'>{timeAgo(n.createdAt)}</span>
                                            </div>
                                            <p className='text-xs text-gray-500 leading-relaxed whitespace-pre-line'>{n.body}</p>

                                            {n.metadata?.code && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        copyCode(n._id, n.metadata.code)
                                                    }}
                                                    className='mt-2.5 flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl w-full active:scale-95 transition-transform'
                                                >
                                                    <div className='flex-1 text-left'>
                                                        <p className='text-[10px] text-gray-400 font-medium'>Bonus Code</p>
                                                        <p className='text-sm font-extrabold tracking-widest text-purple-700'>{n.metadata.code}</p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg
                                                        ${copiedId === n._id ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                                                        {copiedId === n._id ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                                                    </div>
                                                </button>
                                            )}

                                            <div className='flex items-center justify-between mt-2'>
                                                <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                                                    {meta.label}
                                                </span>
                                                {!n.isRead && (
                                                    <button
                                                        onClick={() => handleMarkRead(n._id)}
                                                        disabled={isMarking}
                                                        className='flex items-center gap-1 text-[10px] font-bold text-primary bg-white border border-primary/30 px-2 py-1 rounded-full active:scale-95 transition-all'
                                                    >
                                                        {isMarking ? <Loader2 size={10} className='animate-spin' /> : <Eye size={10} />}
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(n._id)
                                        }}
                                        disabled={isDeleting}
                                        className='absolute top-3.5 right-3.5 text-gray-400 hover:text-red-500 transition-colors'
                                    >
                                        {isDeleting ? <Loader2 size={14} className='animate-spin' /> : <Trash2 size={14} />}
                                    </button>
                                </div>
                            )
                        })
                    )}
                </div>
            )}

            {/* ── Confirm Modal ── */}
            <Modal
                isOpen={!!confirmModal}
                onClose={() => setConfirmModal(null)}
                title={confirmModal?.title || 'Confirm'}
            >
                {confirmModal && (
                    <div className="space-y-4 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-danger-light flex items-center justify-center mx-auto">
                            <Trash2 size={22} className="text-danger" />
                        </div>
                        <p className="text-sm text-gray-500">{confirmModal.body}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold active:scale-95 transition-transform"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="flex-1 py-3 rounded-2xl bg-danger text-white text-sm font-bold
                                           shadow-[0_4px_12px_rgba(239,68,68,0.25)] active:scale-95 transition-transform"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default Notifications