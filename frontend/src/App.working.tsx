import { useState } from 'react'
import './App.css'

function WorkingApp() {
  const [currentView, setCurrentView] = useState('welcome')
  
  // Check for demo mode
  const urlParams = new URLSearchParams(window.location.search)
  const isDemoMode = urlParams.get('demo') === 'true'

  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              🎉 Shadow Goose Grant Portal
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Your AI-powered grant discovery and application assistant
            </p>
            <p className="text-sm text-blue-600 font-medium">
              Empowering organizations to find and secure funding opportunities
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-12 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mr-3">LIVE</span>
              System Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-green-600 text-2xl mb-2">⚡</div>
                <div className="text-sm font-medium text-gray-900">React Engine</div>
                <div className="text-xs text-green-600">OPERATIONAL</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-blue-600 text-2xl mb-2">🎯</div>
                <div className="text-sm font-medium text-gray-900">Demo Mode</div>
                <div className="text-xs text-blue-600">{isDemoMode ? 'ENABLED' : 'DISABLED'}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-purple-600 text-2xl mb-2">🌐</div>
                <div className="text-sm font-medium text-gray-900">Server</div>
                <div className="text-xs text-purple-600">ACTIVE</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-orange-600 text-2xl mb-2">🔧</div>
                <div className="text-sm font-medium text-gray-900">Build System</div>
                <div className="text-xs text-orange-600">READY</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Grant Discovery</h3>
                <p className="text-gray-600 mb-6">Find grants that match your organization's mission and eligibility criteria</p>
                <button 
                  onClick={() => setCurrentView('grants')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Explore Grants
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">My Applications</h3>
                <p className="text-gray-600 mb-6">Manage and track your grant applications throughout the process</p>
                <button 
                  onClick={() => setCurrentView('applications')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  View Applications
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Analytics</h3>
                <p className="text-gray-600 mb-6">Track your success metrics and optimize your grant strategy</p>
                <button 
                  onClick={() => setCurrentView('analytics')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-500 mt-12">
            <p className="mb-2">Current time: {new Date().toLocaleString()}</p>
            <p>Demo mode URL: <code className="bg-gray-100 px-2 py-1 rounded">?demo=true</code></p>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'grants') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Professional Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button 
                  onClick={() => setCurrentView('welcome')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg mr-6 transition-colors"
                >
                  ← Back to Home
                </button>
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">SG</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Grant Discovery</h1>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">D</span>
                </div>
                <span className="ml-2 text-gray-700 hidden sm:block">Shadow Goose Productions</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Enhanced Grant Cards */}
            {[
              { 
                name: 'First Nations Arts & Culture Program', 
                funder: 'Creative Australia', 
                amount: '$10,000 - $150,000', 
                due: '2025-07-15',
                status: 'DIRECTLY ELIGIBLE - Strong First Nations partnership advantage',
                description: 'Supporting First Nations arts and cultural projects with established partnerships',
                probability: 'HIGH'
              },
              { 
                name: 'Documentary Producer Program', 
                funder: 'Screen Australia', 
                amount: '$20,000 - $500,000', 
                due: '2025-08-30',
                status: 'ELIGIBLE',
                description: 'Development funding for documentary projects',
                probability: 'MEDIUM'
              },
              { 
                name: 'Youth Arts Development Program', 
                funder: 'Australia Council', 
                amount: '$8,000 - $40,000', 
                due: '2025-07-31',
                status: 'ELIGIBLE',
                description: 'Supporting youth-focused arts initiatives',
                probability: 'MEDIUM'
              }
            ].map((grant, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">{grant.name}</h3>
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      grant.status.includes('DIRECTLY ELIGIBLE') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {grant.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      grant.probability === 'HIGH' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {grant.probability} PROBABILITY
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 text-lg">{grant.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">Funder</span>
                    <p className="text-lg font-semibold text-blue-800">{grant.funder}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-green-900">Amount</span>
                    <p className="text-lg font-semibold text-green-800">{grant.amount}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-orange-900">Due Date</span>
                    <p className="text-lg font-semibold text-orange-800">{grant.due}</p>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                    View Full Details
                  </button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                    Start Application
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                    Save for Later
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (currentView === 'applications') {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button 
                  onClick={() => setCurrentView('welcome')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg mr-6 transition-colors"
                >
                  ← Back to Home
                </button>
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">SG</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">D</span>
                </div>
                <span className="ml-2 text-gray-700 hidden sm:block">Shadow Goose Productions</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-gray-900">First Nations Arts & Culture Program</h3>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  IN PROGRESS
                </span>
              </div>
              <p className="text-gray-600 mb-6">Application for documentary project with First Nations partnership</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-green-900">Amount Requested</span>
                  <p className="text-lg font-semibold text-green-800">$75,000</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-orange-900">Submission Due</span>
                  <p className="text-lg font-semibold text-orange-800">2025-07-15</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Days Remaining</span>
                  <p className="text-lg font-semibold text-blue-800">45 days</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Application Progress</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div className="flex space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold">
                  Continue Application
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (currentView === 'analytics') {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button 
                  onClick={() => setCurrentView('welcome')}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg mr-6 transition-colors"
                >
                  ← Back to Home
                </button>
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">SG</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">D</span>
                </div>
                <span className="ml-2 text-gray-700 hidden sm:block">Shadow Goose Productions</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Total Applications</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">12</p>
                <p className="text-sm text-green-600">+3 this month</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Success Rate</h3>
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-3xl font-bold text-green-600">75%</p>
                <p className="text-sm text-green-600">Above average</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Total Funding</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">$450K</p>
                <p className="text-sm text-purple-600">Secured</p>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">Avg. Time</h3>
                  <span className="text-2xl">⏱️</span>
                </div>
                <p className="text-3xl font-bold text-orange-600">45</p>
                <p className="text-sm text-orange-600">Days to approval</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                  <span className="text-green-600 text-xl">✅</span>
                  <div>
                    <p className="font-medium text-gray-900">Application Approved</p>
                    <p className="text-sm text-gray-600">Youth Arts Development Program - $25,000</p>
                  </div>
                  <span className="text-sm text-gray-500 ml-auto">2 days ago</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 text-xl">📋</span>
                  <div>
                    <p className="font-medium text-gray-900">Application Submitted</p>
                    <p className="text-sm text-gray-600">First Nations Arts & Culture Program</p>
                  </div>
                  <span className="text-sm text-gray-500 ml-auto">1 week ago</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-yellow-50 rounded-lg">
                  <span className="text-yellow-600 text-xl">⏳</span>
                  <div>
                    <p className="font-medium text-gray-900">Review in Progress</p>
                    <p className="text-sm text-gray-600">Documentary Producer Program</p>
                  </div>
                  <span className="text-sm text-gray-500 ml-auto">2 weeks ago</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h1>
        <p className="text-gray-600 mb-6">This feature is under development.</p>
        <button 
          onClick={() => setCurrentView('welcome')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  )
}

export default WorkingApp 