import { useState, useEffect, useCallback } from 'react'
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

const TYPE_META = {
    deposit: {
        icon: ArrowDownCircle,
        color: 'text-blue-500',
        bg: 'bg-blue-50',
        label: 'Deposit',
    },
    withdrawal: {
        icon: ArrowUpCircle,
        color: 'text-orange-500',
        bg: 'bg-orange-50',
        label: 'Withdrawal',
    },
    bonus_code: {
        icon: Gift,
        color: 'text-purple-500',
        bg: 'bg-purple-50',
        label: 'Bonus',
    },
    daily_income: {
        icon: CheckCircle2,
        color: 'text-green-500',
        bg: 'bg-green-50',
        label: 'Income',
    },
    referral_bonus: {
        icon: Users,
        color: 'text-pink-500',
        bg: 'bg-pink-50',
        label: 'Referral',
    },
    invitee: {
        icon: Users,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50',
        label: 'Invitee',
    },
    checkin: {
        icon: Calendar,
        color: 'text-yellow-500',
        bg: 'bg-yellow-50',
        label: 'Check-in',
    },
    admin: {
        icon: ShieldCheck,
        color: 'text-gray-500',
        bg: 'bg-gray-100',
        label: 'Admin',
    },
    system: {
        icon: Info,
        color: 'text-sky-500',
        bg: 'bg-sky-50',
        label: 'System',
    },
}

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'bonus_code', label: 'Bonus' },
    { key: 'deposit', label: 'Deposit' },
    { key: 'withdrawal', label: 'Withdraw' },
    { key: 'daily_income', label: 'Income' },
    { key: 'referral_bonus', label: 'Referral' },
    { key: 'invitee', label: 'Invitee' },
    { key: 'checkin', label: 'Check-in' },
]

const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
}

