const Spinner = ({ fullscreen = false, size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

  const spinner = (
    <div className={`${sizes[size]} animate-spin rounded-full border-4 border-primary/20 border-t-primary`} />
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface z-50">
        {spinner}
      </div>
    )
  }

  return <div className="flex justify-center py-8">{spinner}</div>
}

export default Spinner
