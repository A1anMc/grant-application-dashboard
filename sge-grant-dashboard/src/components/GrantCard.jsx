import React, { useState } from 'react';
import './GrantCard.css';

const GrantCard = ({ grant, onViewDetails, onFlag, onSave, isFlagged = false, isSaved = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Helper function to get eligibility category (handles both string and object formats)
  const getEligibilityCategory = (eligibility) => {
    if (typeof eligibility === 'string') {
      return eligibility;
    }
    if (eligibility && typeof eligibility === 'object' && eligibility.category) {
      return eligibility.category;
    }
    return 'unknown';
  };

  const getEligibilityColor = (eligibility) => {
    const category = getEligibilityCategory(eligibility);
    switch (category?.toLowerCase()) {
      case 'eligible':
        return 'var(--accent-lime)';
      case 'eligible_with_auspice':
        return 'var(--warm-sand)';
      case 'not_eligible':
        return 'var(--burnt-coral)';
      case 'potential':
        return 'var(--warm-sand)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getEligibilityIcon = (eligibility) => {
    const category = getEligibilityCategory(eligibility);
    switch (category?.toLowerCase()) {
      case 'eligible':
        return '✓';
      case 'eligible_with_auspice':
        return '⚠';
      case 'not_eligible':
        return '✗';
      case 'potential':
        return '?';
      default:
        return '•';
    }
  };

  const getEligibilityText = (eligibility) => {
    const category = getEligibilityCategory(eligibility);
    switch (category?.toLowerCase()) {
      case 'eligible':
        return 'Eligible';
      case 'eligible_with_auspice':
        return 'Eligible (Auspice)';
      case 'not_eligible':
        return 'Not Eligible';
      case 'potential':
        return 'Potential';
      default:
        return 'Unknown';
    }
  };

  return (
    <div 
      className={`grant-card collage-card ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative tape */}
      <div className="card-tape"></div>
      
      {/* Paper clip */}
      <div className="card-paperclip"></div>
      
      {/* Main content */}
      <div className="card-header">
        <div className="grant-title">
          <h3>{grant.name || grant.title}</h3>
          <div 
            className="eligibility-badge"
            style={{ backgroundColor: getEligibilityColor(grant.eligibility) }}
          >
            {getEligibilityIcon(grant.eligibility)} {getEligibilityText(grant.eligibility)}
          </div>
        </div>
        
        <div className="card-actions">
          <button 
            className={`action-btn flag-btn ${isFlagged ? 'flagged' : ''}`}
            onClick={() => onFlag && onFlag(grant.id)}
            title={isFlagged ? 'Unflag' : 'Flag'}
          >
            📌
          </button>
          <button 
            className={`action-btn save-btn ${isSaved ? 'saved' : ''}`}
            onClick={() => onSave && onSave(grant.id)}
            title={isSaved ? 'Remove from saved' : 'Save for later'}
          >
            {isSaved ? '📁' : '📂'}
          </button>
        </div>
      </div>

      <div className="card-content">
        <p className="grant-description">{grant.description}</p>
        
        <div className="grant-meta">
          <div className="meta-item">
            <span className="meta-label">Amount:</span>
            <span className="meta-value">{grant.amount_string || grant.amount}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Deadline:</span>
            <span className="meta-value deadline">{grant.due_date || grant.deadline}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Funder:</span>
            <span className="meta-value">{grant.funder}</span>
          </div>
        </div>

        {grant.tags && grant.tags.length > 0 && (
          <div className="grant-tags">
            {grant.tags.map((tag, index) => (
              <span key={index} className="tag handwritten-tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card-footer">
        <button 
          className="btn-primary view-details-btn"
          onClick={() => onViewDetails && onViewDetails(grant.id)}
        >
          View Details
        </button>
        
        <div className="source-verification">
          {grant.sourceVerified ? (
            <span className="verified-source">✔ {grant.source}</span>
          ) : (
            <span className="manual-source">⚠ Manual Entry</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrantCard; 