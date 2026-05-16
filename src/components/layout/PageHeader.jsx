import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PageHeader = ({ title, onBack, right }) => {
  const navigate = useNavigate()
  const handleBack = onBack || (() => navigate(-1))

  return (
    <div className="page-header">
      <button onClick={handleBack} className="p-1 -ml-1">
        <ChevronLeft size={22} />
      </button>
      <h1 className="flex-1 text-base font-semibold">{title}</h1>
      {right && <div>{right}</div>}
    </div>
  )
}

export default PageHeader
