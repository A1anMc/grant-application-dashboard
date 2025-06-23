import React from 'react';
import './InsightsWidget.css';

const InsightsWidget = ({ insights = [] }) => {
  if (!insights.length) return null;

  return (
    <div className="insights-widget">
      <div className="insights-header">
        <h4>💡 Smart Insights</h4>
        <div className="insights-icon">🎯</div>
      </div>
      
      <div className="insights-list">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-item ${insight.type || 'info'}`}>
            <div className="insight-icon">
              {insight.icon || getInsightIcon(insight.type)}
            </div>
            <div className="insight-content">
              <div className="insight-title">{insight.title}</div>
              <div className="insight-description">{insight.description}</div>
              {insight.action && (
                <button 
                  className="insight-action-btn"
                  onClick={insight.action.onClick}
                >
                  {insight.action.label}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getInsightIcon = (type) => {
  switch (type) {
    case 'urgent':
      return '🚨';
    case 'opportunity':
      return '⭐';
    case 'warning':
      return '⚠️';
    case 'success':
      return '✅';
    default:
      return '💡';
  }
};

export default InsightsWidget; 