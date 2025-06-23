import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
  currentPage: string
  onPageChange: (page: string) => void
  onSignOut: () => void
}

interface User {
  id: string
  email: string
}

interface OrganizationProfile {
  organization_name: string
  abn: string
  website: string
  dgr_status: boolean
  charity_status: boolean
  organization_type: string
  primary_focus_areas: string
  organization_history: string
}

export default function Layout({ children, currentPage, onPageChange, onSignOut }: LayoutProps) {
  // Demo mode - use static data
  const user: User = { id: 'demo-user-123', email: 'demo@shadowgoose.com' }
  const profile: OrganizationProfile = {
    organization_name: 'Shadow Goose Productions',
    abn: '12345678901',
    website: 'https://shadowgoose.com',
    dgr_status: true,
    charity_status: false,
    organization_type: 'Arts & Culture',
    primary_focus_areas: 'Documentary Production, First Nations Partnerships',
    organization_history: 'Established documentary production company with strong First Nations partnerships'
  }
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = () => {
    onSignOut()
  }

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'discovery', label: 'Grant Discovery', icon: '🇦🇺' },
    { id: 'my-grants', label: 'My Grants', icon: '📋' },
    { id: 'document-bank', label: 'Document Bank', icon: '📁' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ]

  // Remove loading state in demo mode

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">
                  Grant Discovery
                </h1>
              </div>
              
              <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`
                      inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
                      ${currentPage === item.id
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }
                    `}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                                      <span className="text-gray-600 font-medium">
                    {user.email[0].toUpperCase()}
                  </span>
                  </div>
                  <span className="ml-2 text-gray-700 hidden sm:block">
                    {profile.organization_name || user.email || 'User'}
                  </span>
                  <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{profile.organization_name || 'Organization'}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          onPageChange('profile')
                          setShowUserMenu(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile & Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map(item => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`
                  block w-full text-left pl-3 pr-4 py-2 border-l-4 text-base font-medium
                  ${currentPage === item.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
} 