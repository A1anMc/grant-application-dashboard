import React from 'react';
import './CollageHeaderBanner.css';

const CollageHeaderBanner = ({ stats, onActionClick }) => {
  return (
    <div className="header-banner">
      <div className="banner-container">
        <div className="banner-content">
          <div className="banner-text">
            <h1 className="banner-title">
              Discover Your Next Grant Opportunity
            </h1>
            <p className="banner-subtitle">
              Advanced grant discovery powered by AI. Find, filter, and track grants 
              tailored to your organization's needs and eligibility criteria.
            </p>
            <div className="banner-actions">
              <button 
                className="banner-btn primary"
                onClick={() => onActionClick('explore')}
              >
                <svg className="banner-btn-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Explore Grants
              </button>
              <button 
                className="banner-btn secondary"
                onClick={() => onActionClick('learn')}
              >
                <svg className="banner-btn-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Learn More
              </button>
            </div>
          </div>
          
          <div className="banner-visual">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{stats?.totalGrants || 0}</div>
                <div className="stat-label">Available Grants</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{stats?.eligibleGrants || 0}</div>
                <div className="stat-label">Eligible</div>
              </div>
            </div>
            
            <div className="feature-highlights">
              <div className="feature-item">
                <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-Powered Matching
              </div>
              <div className="feature-item">
                <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time Updates
              </div>
              <div className="feature-item">
                <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Smart Filtering
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollageHeaderBanner; 