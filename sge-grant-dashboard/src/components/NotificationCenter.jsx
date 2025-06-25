import React, { useState, useEffect } from 'react';
import './NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Advanced filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('unread_first');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pinnedNotifications, setPinnedNotifications] = useState(new Set());
  const [savedFilters, setSavedFilters] = useState([]);
  const [suggestedFilters, setSuggestedFilters] = useState([]);

  // Available filter options
  const availableTags = ['urgent', 'deadline', 'new_grant', 'system', 'test', 'daily_summary'];
  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Past 7 Days' },
    { value: 'month', label: 'Past 30 Days' },
    { value: 'custom', label: 'Custom Range' }
  ];
  const sortOptions = [
    { value: 'unread_first', label: 'Unread First' },
    { value: 'priority', label: 'Priority' },
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'pinned_first', label: 'Pinned First' }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      loadUserPreferences();
      generateSuggestedFilters();
    }
  }, [isOpen]);

  useEffect(() => {
    // Save user preferences when filters change
    if (isOpen) {
      saveUserPreferences();
    }
  }, [searchTerm, selectedTags, dateRange, sortBy]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = () => {
    try {
      const saved = localStorage.getItem('notificationPreferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        setSearchTerm(prefs.searchTerm || '');
        setSelectedTags(prefs.selectedTags || []);
        setDateRange(prefs.dateRange || 'all');
        setSortBy(prefs.sortBy || 'unread_first');
        setPinnedNotifications(new Set(prefs.pinnedNotifications || []));
        setSavedFilters(prefs.savedFilters || []);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const saveUserPreferences = () => {
    try {
      const prefs = {
        searchTerm,
        selectedTags,
        dateRange,
        sortBy,
        pinnedNotifications: Array.from(pinnedNotifications),
        savedFilters
      };
      localStorage.setItem('notificationPreferences', JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const generateSuggestedFilters = () => {
    // Analyze user behavior and suggest filters
    const suggestions = [];
    
    // If user frequently clicks urgent notifications
    if (notifications.filter(n => n.urgency === 'urgent').length > 0) {
      suggestions.push({
        name: 'Urgent Only',
        tags: ['urgent'],
        dateRange: 'week',
        description: 'Show only urgent notifications from the past week'
      });
    }

    // If there are many deadline notifications
    if (notifications.filter(n => n.type === 'deadline_alert').length > 2) {
      suggestions.push({
        name: 'Upcoming Deadlines',
        tags: ['deadline_alert'],
        sortBy: 'priority',
        description: 'Show deadline alerts sorted by priority'
      });
    }

    // If there are unread notifications
    if (unreadCount > 3) {
      suggestions.push({
        name: 'Catch Up',
        sortBy: 'unread_first',
        dateRange: 'week',
        description: 'Focus on unread notifications from this week'
      });
    }

    setSuggestedFilters(suggestions);
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const togglePin = (notificationId) => {
    setPinnedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setDateRange('all');
    setSortBy('unread_first');
  };

  const saveCurrentFilter = () => {
    const filterName = prompt('Enter a name for this filter:');
    if (filterName) {
      const newFilter = {
        id: Date.now().toString(),
        name: filterName,
        searchTerm,
        selectedTags,
        dateRange,
        sortBy,
        createdAt: new Date().toISOString()
      };
      setSavedFilters(prev => [...prev, newFilter]);
    }
  };

  const applySavedFilter = (filter) => {
    setSearchTerm(filter.searchTerm || '');
    setSelectedTags(filter.selectedTags || []);
    setDateRange(filter.dateRange || 'all');
    setSortBy(filter.sortBy || 'unread_first');
  };

  const applySuggestedFilter = (suggestion) => {
    setSelectedTags(suggestion.tags || []);
    setDateRange(suggestion.dateRange || 'all');
    setSortBy(suggestion.sortBy || 'unread_first');
  };

  const deleteSavedFilter = (filterId) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
  };

  // Filter and sort notifications
  const getFilteredNotifications = () => {
    let filtered = [...notifications];

    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        notification.type.toLowerCase().includes(searchLower) ||
        (notification.grantTitle && notification.grantTitle.toLowerCase().includes(searchLower))
      );
    }

    // Tag filtering
    if (selectedTags.length > 0) {
      filtered = filtered.filter(notification =>
        selectedTags.includes(notification.urgency) ||
        selectedTags.includes(notification.type)
      );
    }

    // Date range filtering
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setDate(now.getDate() - 30);
          break;
      }
      
      filtered = filtered.filter(notification => 
        new Date(notification.timestamp) >= filterDate
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      // Always sort pinned notifications first if that's the sort option
      if (sortBy === 'pinned_first') {
        const aPinned = pinnedNotifications.has(a.id);
        const bPinned = pinnedNotifications.has(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
      }

      switch (sortBy) {
        case 'unread_first':
          if (!a.read && b.read) return -1;
          if (a.read && !b.read) return 1;
          return new Date(b.timestamp) - new Date(a.timestamp);
        
        case 'priority':
          const priorityOrder = { urgent: 3, warning: 2, info: 1 };
          const aPriority = priorityOrder[a.urgency] || 0;
          const bPriority = priorityOrder[b.urgency] || 0;
          if (aPriority !== bPriority) return bPriority - aPriority;
          return new Date(b.timestamp) - new Date(a.timestamp);
        
        case 'recent':
          return new Date(b.timestamp) - new Date(a.timestamp);
        
        case 'oldest':
          return new Date(a.timestamp) - new Date(b.timestamp);
        
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  const testNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST'
      });
      
      if (response.ok) {
        setTimeout(fetchNotifications, 1000);
      }
    } catch (error) {
      console.error('Error testing notifications:', error);
    }
  };

  const testDiverseNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/test-diverse', {
        method: 'POST'
      });
      
      if (response.ok) {
        setTimeout(fetchNotifications, 1000);
      }
    } catch (error) {
      console.error('Error testing diverse notifications:', error);
    }
  };

  const checkDeadlines = async () => {
    try {
      const response = await fetch('/api/notifications/check-deadlines', {
        method: 'POST'
      });
      
      if (response.ok) {
        setTimeout(fetchNotifications, 1000);
      }
    } catch (error) {
      console.error('Error checking deadlines:', error);
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'deadline_alert': return '📅';
      case 'overdue_alert': return '🔴';
      case 'new_grant': return '🆕';
      case 'daily_summary': return '📊';
      case 'system': return '🔔';
      default: return '💡';
    }
  };

  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'urgent';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-overlay">
      <div className="notification-center">
        {/* Header */}
        <div className="notification-header">
          <div className="header-content">
            <h2>🔔 Notifications</h2>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="notification-search">
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          <button 
            className={`advanced-toggle ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            ⚙️
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="advanced-filters">
            {/* Tag Filters */}
            <div className="filter-section">
              <label>Filter by Type:</label>
              <div className="tag-filters">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-filter ${selectedTags.includes(tag) ? 'active' : ''}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="filter-section">
              <label>Date Range:</label>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)}
                className="date-range-select"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="filter-section">
              <label>Sort by:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Actions */}
            <div className="filter-actions">
              <button className="btn btn-outline btn-sm" onClick={clearAllFilters}>
                Clear All
              </button>
              <button className="btn btn-outline btn-sm" onClick={saveCurrentFilter}>
                💾 Save Filter
              </button>
            </div>
          </div>
        )}

        {/* Suggested Filters */}
        {suggestedFilters.length > 0 && (
          <div className="suggested-filters">
            <h4>💡 Suggested:</h4>
            <div className="suggestion-buttons">
              {suggestedFilters.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => applySuggestedFilter(suggestion)}
                  title={suggestion.description}
                >
                  {suggestion.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Saved Filters */}
        {savedFilters.length > 0 && (
          <div className="saved-filters">
            <h4>📁 Saved Filters:</h4>
            <div className="saved-filter-list">
              {savedFilters.map(filter => (
                <div key={filter.id} className="saved-filter-item">
                  <button
                    className="saved-filter-btn"
                    onClick={() => applySavedFilter(filter)}
                  >
                    {filter.name}
                  </button>
                  <button
                    className="delete-filter-btn"
                    onClick={() => deleteSavedFilter(filter.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="notification-controls">
          <div className="results-info">
            <span>
              {filteredNotifications.length} of {notifications.length} notifications
              {searchTerm && ` matching "${searchTerm}"`}
            </span>
          </div>
          
          <div className="action-buttons">
            {unreadCount > 0 && (
              <button className="btn btn-outline btn-sm" onClick={markAllAsRead}>
                Mark All Read
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={fetchNotifications}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Test Controls (Development) */}
        <div className="test-controls">
          <button className="btn btn-outline btn-xs" onClick={testNotifications}>
            🧪 Test
          </button>
          <button className="btn btn-outline btn-xs" onClick={testDiverseNotifications}>
            🎨 Diverse Test
          </button>
          <button className="btn btn-outline btn-xs" onClick={checkDeadlines}>
            ⏰ Check Deadlines
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔔</div>
              <h3>No notifications found</h3>
              <p>
                {searchTerm || selectedTags.length > 0 || dateRange !== 'all'
                  ? "No notifications match your current filters."
                  : "You're all caught up! No notifications to show."
                }
              </p>
              {(searchTerm || selectedTags.length > 0 || dateRange !== 'all') && (
                <button className="btn btn-outline btn-sm" onClick={clearAllFilters}>
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`notification-item ${getUrgencyClass(notification.urgency)} ${notification.read ? 'read' : 'unread'} ${pinnedNotifications.has(notification.id) ? 'pinned' : ''}`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification)}
                </div>
                
                <div className="notification-content">
                  <div className="notification-title">
                    {pinnedNotifications.has(notification.id) && <span className="pin-icon">📌</span>}
                    {notification.title}
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                  
                  <div className="notification-message">
                    {notification.message}
                  </div>
                  
                  {notification.grantTitle && (
                    <div className="notification-grant">
                      Grant: {notification.grantTitle}
                    </div>
                  )}
                  
                  <div className="notification-meta">
                    <span className="notification-time">{notification.timeAgo}</span>
                    <span className="notification-type">{notification.type.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="notification-actions">
                  <button
                    className={`pin-btn ${pinnedNotifications.has(notification.id) ? 'pinned' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(notification.id);
                    }}
                    title={pinnedNotifications.has(notification.id) ? 'Unpin' : 'Pin'}
                  >
                    📌
                  </button>
                  
                  {notification.urgency === 'urgent' && (
                    <div className="urgency-indicator">
                      🚨
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="notification-footer">
          <p>Notifications are checked automatically every hour</p>
          <button className="btn btn-link btn-sm">
            Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter; 