const Notifications = () => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState('all')
    const [copiedId, setCopiedId] = useState(null)
    const [actionLoading, setActionLoading] = useState(null)

    const load = useCallback(async (filter) => {
        setLoading(true)
        try {
            const params = {}
            if (filter === 'unread') params.filter = 'unread'
            else if (filter !== 'all') params.type = filter

            const { data } = await getNotifications(params)
            setNotifications(data?.notifications || [])
            setUnreadCount(data?.unreadCount ?? 0)
        } catch (err) {
            handleApiError(err, 'Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        ;(async () => {
            await load(activeFilter)
        })()
    }, [load, activeFilter])

    const handleMarkRead = async (id) => {
        if (actionLoading) return
        setActionLoading(id)
        try {
            await markAsRead(id)
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
            )
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
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true })),
            )
            setUnreadCount(0)
            toast.success('All marked as read')
        } catch (err) {
            handleApiError(err, 'Failed to mark all as read')
        }
    }

    const handleDelete = async (id) => {
        setActionLoading(id + '_del')
        try {
            await deleteNotification(id)
            setNotifications((prev) => {
                const deleted = prev.find((n) => n._id === id)
                if (deleted && !deleted.isRead)
                    setUnreadCount((c) => Math.max(0, c - 1))
                return prev.filter((n) => n._id !== id)
            })
            toast.success('Notification deleted')
        } catch (err) {
            handleApiError(err, 'Failed to delete')
        } finally {
            setActionLoading(null)
        }
    }

    const handleDeleteAll = async () => {
        if (!confirm('Delete all notifications?')) return
        try {
            await deleteAllNotifications()
            setNotifications([])
            setUnreadCount(0)
            toast.success('All notifications deleted')
        } catch (err) {
            handleApiError(err, 'Failed to delete all notifications')
        }
    }

    const copyCode = (id, code) => {
        navigator.clipboard.writeText(code)
        setCopiedId(id)
        toast.success(`Copied: ${code}`)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className='min-h-dvh bg-surface pb-8'>
            <PageHeader
                title='Notifications'
                right={
                    unreadCount > 0 ? (
                        <button
                            onClick={handleMarkAllRead}
                            className='flex items-center gap-1 text-xs font-bold text-primary bg-primary-light px-2.5 py-1.5 rounded-xl'
                        >
                            <MailOpen size={12} /> Read all
                        </button>
                    ) : notifications.length > 0 ? (
                        <button
                            onClick={handleDeleteAll}
                            className='flex items-center gap-1 text-xs font-bold text-red-400 bg-red-50 px-2.5 py-1.5 rounded-xl'
                        >
                            <Trash2 size={12} /> Clear all
                        </button>
                    ) : null
                }
            />

            {/* Filter tabs - wrapped, no overflow */}
            <div className='flex flex-wrap gap-2 px-4 pt-3 pb-1'>
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all
              ${activeFilter === f.key ? 'bg-primary text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-100'}`}
                    >
                        {f.label}
                        {f.key === 'unread' && unreadCount > 0 && (
                            <span className='ml-1 bg-white text-primary rounded-full px-1.5 text-[10px] font-extrabold'>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className='px-4 mt-3 space-y-2'>
                {loading ? (
                    <div className='flex justify-center py-20'>
                        <div className='w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin' />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-24 text-center'>
                        <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
                            <Bell size={28} className='text-gray-300' />
                        </div>
                        <p className='text-sm font-bold text-gray-400'>
                            No notifications here
                        </p>
                        <p className='text-xs text-gray-300 mt-1'>
                            {activeFilter !== 'all'
                                ? 'Try switching to "All"'
                                : 'Check back later'}
                        </p>
                    </div>
                ) : (
                    notifications.map((n) => {
                        const meta = TYPE_META[n.type] || TYPE_META.system
                        const Icon = meta.icon
                        const isDeleting = actionLoading === n._id + '_del'
                        const isMarking = actionLoading === n._id

                        return (
                            <div
                                key={n._id}
                                className={`relative rounded-2xl border p-4 transition-all
                  ${n.isRead ? 'bg-white border-gray-100' : 'bg-primary/5 border-primary/20'}`}
                            >
                                {/* Unread dot - top right corner of the card */}
                                {!n.isRead && (
                                    <div className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary shadow-sm' />
                                )}

                                <div className='flex items-start gap-3'>
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meta.bg}`}
                                    >
                                        <Icon
                                            size={18}
                                            className={meta.color}
                                        />
                                    </div>
                                    <div className='flex-1 min-w-0 pr-6'>
                                        <div className='flex items-center justify-between gap-2 mb-0.5'>
                                            <p
                                                className={`text-sm leading-tight ${n.isRead ? 'font-semibold text-gray-700' : 'font-bold text-gray-800'}`}
                                            >
                                                {n.title}
                                            </p>
                                            <span className='text-[10px] text-gray-400 shrink-0'>
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                        <p className='text-xs text-gray-500 leading-relaxed whitespace-pre-line'>
                                            {n.body}
                                        </p>

                                        {/* Bonus code copy button */}
                                        {n.metadata?.code && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    copyCode(
                                                        n._id,
                                                        n.metadata.code,
                                                    )
                                                }}
                                                className='mt-2.5 flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl w-full active:scale-95 transition-transform'
                                            >
                                                <div className='flex-1 text-left'>
                                                    <p className='text-[10px] text-gray-400 font-medium'>
                                                        Bonus Code
                                                    </p>
                                                    <p className='text-sm font-extrabold tracking-widest text-purple-700'>
                                                        {n.metadata.code}
                                                    </p>
                                                </div>
                                                <div
                                                    className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg
                          ${copiedId === n._id ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}
                                                >
                                                    {copiedId === n._id ? (
                                                        <>
                                                            <Check size={11} />{' '}
                                                            Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={11} />{' '}
                                                            Copy
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        )}

                                        <div className='flex items-center justify-between mt-2'>
                                            <span
                                                className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}
                                            >
                                                {meta.label}
                                            </span>
                                            {/* Mark as read button (only for unread) */}
                                            {!n.isRead && (
                                                <button
                                                    onClick={() =>
                                                        handleMarkRead(n._id)
                                                    }
                                                    disabled={isMarking}
                                                    className='flex items-center gap-1 text-[10px] font-bold text-primary bg-white border border-primary/30 px-2 py-1 rounded-full active:scale-95 transition-all'
                                                >
                                                    {isMarking ? (
                                                        <Loader2
                                                            size={10}
                                                            className='animate-spin'
                                                        />
                                                    ) : (
                                                        <Eye size={10} />
                                                    )}
                                                    Mark read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Delete button - always visible */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(n._id)
                                    }}
                                    disabled={isDeleting}
                                    className='absolute top-3.5 right-3.5 text-gray-400 hover:text-red-500 transition-colors'
                                >
                                    {isDeleting ? (
                                        <Loader2
                                            size={14}
                                            className='animate-spin'
                                        />
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

export default Notifications
