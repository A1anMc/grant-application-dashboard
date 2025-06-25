import React from 'react';
import './GrantCard.css';

const GrantCard = ({ grant }) => {
  const formatAmount = (amount) => {
    if (!amount) return 'Amount TBD';
    if (typeof amount === 'string' && amount.includes('$')) return amount;
    if (typeof amount === 'number') return `$${amount.toLocaleString()}`;
    return amount;
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return 'No deadline';
    try {
      const date = new Date(deadline);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return deadline;
    }
  };

  const getDeadlineStatus = (deadline) => {
    if (!deadline) return 'none';
    try {
      const date = new Date(deadline);
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return 'expired';
      if (diffDays <= 7) return 'urgent';
      if (diffDays <= 30) return 'soon';
      return 'normal';
    } catch {
      return 'normal';
    }
  };

  const getEligibilityText = (eligibility) => {
    if (!eligibility) return 'Eligibility TBD';
    if (typeof eligibility === 'object') {
      return eligibility.assessment || eligibility.summary || 'Check requirements';
    }
    return eligibility;
  };

  const deadlineStatus = getDeadlineStatus(grant.deadline || grant.due_date);
  const eligibilityText = getEligibilityText(grant.eligibility);

  return (
    <div className="grant-card">
      <div className="grant-card-header">
        <div className="grant-title-section">
          <h3 className="grant-title">{grant.name || grant.title}</h3>
          <div className="grant-meta">
            <span className="grant-source">{grant.funder || grant.source || 'Unknown Source'}</span>
            {grant.source_verified && (
              <span className="verified-badge">✓ Verified</span>
            )}
          </div>
        </div>
        <div className="grant-amount">
          {formatAmount(grant.amount || grant.amount_string)}
        </div>
      </div>

      <div className="grant-card-body">
        <p className="grant-description">
          {grant.description || grant.summary || 'No description available'}
        </p>

        <div className="grant-details">
          <div className="grant-detail-item">
            <span className="detail-label">Deadline:</span>
            <span className={`detail-value deadline-${deadlineStatus}`}>
              {formatDeadline(grant.deadline || grant.due_date)}
            </span>
          </div>

          <div className="grant-detail-item">
            <span className="detail-label">Category:</span>
            <span className="detail-value">
              {grant.category || grant.type || 'General'}
            </span>
          </div>

          <div className="grant-detail-item eligibility-item">
            <span className="detail-label">Eligibility:</span>
            <span className="detail-value eligibility-text">
              {eligibilityText}
            </span>
          </div>
        </div>

        {grant.tags && grant.tags.length > 0 && (
          <div className="grant-tags">
            {grant.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="grant-tag">
                {tag}
              </span>
            ))}
            {grant.tags.length > 3 && (
              <span className="grant-tag-more">
                +{grant.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grant-card-footer">
        <div className="grant-actions">
          <button className="btn btn-outline btn-sm">
            <span>📋</span>
            Details
          </button>
          <button className="btn btn-primary btn-sm">
            <span>💾</span>
            Save
          </button>
        </div>
        
        {deadlineStatus === 'urgent' && (
          <div className="urgency-indicator">
            <span className="urgency-icon">⚠️</span>
            <span className="urgency-text">Urgent</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantCard; 