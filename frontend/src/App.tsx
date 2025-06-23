import { useState, useEffect } from 'react'
import AuthPage from './components/AuthPage'
import OnboardingFlow from './components/OnboardingFlow'
import Layout from './components/Layout'
import GrantDiscoveryDashboard from './components/GrantDiscoveryDashboard'
import EnhancedGrantDiscoveryDashboard from './components/EnhancedGrantDiscoveryDashboard'
import GrantDetailPage from './components/GrantDetailPage'
import MyGrantsWorkspace from './components/MyGrantsWorkspace'
import DocumentManager from './components/DocumentManager'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ProfileSettings from './components/ProfileSettings'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

interface Grant {
  id: number
  name: string
  funder: string
  description: string
  amount_string: string
  due_date: string
  status: string
  source_url: string
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
}

type AppState = 'loading' | 'auth' | 'onboarding' | 'app'
type CurrentPage = 'dashboard' | 'discovery' | 'my-grants' | 'document-bank' | 'analytics' | 'profile' | 'grant-detail'

// Demo App Component - bypasses all authentication
function DemoApp() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('discovery')
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)

  const handlePageChange = (page: string) => {
    setCurrentPage(page as CurrentPage)
    if (page !== 'grant-detail') {
      setSelectedGrant(null)
    }
  }

  const handleGrantClick = (grant: Grant) => {
    setSelectedGrant(grant)
    setCurrentPage('grant-detail')
  }

  const handleBackToDashboard = () => {
    setSelectedGrant(null)
    setCurrentPage('dashboard')
  }

  const handleSignOut = () => {
    window.location.href = window.location.pathname // Reload without demo param
  }

  const handleGrantStatusChange = (grantId: number, newStatus: string) => {
    console.log(`Demo: Grant ${grantId} status changed to ${newStatus}`)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <GrantDiscoveryDashboard onGrantClick={handleGrantClick} />
      
      case 'discovery':
        return <EnhancedGrantDiscoveryDashboard />
      
      case 'my-grants':
        return <MyGrantsWorkspace onGrantClick={handleGrantClick} />
      
      case 'document-bank':
        return <DocumentManager grantId={selectedGrant?.id || 0} />
      
      case 'analytics':
        return <AnalyticsDashboard />
      
      case 'profile':
        return <ProfileSettings />
      
      case 'grant-detail':
        return selectedGrant ? (
          <GrantDetailPage
            grant={selectedGrant}
            onBack={handleBackToDashboard}
            onStatusChange={handleGrantStatusChange}
          />
        ) : (
          <GrantDiscoveryDashboard onGrantClick={handleGrantClick} />
        )
      
      default:
        return <GrantDiscoveryDashboard onGrantClick={handleGrantClick} />
    }
  }

  return (
    <ErrorBoundary>
      <Layout
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSignOut={handleSignOut}
      >
        {renderCurrentPage()}
      </Layout>
    </ErrorBoundary>
  )
}

function App() {
  // Always initialize hooks first to comply with rules of hooks
  const [appState, setAppState] = useState<AppState>('loading')
  const [currentPage, setCurrentPage] = useState<CurrentPage>('dashboard')
  const [user, setUser] = useState<User | null>(null)
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  
  // Check for demo mode after hooks are initialized
  const urlParams = new URLSearchParams(window.location.search)
  const isDemoMode = urlParams.get('demo') === 'true'
  
  // Return demo app if in demo mode
  if (isDemoMode) {
    console.log('Demo mode detected - rendering demo app')
    return <DemoApp />
  }
  
  // Debug logging for state changes
  useEffect(() => {
    console.log('App state changed to:', appState)
  }, [appState])

  useEffect(() => {
    console.log('User changed to:', user)
  }, [user])

  useEffect(() => {
    checkAuthState()
    
    // Add a timeout fallback in case auth check hangs
    const timeoutId = setTimeout(() => {
      if (appState === 'loading') {
        console.warn('Auth check timed out, showing auth page')
        setAppState('auth')
      }
    }, 3000) // Reduced to 3 seconds
    
    // Skip auth listener in demo mode - just use timeout cleanup
    return () => {
      clearTimeout(timeoutId)
    }
  }, [])

  const checkAuthState = async () => {
    try {
      // For demo purposes, simulate a successful auth with demo user
      console.log('Demo mode: Simulating successful authentication')
      setUser({ id: 'demo-user-123', email: 'demo@shadowgoose.com' })
      
      // Skip profile check and go straight to app
      setAppState('app')
    } catch (error) {
      console.error('Error in demo auth:', error)
      // Fallback to app state anyway
      setUser({ id: 'demo-user-123', email: 'demo@shadowgoose.com' })
      setAppState('app')
    }
  }

  const checkProfile = async (userId: string) => {
    try {
      // For demo purposes, simulate existing profile
      console.log('Demo mode: Simulating existing profile for user:', userId)
      setAppState('app')
    } catch (error) {
      console.error('Error checking profile:', error)
      setAppState('app') // Go to app anyway in demo mode
    }
  }

  const handleAuthSuccess = () => {
    // Auth state change will be handled by the listener
  }

  const handleOnboardingComplete = () => {
    setAppState('app')
    // Refetch profile after onboarding
    if (user) {
      checkProfile(user.id)
    }
  }

  const handleSignOut = () => {
    setAppState('auth')
    setCurrentPage('dashboard')
    setSelectedGrant(null)
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page as CurrentPage)
    if (page !== 'grant-detail') {
      setSelectedGrant(null)
    }
  }

  const handleGrantClick = (grant: Grant) => {
    setSelectedGrant(grant)
    setCurrentPage('grant-detail')
  }

  const handleBackToDashboard = () => {
    setSelectedGrant(null)
    setCurrentPage('dashboard')
  }

  const handleGrantStatusChange = (grantId: number, newStatus: string) => {
    // This could be used to update local state if needed
    console.log(`Grant ${grantId} status changed to ${newStatus}`)
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <GrantDiscoveryDashboard onGrantClick={handleGrantClick} />
      
      case 'discovery':
        return <EnhancedGrantDiscoveryDashboard />
      
      case 'my-grants':
        return <MyGrantsWorkspace onGrantClick={handleGrantClick} />
      
      case 'document-bank':
        return <DocumentManager grantId={selectedGrant?.id || 0} />
      
      case 'analytics':
        return <AnalyticsDashboard />
      
      case 'profile':
        return <ProfileSettings />
      
      case 'grant-detail':
        return selectedGrant ? (
          <GrantDetailPage
            grant={selectedGrant}
            onBack={handleBackToDashboard}
            onStatusChange={handleGrantStatusChange}
          />
        ) : (
          <GrantDiscoveryDashboard onGrantClick={handleGrantClick} />
        )
      
      default:
        return <EnhancedGrantDiscoveryDashboard />
    }
  }



  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading Grant Discovery...</h2>
          <p className="mt-2 text-gray-600">Please wait while we set up your workspace</p>
        </div>
      </div>
    )
  }

  // Authentication state
  if (appState === 'auth') {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />
  }

  // Onboarding state
  if (appState === 'onboarding') {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  // Main application state
  return (
    <ErrorBoundary>
      <Layout
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onSignOut={handleSignOut}
      >
        {renderCurrentPage()}
      </Layout>
    </ErrorBoundary>
  )
}

export default App
