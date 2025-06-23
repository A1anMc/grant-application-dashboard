import { NavLink } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-brand">
          <div className="logo-container">
            <img src="/goose-icon.svg" alt="Shadow Goose" className="goose-logo" />
            <div className="logo-text">
              <h1 className="logo">SHADOW GOOSE</h1>
              <span className="logo-subtitle">ENTERTAINMENT</span>
            </div>
          </div>
        </div>
        
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Overview</span>
          </NavLink>
          <NavLink to="/grants" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📋</span>
            <span className="nav-text">Grants</span>
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">📊</span>
            <span className="nav-text">Analytics</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </NavLink>
        </div>
        
        <div className="navbar-actions">
          <button className="action-btn" title="Refresh Data">
            🔄
          </button>
          <button className="action-btn" title="Notifications">
            🔔
          </button>
        </div>
      </div>
    </nav>
  )
} 