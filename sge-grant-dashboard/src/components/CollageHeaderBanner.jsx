import React from 'react';
import './CollageHeaderBanner.css';

const CollageHeaderBanner = ({ title, subtitle, stats }) => {
  return (
    <div className="collage-header-banner paper-texture">
      <div className="banner-content">
        <div className="banner-text">
          <h1 className="banner-title">{title}</h1>
          <p className="banner-subtitle">{subtitle}</p>
        </div>
        
        <div className="banner-stats">
          {stats?.map((stat, index) => (
            <div key={index} className="stat-card collage-card">
              <div className="stat-number">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
        
        <div className="collage-elements">
          {/* Overlapping thumbnail elements */}
          <div className="thumbnail-stack">
            <div className="thumbnail thumbnail-1"></div>
            <div className="thumbnail thumbnail-2"></div>
            <div className="thumbnail thumbnail-3"></div>
          </div>
          
          {/* Decorative elements */}
          <div className="decorative-tape tape-1"></div>
          <div className="decorative-tape tape-2"></div>
          <div className="paper-clip"></div>
        </div>
      </div>
    </div>
  );
};

export default CollageHeaderBanner; 