import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/dashboard');
      if (response.data.success) {
        setAnalytics(response.data.analytics);
      } else {
        setError('Failed to load analytics');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type, format) => {
    try {
      setExportLoading(true);
      const response = await api.get(`/analytics/export?type=${type}&format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_export.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${type}_export.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📊';
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'success': return '#48bb78';
      case 'warning': return '#ed8936';
      case 'info': return '#4299e1';
      default: return '#718096';
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <h2>Error Loading Analytics</h2>
        <p>{error}</p>
        <button onClick={fetchAnalytics} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-error">
        <h2>No Analytics Data</h2>
        <p>Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <h1>📈 Analytics Dashboard</h1>
          <p>Comprehensive insights into your grant management performance</p>
        </div>
        <div className="header-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <div className="export-dropdown">
            <button className="export-btn" disabled={exportLoading}>
              {exportLoading ? '⏳' : '📤'} Export
            </button>
            <div className="export-menu">
              <button onClick={() => handleExport('grants', 'csv')}>
                Grants (CSV)
              </button>
              <button onClick={() => handleExport('grants', 'json')}>
                Grants (JSON)
              </button>
              <button onClick={() => handleExport('tasks', 'csv')}>
                Tasks (CSV)
              </button>
              <button onClick={() => handleExport('tasks', 'json')}>
                Tasks (JSON)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>{analytics.overview.totalGrants}</h3>
            <p>Total Grants</p>
            <span className="metric-change">+{analytics.overview.eligibleGrants} eligible</span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <h3>{analytics.overview.winRate}%</h3>
            <p>Win Rate</p>
            <span className="metric-change">{analytics.overview.wonGrants} won</span>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>${(analytics.overview.totalValue / 1000).toFixed(0)}K</h3>
            <p>Total Value</p>
            <span className="metric-change">
              Avg: ${(analytics.overview.avgGrantValue / 1000).toFixed(0)}K
            </span>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">📋</div>
          <div className="metric-content">
            <h3>{analytics.overview.completedTasks}</h3>
            <p>Tasks Completed</p>
            <span className="metric-change">
              {analytics.overview.overdueTasks} overdue
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>Monthly Performance Trends</h2>
          <div className="chart-legend">
            <span className="legend-item">
              <div className="legend-color applications"></div>
              Applications
            </span>
            <span className="legend-item">
              <div className="legend-color success"></div>
              Success
            </span>
            <span className="legend-item">
              <div className="legend-color value"></div>
              Value ($K)
            </span>
          </div>
        </div>
        <div className="chart-container">
          <div className="chart-bars">
            {analytics.monthlyTrends.map((month, index) => (
              <div key={index} className="month-group">
                <div className="bars">
                  <div 
                    className="bar applications"
                    style={{ height: `${(month.applications / 10) * 100}%` }}
                    title={`${month.applications} applications`}
                  ></div>
                  <div 
                    className="bar success"
                    style={{ height: `${(month.success / 10) * 100}%` }}
                    title={`${month.success} successful`}
                  ></div>
                  <div 
                    className="bar value"
                    style={{ height: `${(month.value / 150000) * 100}%` }}
                    title={`$${(month.value / 1000).toFixed(0)}K value`}
                  ></div>
                </div>
                <span className="month-label">{month.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="insights-section">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          {analytics.insights.map((insight, index) => (
            <div 
              key={index} 
              className={`insight-card ${insight.type}`}
              style={{ borderLeftColor: getInsightColor(insight.type) }}
            >
              <div className="insight-header">
                <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                <h3>{insight.title}</h3>
                <span className={`priority-badge ${insight.priority}`}>
                  {insight.priority}
                </span>
              </div>
              <p>{insight.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="deadlines-section">
        <h2>Upcoming Deadlines</h2>
        <div className="deadlines-list">
          {analytics.upcomingDeadlines.length > 0 ? (
            analytics.upcomingDeadlines.map((deadline, index) => (
              <div key={index} className="deadline-card">
                <div className="deadline-info">
                  <h3>{deadline.title}</h3>
                  <p className="deadline-funder">🏛️ {deadline.funder}</p>
                  <p className="deadline-amount">💰 {deadline.amount}</p>
                </div>
                <div className="deadline-timing">
                  <div className={`days-remaining ${deadline.daysUntilDue <= 7 ? 'urgent' : deadline.daysUntilDue <= 14 ? 'warning' : 'normal'}`}>
                    {deadline.daysUntilDue} days
                  </div>
                  <p className="due-date">Due: {new Date(deadline.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-deadlines">
              <p>No upcoming deadlines in the next 30 days</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance by Category */}
      <div className="categories-section">
        <h2>Performance by Category</h2>
        <div className="categories-grid">
          {analytics.categoryPerformance.map((category, index) => (
            <div key={index} className="category-card">
              <div className="category-header">
                <h3>{category.category}</h3>
                <span className="success-rate">{category.successRate}% success</span>
              </div>
              <div className="category-stats">
                <div className="stat-row">
                  <span>Total:</span>
                  <span>{category.total}</span>
                </div>
                <div className="stat-row">
                  <span>Eligible:</span>
                  <span>{category.eligible}</span>
                </div>
                <div className="stat-row">
                  <span>Submitted:</span>
                  <span>{category.submitted}</span>
                </div>
                <div className="stat-row">
                  <span>Won:</span>
                  <span className="won-count">{category.won}</span>
                </div>
              </div>
              <div className="category-progress">
                <div 
                  className="progress-bar"
                  style={{ width: `${category.successRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Performance */}
      <div className="team-section">
        <h2>Team Performance</h2>
        <div className="team-grid">
          {analytics.teamPerformance.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-header">
                <h3>{member.member}</h3>
                <span className="completion-rate">{member.completionRate}%</span>
              </div>
              <div className="team-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Tasks</span>
                  <span className="stat-value">{member.total}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Completed</span>
                  <span className="stat-value completed">{member.completed}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Overdue</span>
                  <span className="stat-value overdue">{member.overdue}</span>
                </div>
              </div>
              <div className="team-progress">
                <div 
                  className="progress-fill"
                  style={{ width: `${member.completionRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 