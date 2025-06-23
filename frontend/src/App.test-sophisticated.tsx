import { useState } from 'react'
import EnhancedGrantDiscoveryDashboard from './components/EnhancedGrantDiscoveryDashboard'
import './App.css'

function TestSophisticatedApp() {
  const [currentView, setCurrentView] = useState('enhanced-discovery')

  if (currentView === 'enhanced-discovery') {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">SG</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Enhanced Grant Discovery</h1>
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
          <EnhancedGrantDiscoveryDashboard />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Testing Sophisticated Components</h1>
        <button 
          onClick={() => setCurrentView('enhanced-discovery')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Test Enhanced Discovery
        </button>
      </div>
    </div>
  )
}

export default TestSophisticatedApp 