import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import './GrantDetailView.css';

const GrantDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [grant, setGrant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchGrantDetails();
  }, [id]);

  const fetchGrantDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/grant-details/${id}`);
      if (response.data.success) {
        setGrant(response.data.grant);
      } else {
        setError('Failed to load grant details');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load grant details');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#48bb78';
    if (score >= 60) return '#ed8936';
    return '#f56565';
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return '#48bb78';
      case 'medium': return '#ed8936';
      case 'high': return '#f56565';
      default: return '#718096';
    }
  };

  if (loading) {
    return (
      <div className="grant-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading grant details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grant-detail-error">
        <h2>Error Loading Grant</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/grants')} className="back-btn">
          ← Back to Grants
        </button>
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="grant-detail-error">
        <h2>Grant Not Found</h2>
        <button onClick={() => navigate('/grants')} className="back-btn">
          ← Back to Grants
        </button>
      </div>
    );
  }

  return (
    <div className="grant-detail-view">
      <div className="grant-detail-header">
        <button onClick={() => navigate('/grants')} className="back-btn">
          ← Back to Grants
        </button>
        <div className="grant-title-section">
          <h1>{grant.title}</h1>
          <div className="grant-meta">
            <span className="funder">🏛️ {grant.funder}</span>
            <span className="amount">💰 {grant.amount_string}</span>
            <span className="deadline">📅 Due: {new Date(grant.due_date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="grant-actions">
          <button className="action-btn primary">Apply Now</button>
          <button className="action-btn secondary">Save for Later</button>
        </div>
      </div>

      <div className="grant-detail-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'eligibility' ? 'active' : ''}`}
          onClick={() => setActiveTab('eligibility')}
        >
          Eligibility Analysis
        </button>
        <button 
          className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Application Questions
        </button>
        <button 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline & Requirements
        </button>
      </div>

      <div className="grant-detail-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="grant-description">
                <h3>Grant Description</h3>
                <p>{grant.description}</p>
                {grant.tags && (
                  <div className="grant-tags">
                    {grant.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="quick-stats">
                <h3>Quick Stats</h3>
                <div className="stat-item">
                  <span className="stat-label">Funding Amount</span>
                  <span className="stat-value">{grant.amount_string}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Application Deadline</span>
                  <span className="stat-value">{new Date(grant.due_date).toLocaleDateString()}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Grant Type</span>
                  <span className="stat-value">{grant.type || 'General'}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Source</span>
                  <span className="stat-value">{grant.source || 'Discovered'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'eligibility' && grant.eligibilityAnalysis && (
          <div className="eligibility-tab">
            <div className="eligibility-score-card">
              <div className="overall-score">
                <div 
                  className="score-circle"
                  style={{ '--score-color': getScoreColor(grant.eligibilityAnalysis.overallScore) }}
                >
                  <span className="score-number">{grant.eligibilityAnalysis.overallScore}</span>
                  <span className="score-label">Overall Score</span>
                </div>
                <div className="risk-indicator">
                  <span 
                    className="risk-badge"
                    style={{ backgroundColor: getRiskColor(grant.eligibilityAnalysis.riskLevel) }}
                  >
                    {grant.eligibilityAnalysis.riskLevel} Risk
                  </span>
                </div>
              </div>
              
              <div className="detailed-scores">
                <h3>Detailed Analysis</h3>
                <div className="score-breakdown">
                  {Object.entries(grant.eligibilityAnalysis.scores).map(([category, score]) => (
                    <div key={category} className="score-item">
                      <div className="score-header">
                        <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <span className="score-value">{score}%</span>
                      </div>
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${score}%`,
                            backgroundColor: getScoreColor(score)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="analysis-insights">
              <div className="factors-section">
                <h3>Key Factors</h3>
                <ul className="factors-list">
                  {grant.eligibilityAnalysis.factors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>

              <div className="recommendations-section">
                <h3>Recommendations</h3>
                <ul className="recommendations-list">
                  {grant.eligibilityAnalysis.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && grant.extractedQuestions && (
          <div className="questions-tab">
            <h3>Application Questions</h3>
            <div className="questions-list">
              {grant.extractedQuestions.map((question) => (
                <div key={question.id} className="question-card">
                  <div className="question-header">
                    <h4>{question.question}</h4>
                    <div className="question-meta">
                      <span className={`category-badge ${question.category.toLowerCase().replace(' ', '-')}`}>
                        {question.category}
                      </span>
                      {question.required && <span className="required-badge">Required</span>}
                    </div>
                  </div>
                  {question.wordLimit && (
                    <p className="word-limit">Word limit: {question.wordLimit} words</p>
                  )}
                  {question.attachments && (
                    <p className="attachments-note">📎 Attachments allowed</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && grant.timeline && (
          <div className="timeline-tab">
            <div className="timeline-grid">
              <div className="timeline-section">
                <h3>Key Dates</h3>
                <div className="timeline-item">
                  <span className="timeline-label">Application Deadline</span>
                  <span className="timeline-value">{grant.timeline.applicationDeadline}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Decision Timeline</span>
                  <span className="timeline-value">{grant.timeline.estimatedDecision}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Project Start</span>
                  <span className="timeline-value">{grant.timeline.projectStart}</span>
                </div>
                <div className="timeline-item">
                  <span className="timeline-label">Reporting</span>
                  <span className="timeline-value">{grant.timeline.reportingRequirements}</span>
                </div>
              </div>

              <div className="requirements-section">
                <h3>Requirements</h3>
                <ul className="requirements-list">
                  {grant.requirements?.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="suggested-actions">
              <h3>Suggested Next Steps</h3>
              <div className="actions-grid">
                {grant.suggestedActions?.map((action, index) => (
                  <div key={index} className="action-card">
                    <span className="action-text">{action}</span>
                    <button className="action-btn-small">Start</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantDetailView; 