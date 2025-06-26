import React, { useState } from 'react';
import './GrantCard.css';

const GrantCard = ({ grant }) => {
  const [showDetails, setShowDetails] = useState(false);

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
      return eligibility.category || eligibility.assessment || eligibility.summary || 'Check requirements';
    }
    return eligibility;
  };

  const getEligibilityDetails = (eligibility) => {
    if (!eligibility || typeof eligibility !== 'object') return null;
    return {
      category: eligibility.category || 'Unknown',
      confidence: eligibility.confidence ? Math.round(eligibility.confidence * 100) : 0,
      reasoning: eligibility.reasoning || 'No reasoning provided'
    };
  };

  const deadlineStatus = getDeadlineStatus(grant.deadline || grant.due_date);
  const eligibilityText = getEligibilityText(grant.eligibility);
  const eligibilityDetails = getEligibilityDetails(grant.eligibility);

  const GrantDetailsModal = () => (
    <div className="grant-details-modal-overlay" onClick={() => setShowDetails(false)}>
      <div className="grant-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{grant.name || grant.title}</h2>
          <button className="modal-close" onClick={() => setShowDetails(false)}>
            ✕
          </button>
        </div>
        
        <div className="modal-content">
          <div className="grant-info-section">
            <h3>Grant Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Funder:</label>
                <span>{grant.funder || grant.source || 'Unknown'}</span>
              </div>
              <div className="info-item">
                <label>Amount:</label>
                <span className="amount">{formatAmount(grant.amount || grant.amount_string)}</span>
              </div>
              <div className="info-item">
                <label>Deadline:</label>
                <span className={`deadline deadline-${deadlineStatus}`}>
                  {formatDeadline(grant.deadline || grant.due_date)}
                </span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className="status">{grant.status || 'Active'}</span>
              </div>
              <div className="info-item">
                <label>Source:</label>
                <span>{grant.source || 'Database'}</span>
              </div>
            </div>
          </div>

          <div className="grant-info-section">
            <h3>Description</h3>
            <p className="description">
              {grant.description || grant.summary || 'No description available'}
            </p>
          </div>

          {eligibilityDetails && (
            <div className="grant-info-section">
              <h3>Eligibility Assessment</h3>
              <div className="eligibility-details">
                <div className="eligibility-category">
                  <span className={`category-badge ${eligibilityDetails.category.toLowerCase().replace('_', '-')}`}>
                    {eligibilityDetails.category.replace('_', ' ')}
                  </span>
                  <span className="confidence-score">
                    {eligibilityDetails.confidence}% confidence
                  </span>
                </div>
                <p className="reasoning">
                  <strong>Assessment:</strong> {eligibilityDetails.reasoning}
                </p>
              </div>
            </div>
          )}

          {grant.tags && grant.tags.length > 0 && (
            <div className="grant-info-section">
              <h3>Tags</h3>
              <div className="tags-list">
                {grant.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {grant.source_url && (
            <div className="grant-info-section">
              <h3>External Links</h3>
              <a 
                href={grant.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="external-link"
              >
                View Original Grant Details →
              </a>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={() => setShowDetails(false)}>
            Close
          </button>
          <button className="btn btn-primary">
            <span>💾</span>
            Save Grant
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
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
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowDetails(true)}
            >
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

      {showDetails && <GrantDetailsModal />}
    </>
  );
};

export default GrantCard; 