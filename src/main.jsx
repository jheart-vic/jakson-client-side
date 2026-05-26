import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { SkeletonTheme } from 'react-loading-skeleton'
import { AuthProvider } from './context/AuthContext'
import { NetworkProvider } from './context/NetworkContext'
import { OnboardingProvider } from './context/OnboardingContext'
import App from './App'
import WelcomeModal from './components/onboarding/WelcomeModal'
import TourOverlay from './components/onboarding/TourOverlay'
import 'react-loading-skeleton/dist/skeleton.css'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <NetworkProvider>
      <AuthProvider>
        <OnboardingProvider>
          {/* Global skeleton theme — matches app's warm surface palette */}
          <SkeletonTheme
            baseColor="#ede9e3"
            highlightColor="#f7f4f0"
            borderRadius="10px"
            duration={1.5}
          >
            <App />
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
          </SkeletonTheme>
        </OnboardingProvider>
      </AuthProvider>
    </NetworkProvider>
  </BrowserRouter>
)
