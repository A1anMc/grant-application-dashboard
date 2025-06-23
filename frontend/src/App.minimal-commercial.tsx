import { useState } from 'react'
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
}

type CurrentPage = 'dashboard' | 'discovery' | 'my-grants' | 'document-bank' | 'analytics' | 'profile'

function MinimalCommercialApp() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('dashboard')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'discovery', label: 'Grant Discovery', icon: '🔍' },
    { id: 'my-grants', label: 'My Grants', icon: '📋' },
    { id: 'document-bank', label: 'Document Bank', icon: '📁' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ]

  const mockGrants: Grant[] = [
    {
      id: 1,
      name: 'First Nations Arts & Culture Program',
      funder: 'Creative Australia',
      description: 'Supporting First Nations arts and cultural projects with established partnerships',
      amount_string: '$10,000 - $150,000',
      due_date: '2025-07-15',
      status: 'DIRECTLY ELIGIBLE - Strong First Nations partnership advantage',
      source_url: 'https://creative.gov.au/first-nations-arts'
    },
    {
      id: 2,
      name: 'Documentary Producer Program',
      funder: 'Screen Australia',
      description: 'Development funding for documentary projects',
      amount_string: '$20,000 - $500,000',
      due_date: '2025-08-30',
      status: 'ELIGIBLE',
      source_url: 'https://screenaustralia.gov.au/funding'
    },
    {
      id: 3,
      name: 'Youth Arts Development Program',
      funder: 'Australia Council',
      description: 'Supporting youth-focused arts initiatives',
      amount_string: '$8,000 - $40,000',
      due_date: '2025-07-31',
      status: 'ELIGIBLE',
      source_url: 'https://australiacouncil.gov.au/funding'
    }
  ]

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Welcome to Shadow Goose Grant Portal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Active Applications</h3>
                  <p className="text-3xl font-bold text-blue-600">3</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Success Rate</h3>
                  <p className="text-3xl font-bold text-green-600">75%</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Total Funding</h3>
                  <p className="text-3xl font-bold text-purple-600">$450K</p>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'discovery':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Grant Discovery</h2>
              <div className="space-y-4">
                {mockGrants.map(grant => (
                  <div key={grant.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{grant.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        grant.status.includes('DIRECTLY ELIGIBLE') 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {grant.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{grant.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Funder:</span>
                        <p className="text-gray-600">{grant.funder}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Amount:</span>
                        <p className="text-gray-600">{grant.amount_string}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Due Date:</span>
                        <p className="text-gray-600">{grant.due_date}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        View Details
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Start Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'my-grants':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Grant Applications</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">First Nations Arts & Culture Program</h3>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      IN PROGRESS
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">Application for documentary project with First Nations partnership</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Amount Requested:</span>
                      <p className="text-gray-600">$75,000</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Submission Due:</span>
                      <p className="text-gray-600">2025-07-15</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'document-bank':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Bank</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Organization Profile', type: 'PDF', updated: '2024-01-15' },
                  { name: 'Financial Statements', type: 'PDF', updated: '2024-01-10' },
                  { name: 'Project Budget Template', type: 'Excel', updated: '2024-01-08' },
                  { name: 'Letters of Support', type: 'PDF', updated: '2024-01-05' },
                  { name: 'Team CVs', type: 'PDF', updated: '2024-01-03' },
                  { name: 'Project Timeline', type: 'PDF', updated: '2024-01-01' }
                ].map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-semibold">📄</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{doc.name}</h3>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">Updated {doc.updated}</p>
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Total Applications</h3>
                  <p className="text-3xl font-bold text-blue-600">12</p>
                  <p className="text-sm text-blue-600">+3 this month</p>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-green-900 mb-2">Success Rate</h3>
                  <p className="text-3xl font-bold text-green-600">75%</p>
                  <p className="text-sm text-green-600">Above average</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-900 mb-2">Total Funding</h3>
                  <p className="text-3xl font-bold text-purple-600">$450K</p>
                  <p className="text-sm text-purple-600">Secured</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-sm font-medium text-orange-900 mb-2">Avg. Time</h3>
                  <p className="text-3xl font-bold text-orange-600">45</p>
                  <p className="text-sm text-orange-600">Days to approval</p>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600">This feature is under development.</p>
          </div>
        )
    }
  }

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
                  <span className="text-white font-bold text-lg">SG</span>
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">
                  Shadow Goose Grant Portal
                </h1>
              </div>
              
              <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id as CurrentPage)}
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
                    <span className="text-gray-600 font-medium">D</span>
                  </div>
                  <span className="ml-2 text-gray-700 hidden sm:block">
                    Shadow Goose Productions
                  </span>
                  <svg className="ml-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">Shadow Goose Productions</div>
                        <div className="text-xs text-gray-500">demo@shadowgoose.com</div>
                      </div>
                      <button
                        onClick={() => {
                          setCurrentPage('profile')
                          setShowUserMenu(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile & Settings
                      </button>
                      <button
                        onClick={() => window.location.reload()}
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
                onClick={() => setCurrentPage(item.id as CurrentPage)}
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
        {renderCurrentPage()}
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

export default MinimalCommercialApp 