import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
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
  
  // Debug logging for state changes
  useEffect(() => {
    console.log('App state changed to:', appState)
  }, [appState])

  useEffect(() => {
    console.log('User changed to:', user)
  }, [user])

  useEffect(() => {
    // Check if demo mode is enabled via URL parameter
    const urlParams = new URLSearchParams(window.location.search)
    const isDemoMode = urlParams.get('demo') === 'true'
    
    if (isDemoMode) {
      console.log('Demo mode enabled - bypassing authentication')
      setUser({ id: 'demo-user', email: 'demo@example.com' })
      setAppState('app')
      return // Exit early, don't set up auth listeners
    }
    
    checkAuthState()
    
    // Add a timeout fallback in case auth check hangs
    const timeoutId = setTimeout(() => {
      if (appState === 'loading') {
        console.warn('Auth check timed out, showing auth page')
        setAppState('auth')
      }
    }, 3000) // Reduced to 3 seconds
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (_event === 'SIGNED_IN' && session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' })
        await checkProfile(session.user.id)
      } else if (_event === 'SIGNED_OUT') {
        setUser(null)
        setAppState('auth')
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeoutId)
    }
  }, [])

  const checkAuthState = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Supabase auth error:', error)
        // For demo purposes, show the app even if auth fails
        setAppState('auth')
        return
      }
      
      if (user) {
        setUser({ id: user.id, email: user.email || '' })
        await checkProfile(user.id)
      } else {
        setAppState('auth')
      }
    } catch (error) {
      console.error('Error checking auth state:', error)
      // For demo purposes, show auth page instead of staying in loading
      setAppState('auth')
    }
  }

  const checkProfile = async (userId: string) => {
    try {
      const { data: profileData } = await supabase
        .from('organization_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (profileData) {
        setAppState('app')
      } else {
        setAppState('onboarding')
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      setAppState('onboarding')
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

  // Check for demo mode after all hooks are initialized
  const urlParams = new URLSearchParams(window.location.search)
  const isDemoMode = urlParams.get('demo') === 'true'
  
  if (isDemoMode) {
    console.log('Demo mode detected - rendering demo app')
    return <DemoApp />
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
