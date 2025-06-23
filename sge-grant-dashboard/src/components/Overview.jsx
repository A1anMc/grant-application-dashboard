import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchGrants } from '../utils/api'
import ConnectionTest from './ConnectionTest'
import CollageHeaderBanner from './CollageHeaderBanner'
import InsightsWidget from './InsightsWidget'
import GrantCard from './GrantCard'
import './Overview.css'

export default function Overview() {
  const [stats, setStats] = useState({
    totalGrants: 0,
    activeGrants: 0,
    upcomingDeadlines: 0,
    totalValue: 0
  })
  const [recentGrants, setRecentGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [insights, setInsights] = useState([])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching dashboard data...');
        const grants = await fetchGrants();
        console.log('Received grants for dashboard:', grants);
        
        // Handle both array and object responses
        const grantsData = Array.isArray(grants) ? grants : (grants.grants || grants.data || []);
        
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        const stats = {
          totalGrants: grantsData.length,
          activeGrants: grantsData.filter(g => new Date(g.deadline || g.due_date) > now).length,
          upcomingDeadlines: grantsData.filter(g => {
            const deadline = new Date(g.deadline || g.due_date)
            return deadline > now && deadline <= thirtyDaysFromNow
          }).length,
          totalValue: grantsData.reduce((sum, g) => sum + (parseInt(g.amount?.replace(/[^0-9]/g, '') || g.amount_string?.replace(/[^0-9]/g, '') || '0') || 0), 0)
        }
        
        // Generate insights
        const newInsights = []
        
        // Urgent deadlines
        const urgentGrants = grantsData.filter(g => {
          const deadline = new Date(g.deadline || g.due_date)
          return deadline > now && deadline <= sevenDaysFromNow
        })
        
        if (urgentGrants.length > 0) {
          newInsights.push({
            type: 'urgent',
            title: `${urgentGrants.length} Grant${urgentGrants.length > 1 ? 's' : ''} Closing Soon`,
            description: `Deadline within 7 days - don't miss out!`,
            action: {
              label: 'View Urgent',
              onClick: () => window.location.href = '/grants'
            }
          })
        }
        
        // High value opportunities
        const highValueGrants = grantsData.filter(g => {
          const amount = parseInt(g.amount?.replace(/[^0-9]/g, '') || g.amount_string?.replace(/[^0-9]/g, '') || '0')
          return amount > 50000
        })
        
        if (highValueGrants.length > 0) {
          newInsights.push({
            type: 'opportunity',
            title: `${highValueGrants.length} High-Value Grant${highValueGrants.length > 1 ? 's' : ''}`,
            description: `Grants over $50,000 available`,
            action: {
              label: 'Explore',
              onClick: () => window.location.href = '/grants'
            }
          })
        }
        
        // New grants
        if (grantsData.length > 0) {
          newInsights.push({
            type: 'info',
            title: 'Fresh Opportunities',
            description: `${stats.totalGrants} total grants available for Shadow Goose Entertainment`,
            action: {
              label: 'Browse All',
              onClick: () => window.location.href = '/grants'
            }
          })
        }
        
        setStats(stats)
        setRecentGrants(grantsData.slice(0, 6))
        setInsights(newInsights)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleViewDetails = (grantId) => {
    window.location.href = `/grants/${grantId}`
  }

  const handleFlagGrant = (grantId) => {
    // TODO: Implement flag functionality
    console.log('Flagging grant:', grantId)
  }

  const handleSaveGrant = (grantId) => {
    // TODO: Implement save functionality
    console.log('Saving grant:', grantId)
  }

  if (loading) {
    return (
      <div className="overview-loading">
        <div className="loading-spinner"></div>
        <p>Loading your creative dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="overview">
        <h2>Dashboard Overview</h2>
        <ConnectionTest />
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const bannerStats = [
    { value: stats.totalGrants, label: 'Total Grants' },
    { value: stats.activeGrants, label: 'Active' },
    { value: stats.upcomingDeadlines, label: 'Deadlines Soon' }
  ]

  return (
    <div className="overview">
      {/* Collage Header Banner */}
      <CollageHeaderBanner
        title="Shadow Goose Entertainment"
        subtitle="Grant Discovery Portal"
        stats={bannerStats}
      />
      
      <div className="overview-content">
        <div className="main-content">
          {/* Recent Grants Section */}
          <div className="recent-grants-section">
            <div className="section-header">
              <h3>🎬 Creative Opportunities</h3>
              <Link to="/grants" className="view-all-link">
                View All Grants →
              </Link>
            </div>
            
            {recentGrants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📽️</div>
                <h4>No funding found... yet.</h4>
                <p>Check back soon for new grant opportunities!</p>
              </div>
            ) : (
              <div className="grants-grid">
                {recentGrants.map(grant => (
                  <GrantCard
                    key={grant.id}
                    grant={{
                      id: grant.id,
                      title: grant.name || grant.title,
                      description: grant.description || grant.summary || 'No description available',
                      amount: grant.amount || grant.amount_string || 'TBD',
                      deadline: new Date(grant.deadline || grant.due_date).toLocaleDateString(),
                      category: grant.category || grant.type || 'General',
                      eligibility: grant.eligibility,
                      tags: grant.tags || [],
                      source: grant.funder || 'Unknown',
                      sourceVerified: grant.source_verified || false
                    }}
                    onViewDetails={handleViewDetails}
                    onFlag={handleFlagGrant}
                    onSave={handleSaveGrant}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Sidebar with Insights */}
        <div className="sidebar">
          <InsightsWidget insights={insights} />
          
          {/* Quick Stats */}
          <div className="quick-stats collage-card">
            <h4>📊 Quick Stats</h4>
            <div className="stat-item">
              <span className="stat-label">Total Value</span>
              <span className="stat-value">${stats.totalValue.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Success Rate</span>
              <span className="stat-value">85%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg. Amount</span>
              <span className="stat-value">${stats.totalGrants > 0 ? Math.round(stats.totalValue / stats.totalGrants).toLocaleString() : '0'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 