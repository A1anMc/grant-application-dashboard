import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = [
    { id: 'overview', path: '/overview', label: 'Overview', icon: '📊' },
    { id: 'grants', path: '/grants', label: 'Grant Discovery', icon: '🔍' },
    { id: 'workspace', path: '/workspace', label: 'Workspace', icon: '👥' },
    { id: 'documents', path: '/documents', label: 'Document Vault', icon: '📁' },
    { id: 'dashboard', path: '/dashboard', label: 'Analytics', icon: '📈' },
    { id: 'insights', path: '/insights', label: 'Insights', icon: '💡' },
    { id: 'settings', path: '/settings', label: 'Settings', icon: '⚙️' }
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    if (path === '/overview' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand">
          <Link to="/overview" className="brand-logo">
            <img src="/goose-icon.svg" alt="Grant IQ" className="brand-icon" />
            <div className="brand-text">
              <span className="brand-name">Grant IQ</span>
              <span className="brand-tagline">Pro Edition</span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className={`navbar-nav ${isMenuOpen ? 'navbar-nav-open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`nav-item ${isActiveRoute(item.path) ? 'nav-item-active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
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
          
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/grants')}
          >
            <span>➕</span>
            Add Grant
          </button>

          {/* User Menu */}
          <div className="user-menu">
            <button
              className="user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title="User menu"
            >
              <span className="user-avatar">{user?.avatar || '👤'}</span>
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-details">
                    <span className="user-name-full">{user?.name}</span>
                    <span className="user-role">{user?.specialization}</span>
                    <span className="user-email">{user?.email}</span>
                  </div>
                </div>
                <div className="user-actions">
                  <Link to="/settings" className="user-action">
                    ⚙️ Settings
                  </Link>
                  <button onClick={handleLogout} className="user-action logout">
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
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