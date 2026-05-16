const colours = {
  approved:    'text-success',
  completed:   'text-success',
  in_progress: 'text-primary',
  pending:     'text-warning',
  processing:  'text-warning',
  rejected:    'text-danger',
  cancelled:   'text-danger',
  expired:     'text-gray-400',
}

const labels = {
  in_progress: 'In progress',
}

const StatusBadge = ({ status = '' }) => (
  <span className={`text-xs font-semibold ${colours[status] || 'text-gray-500'}`}>
    {labels[status] || status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
)

export default StatusBadge
