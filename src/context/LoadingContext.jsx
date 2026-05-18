/* eslint-disable react-refresh/only-export-components */
// /* eslint-disable react-refresh/only-export-components */
// import { createContext, useContext, useState, useCallback } from 'react'

// const LoadingContext = createContext(null)

// export const LoadingProvider = ({ children }) => {
//   const [activeRequests, setActiveRequests] = useState(0)

//   const startRequest = useCallback(() => {
//     setActiveRequests(prev => prev + 1)
//   }, [])

//   const endRequest = useCallback(() => {
//     setActiveRequests(prev => Math.max(0, prev - 1))
//   }, [])

//   return (
//     <LoadingContext.Provider value={{ activeRequests, startRequest, endRequest }}>
//       {children}
//     </LoadingContext.Provider>
//   )
// }

// export const useLoading = () => useContext(LoadingContext)

import { createContext, useContext, useState, useEffect } from 'react'
import { onRequestStart, onRequestEnd } from '../api/axios'

const LoadingContext = createContext(null)

export const LoadingProvider = ({ children }) => {
  const [activeRequests, setActiveRequests] = useState(0)

  useEffect(() => {
    const start = () => setActiveRequests(prev => prev + 1)
    const end = () => setActiveRequests(prev => Math.max(0, prev - 1))
    onRequestStart(start)
    onRequestEnd(end)
    return () => {
      // optional: remove listeners if needed
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ activeRequests }}>
      {children}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => useContext(LoadingContext)