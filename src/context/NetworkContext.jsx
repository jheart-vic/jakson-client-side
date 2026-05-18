import { createContext, useContext, useEffect, useState } from 'react'
/* eslint-disable react-refresh/only-export-components */

const NetworkContext = createContext(null)

export const NetworkProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [slowConnection, setSlowConnection] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Detect slow connection using Network Information API
    if ('connection' in navigator) {
      const connection = navigator.connection
      const updateSlowStatus = () => {
        setSlowConnection(connection.saveData || connection.effectiveType === 'slow-2g')
      }
      updateSlowStatus()
      connection.addEventListener('change', updateSlowStatus)
      return () => connection.removeEventListener('change', updateSlowStatus)
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <NetworkContext.Provider value={{ isOnline, slowConnection }}>
      {children}
    </NetworkContext.Provider>
  )
}

export const useNetwork = () => useContext(NetworkContext)