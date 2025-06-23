import React, { useState } from 'react';
import './GrantFilterSidebar.css';

const GrantFilterSidebar = ({ 
  filters, 
  onFilterChange, 
  categories = [], 
  tags = [], 
  eligibilityOptions = ['All', 'Eligible', 'Ineligible', 'Pending'] 
}) => {
  const [activeTab, setActiveTab] = useState('filters');

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: 'All',
      eligibility: 'All',
      tags: [],
      amountRange: [0, 1000000]
    });
  };

  return (
    <div className="filter-sidebar">
      {/* Notebook tabs */}
      <div className="notebook-tabs">
        <button 
          className={`tab ${activeTab === 'filters' ? 'active' : ''}`}
          onClick={() => setActiveTab('filters')}
        >
          Filters
        </button>
        <button 
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved
        </button>
        <button 
          className={`tab ${activeTab === 'flagged' ? 'active' : ''}`}
          onClick={() => setActiveTab('flagged')}
        >
          Flagged
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'filters' && (
          <div className="filters-panel">
            {/* Search */}
            <div className="filter-section">
              <h4>Search</h4>
              <input
                type="text"
                placeholder="Search grants..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input"
              />
            </div>

            {/* Category Filter */}
            <div className="filter-section">
              <h4>Category</h4>
              <select
                value={filters.category || 'All'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="All">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Eligibility Filter */}
            <div className="filter-section">
              <h4>Eligibility</h4>
              <div className="radio-group">
                {eligibilityOptions.map(option => (
                  <label key={option} className="radio-label">
                    <input
                      type="radio"
                      name="eligibility"
                      value={option}
                      checked={filters.eligibility === option}
                      onChange={(e) => handleFilterChange('eligibility', e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div className="filter-section">
                <h4>Tags</h4>
                <div className="tags-filter">
                  {tags.map(tag => (
                    <label key={tag} className="tag-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.tags?.includes(tag) || false}
                        onChange={(e) => {
                          const currentTags = filters.tags || [];
                          const newTags = e.target.checked
                            ? [...currentTags, tag]
                            : currentTags.filter(t => t !== tag);
                          handleFilterChange('tags', newTags);
                        }}
                      />
                      <span className="tag-label handwritten-tag">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Amount Range */}
            <div className="filter-section">
              <h4>Amount Range</h4>
              <div className="amount-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.amountRange?.[0] || ''}
                  onChange={(e) => {
                    const currentRange = filters.amountRange || [0, 1000000];
                    handleFilterChange('amountRange', [parseInt(e.target.value) || 0, currentRange[1]]);
                  }}
                  className="amount-input"
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.amountRange?.[1] || ''}
                  onChange={(e) => {
                    const currentRange = filters.amountRange || [0, 1000000];
                    handleFilterChange('amountRange', [currentRange[0], parseInt(e.target.value) || 1000000]);
                  }}
                  className="amount-input"
                />
              </div>
            </div>

            {/* Clear Filters */}
            <button 
              className="btn-outline clear-filters-btn"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="saved-panel">
            <div className="empty-state">
              <div className="empty-icon">📁</div>
              <h4>No Saved Grants</h4>
              <p>Save grants you're interested in to view them here later.</p>
            </div>
          </div>
        )}

        {activeTab === 'flagged' && (
          <div className="flagged-panel">
            <div className="empty-state">
              <div className="empty-icon">📌</div>
              <h4>No Flagged Grants</h4>
              <p>Flag important grants to keep track of them here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantFilterSidebar; 