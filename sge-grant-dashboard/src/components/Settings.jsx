import { useState, useEffect } from 'react'
import './Settings.css'

export default function Settings() {
  const [settings, setSettings] = useState({
    scraperEnabled: true,
    scraperFrequency: 'daily',
    emailNotifications: false,
    apiEndpoint: '/api/grants',
    maxGrantsPerPage: 20,
    autoEligibilityAssessment: true
  })
  const [schedulerStatus, setSchedulerStatus] = useState('unknown')
  const [lastScrape, setLastScrape] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSchedulerStatus()
    fetchLastScrapeTime()
  }, [])

  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/scheduler/status')
      if (response.ok) {
        const data = await response.json()
        setSchedulerStatus(data.status)
      }
    } catch (error) {
      console.error('Error fetching scheduler status:', error)
    }
  }

  const fetchLastScrapeTime = async () => {
    try {
      const response = await fetch('/api/grants?stats=true')
      if (response.ok) {
        const data = await response.json()
        setLastScrape(data.lastUpdated)
      }
    } catch (error) {
      console.error('Error fetching last scrape time:', error)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // In a real app, you'd save these to your backend
      console.log('Saving settings:', settings)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Settings saved successfully!')
    } catch (error) {
      alert('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  const handleManualScrape = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/scraper/run', { method: 'POST' })
      if (response.ok) {
        alert('Manual scrape initiated successfully!')
        fetchLastScrapeTime()
      } else {
        alert('Error initiating manual scrape')
      }
    } catch (error) {
      alert('Error initiating manual scrape')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleScheduler = async () => {
    setLoading(true)
    try {
      const action = schedulerStatus === 'running' ? 'stop' : 'start'
      const response = await fetch(`/api/scheduler/${action}`, { method: 'POST' })
      if (response.ok) {
        fetchSchedulerStatus()
        alert(`Scheduler ${action}ed successfully!`)
      } else {
        alert(`Error ${action}ing scheduler`)
      }
    } catch (error) {
      alert(`Error ${schedulerStatus === 'running' ? 'stopping' : 'starting'} scheduler`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings">
      <h2>Settings</h2>

      <div className="settings-grid">
        <div className="settings-section">
          <h3>Grant Discovery Configuration</h3>
          
          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.scraperEnabled}
                onChange={e => handleSettingChange('scraperEnabled', e.target.checked)}
              />
              Enable Automatic Grant Discovery
            </label>
            <p className="setting-description">
              Automatically scan for new grants from configured sources
            </p>
          </div>

          <div className="setting-item">
            <label>Scraping Frequency:</label>
            <select
              value={settings.scraperFrequency}
              onChange={e => handleSettingChange('scraperFrequency', e.target.value)}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.autoEligibilityAssessment}
                onChange={e => handleSettingChange('autoEligibilityAssessment', e.target.checked)}
              />
              Auto-assess Grant Eligibility
            </label>
            <p className="setting-description">
              Automatically evaluate grant eligibility using AI assessment
            </p>
          </div>
        </div>

        <div className="settings-section">
          <h3>Display Settings</h3>
          
          <div className="setting-item">
            <label>API Endpoint:</label>
            <input
              type="text"
              value={settings.apiEndpoint}
              onChange={e => handleSettingChange('apiEndpoint', e.target.value)}
              placeholder="/api/grants"
            />
          </div>

          <div className="setting-item">
            <label>Grants per Page:</label>
            <select
              value={settings.maxGrantsPerPage}
              onChange={e => handleSettingChange('maxGrantsPerPage', parseInt(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="setting-item">
            <label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={e => handleSettingChange('emailNotifications', e.target.checked)}
              />
              Email Notifications
            </label>
            <p className="setting-description">
              Receive email alerts for new grants and upcoming deadlines
            </p>
          </div>
        </div>

        <div className="settings-section">
          <h3>System Status</h3>
          
          <div className="status-item">
            <span className="status-label">Scheduler Status:</span>
            <span className={`status-value status-${schedulerStatus}`}>
              {schedulerStatus === 'running' ? '🟢 Running' : 
               schedulerStatus === 'stopped' ? '🔴 Stopped' : '⚪ Unknown'}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label">Last Scrape:</span>
            <span className="status-value">
              {lastScrape ? new Date(lastScrape).toLocaleString() : 'Never'}
            </span>
          </div>

          <div className="action-buttons">
            <button 
              onClick={handleManualScrape}
              disabled={loading}
              className="action-btn primary"
            >
              {loading ? 'Running...' : 'Run Manual Scrape'}
            </button>
            
            <button 
              onClick={handleToggleScheduler}
              disabled={loading}
              className="action-btn secondary"
            >
              {schedulerStatus === 'running' ? 'Stop Scheduler' : 'Start Scheduler'}
            </button>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button 
          onClick={handleSaveSettings}
          disabled={loading}
          className="save-btn"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
} 