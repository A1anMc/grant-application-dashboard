import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchGrantDetails } from '../utils/api'
import './GrantDetails.css'

export default function GrantDetails() {
  const { id } = useParams()
  const [grant, setGrant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadGrant = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching grant details for ID:', id);
        const data = await fetchGrantDetails(id);
        console.log('Received grant data:', data);
        
        setGrant(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching grant:', error)
        setError(error.message || 'Failed to load grant details')
        setGrant(null)
        setLoading(false)
      }
    }

    if (id) {
      loadGrant()
    }
  }, [id])

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

  const getEligibilityBadgeClass = (eligibility) => {
    const category = getEligibilityCategory(eligibility);
    switch (category?.toLowerCase()) {
      case 'eligible':
        return 'badge-eligible'
      case 'eligible_with_auspice':
        return 'badge-possibly-eligible'
      case 'not_eligible':
        return 'badge-not-eligible'
      case 'potential':
        return 'badge-possibly-eligible'
      default:
        return 'badge-unknown'
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
        return 'Unknown Eligibility';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading grant details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/grants" className="back-link">Back to Grants</Link>
      </div>
    )
  }

  if (!grant) {
    return (
      <div className="not-found">
        <h2>Grant Not Found</h2>
        <p>The requested grant could not be found.</p>
        <Link to="/grants" className="back-link">Back to Grants</Link>
      </div>
    )
  }

  return (
    <div className="grant-details">
      <div className="grant-header">
        <Link to="/grants" className="back-link">← Back to Grants</Link>
        <h1>{grant.name}</h1>
        <div className="grant-meta">
          <span className="funder">{grant.funder}</span>
          <span className={`eligibility-badge ${getEligibilityBadgeClass(grant.eligibility)}`}>
            {getEligibilityText(grant.eligibility)}
          </span>
        </div>
      </div>

      <div className="grant-content">
        <div className="grant-main">
          <div className="grant-section">
            <h3>Grant Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Amount:</label>
                <span className="amount">{grant.amount_string || grant.amount}</span>
              </div>
              <div className="info-item">
                <label>Deadline:</label>
                <span className="deadline">{formatDate(grant.due_date || grant.deadline)}</span>
              </div>
              <div className="info-item">
                <label>Status:</label>
                <span className="status">{grant.status || 'Active'}</span>
              </div>
              <div className="info-item">
                <label>Category:</label>
                <span>{grant.category || 'General'}</span>
              </div>
            </div>
          </div>

          <div className="grant-section">
            <h3>Description</h3>
            <p className="description">{grant.description}</p>
          </div>

          {grant.eligibility && typeof grant.eligibility === 'object' && (
            <div className="grant-section">
              <h3>Eligibility Assessment</h3>
              <div className="eligibility-details">
                <p><strong>Category:</strong> {getEligibilityText(grant.eligibility)}</p>
                <p><strong>Confidence:</strong> {Math.round((grant.eligibility.confidence || 0) * 100)}%</p>
                <p><strong>Reasoning:</strong> {grant.eligibility.reasoning || 'N/A'}</p>
              </div>
            </div>
          )}

          {grant.tags && grant.tags.length > 0 && (
            <div className="grant-section">
              <h3>Tags</h3>
              <div className="tags">
                {grant.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {grant.requirements && (
            <div className="grant-section">
              <h3>Requirements</h3>
              <ul className="requirements">
                {grant.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="grant-sidebar">
          <div className="action-card">
            <h3>Quick Actions</h3>
            <a 
              href={grant.source_url || grant.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="external-link-btn"
            >
              Visit Official Site
            </a>
            <button className="save-btn">Save to Favorites</button>
            <button className="share-btn">Share Grant</button>
          </div>

          {grant.contact && (
            <div className="contact-card">
              <h3>Contact Information</h3>
              <p><strong>Email:</strong> {grant.contact.email}</p>
              <p><strong>Phone:</strong> {grant.contact.phone}</p>
              <p><strong>Website:</strong> <a href={grant.contact.website}>{grant.contact.website}</a></p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 