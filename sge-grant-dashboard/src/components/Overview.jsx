import React, { useState, useEffect } from 'react';
import './Overview.css';
import GrantCard from './GrantCard';
import ManualGrantEntry from './ManualGrantEntry';

const Overview = () => {
  const [grants, setGrants] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    discovered: 0,
    manual: 0,
    eligible: 0,
    deadlineSoon: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [insights, setInsights] = useState([])
  const [showManualEntry, setShowManualEntry] = useState(false)

  const fetchGrants = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/grants')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      setGrants(data.grants || [])
      setStats(data.stats || {
        total: 0,
        discovered: 0,
        manual: 0,
        eligible: 0,
        deadlineSoon: 0
      })
    } catch (err) {
      console.error('Error fetching grants:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGrants()
  }, [])

  const handleGrantAdded = () => {
    fetchGrants() // Refresh data
    setShowManualEntry(false)
  }

  if (loading) {
    return (
      <div className="overview-loading">
        <div className="loading-spinner"></div>
        <p>Loading grant data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="overview-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Data</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchGrants}>
          Try Again
        </button>
      </div>
    )
  }

  const recentGrants = grants.slice(0, 6)

  return (
    <div className="overview">
      {/* Hero Section */}
      <div className="overview-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Grant Discovery Dashboard
          </h1>
          <p className="hero-subtitle">
            Discover and manage funding opportunities for your creative projects
          </p>
          <div className="hero-actions">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => setShowManualEntry(true)}
            >
              <span>➕</span>
              Add New Grant
            </button>
            <button className="btn btn-outline btn-lg">
              <span>🔍</span>
              Discover Grants
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Grants</div>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{stats.eligible}</div>
            <div className="stat-label">Eligible</div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-number">{stats.deadlineSoon}</div>
            <div className="stat-label">Deadline Soon</div>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <div className="stat-number">{stats.discovered}</div>
            <div className="stat-label">AI Discovered</div>
          </div>
        </div>
      </div>

      {/* Recent Grants Section */}
      <div className="recent-grants-section">
        <div className="section-header">
          <h2>Recent Opportunities</h2>
          <p>Latest grants and funding opportunities</p>
        </div>
        
        {recentGrants.length > 0 ? (
          <div className="grants-grid">
            {recentGrants.map((grant) => (
              <GrantCard key={grant.id} grant={grant} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Grants Found</h3>
            <p>Start by adding some grants manually or run the discovery tool.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowManualEntry(true)}
            >
              Add Your First Grant
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card">
            <div className="action-icon">🔍</div>
            <div className="action-content">
              <h4>Run Discovery</h4>
              <p>Find new grants automatically</p>
            </div>
          </button>
          
          <button className="action-card">
            <div className="action-icon">📊</div>
            <div className="action-content">
              <h4>View Analytics</h4>
              <p>See detailed statistics</p>
            </div>
          </button>
          
          <button className="action-card">
            <div className="action-icon">📋</div>
            <div className="action-content">
              <h4>Export Data</h4>
              <p>Download grant information</p>
            </div>
          </button>
          
          <button className="action-card">
            <div className="action-icon">⚙️</div>
            <div className="action-content">
              <h4>Settings</h4>
              <p>Configure preferences</p>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Grant Entry Modal */}
      {showManualEntry && (
        <ManualGrantEntry
          onClose={() => setShowManualEntry(false)}
          onGrantAdded={handleGrantAdded}
        />
      )}
    </div>
  )
}

export default Overview 