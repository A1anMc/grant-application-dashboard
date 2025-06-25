import React, { useState, useEffect } from 'react';
import './Navbar.css';
import NotificationCenter from './NotificationCenter';

const Navbar = ({ activeTab, setActiveTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'grants', label: 'Grant Discovery', icon: '🔍' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notification count:', error);
      }
    };

    fetchNotificationCount();
    
    // Refresh notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="brand-logo">
            <img src="/goose-icon.svg" alt="SGE" className="brand-icon" />
            <div className="brand-text">
              <span className="brand-name">Shadow Goose</span>
              <span className="brand-tagline">Grant Discovery Platform</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className={`navbar-nav ${isMenuOpen ? 'navbar-nav-open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setIsMenuOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="navbar-actions">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(true)}
            title="Notifications"
          >
            <span className="notification-icon">🔔</span>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          <button className="btn btn-outline btn-sm">
            <span>📋</span>
            Export
          </button>
          <button className="btn btn-primary btn-sm">
            <span>➕</span>
            Add Grant
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger ${isMenuOpen ? 'hamburger-open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </nav>
  );
};

export default Navbar; 