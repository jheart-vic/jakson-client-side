import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { LoadingProvider } from './context/LoadingContext'
import { NetworkProvider } from './context/NetworkContext'
import App from './App'
import GlobalLoader from './components/common/GlobalLoader'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NetworkProvider>
        <AuthProvider>
          <LoadingProvider>
            <App />
            <GlobalLoader />
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: '12px',
                  fontSize: '14px',
                  maxWidth: '360px',
                },
                success: { iconTheme: { primary: '#C67B2C', secondary: '#fff' } },
              }}
            />
          </LoadingProvider>
        </AuthProvider>
      </NetworkProvider>
    </BrowserRouter>
  </StrictMode>
)