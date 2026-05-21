import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { LoadingProvider } from './context/LoadingContext'
import { NetworkProvider } from './context/NetworkContext'
import { OnboardingProvider } from './context/OnboardingContext'
import App from './App'
import GlobalLoader from './components/common/GlobalLoader'
import WelcomeModal from './components/onboarding/WelcomeModal'
import TourOverlay from './components/onboarding/TourOverlay'

import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <NetworkProvider>
      <AuthProvider>
        <LoadingProvider>
          <OnboardingProvider>
            <App />
            <GlobalLoader />

            {/* ── Onboarding layer (above everything) ── */}
            <WelcomeModal />
            <TourOverlay />

            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: '12px',
                  fontSize: '14px',
                  maxWidth: '360px',
                  fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
                success: {
                  iconTheme: { primary: '#C67B2C', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#DC5F5F', secondary: '#fff' },
                },
              }}
            />
          </OnboardingProvider>
        </LoadingProvider>
      </AuthProvider>
    </NetworkProvider>
  </BrowserRouter>
)