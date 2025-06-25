import React from 'react'
import './Settings.css'

const Settings = () => {
  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your grant discovery preferences and account settings</p>
      </div>

      <div className="settings-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">⚙️</div>
          <h2>Settings Coming Soon</h2>
          <p>We're building comprehensive settings to customize your grant discovery experience.</p>
          
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <span>Email notifications for new grants</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Custom eligibility criteria</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span>Deadline reminder preferences</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏷️</span>
              <span>Preferred grant categories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings 