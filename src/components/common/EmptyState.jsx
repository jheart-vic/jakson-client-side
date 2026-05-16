const EmptyState = ({ message = 'No data yet', icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    {icon && <div className="mb-3 text-4xl">{icon}</div>}
    <p className="text-sm">{message}</p>
  </div>
)

export default EmptyState
