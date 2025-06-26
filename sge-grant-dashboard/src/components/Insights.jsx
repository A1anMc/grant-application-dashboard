import React, { useState, useEffect } from 'react';
import InsightsWidget from './InsightsWidget';
import './Insights.css';

const Insights = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchGrantsAndGenerateInsights();
  }, []);

  const fetchGrantsAndGenerateInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/grants');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGrants(data.grants || []);
      generateInsights(data.grants || []);
    } catch (err) {
      console.error('Error fetching grants:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (grantsData) => {
    const insights = [];
    const now = new Date();
    
    // Deadline insights
    const urgentDeadlines = grantsData.filter(g => {
      if (!g.due_date && !g.deadline) return false;
      const deadline = new Date(g.due_date || g.deadline);
      const daysUntil = (deadline - now) / (1000 * 60 * 60 * 24);
      return daysUntil <= 7 && daysUntil > 0;
    });

    if (urgentDeadlines.length > 0) {
      insights.push({
        type: 'urgent',
        icon: '🚨',
        title: `${urgentDeadlines.length} Urgent Deadline${urgentDeadlines.length > 1 ? 's' : ''}`,
        description: `You have grant deadlines coming up in the next 7 days. Review and submit applications soon.`,
        action: {
          label: 'View Deadlines',
          onClick: () => console.log('Navigate to deadlines')
        }
      });
    }

    // Eligibility insights
    const eligibleGrants = grantsData.filter(g => g.eligibility?.category === 'eligible');
    const totalGrants = grantsData.length;
    
    if (eligibleGrants.length > 0) {
      const eligibilityRate = ((eligibleGrants.length / totalGrants) * 100).toFixed(0);
      insights.push({
        type: 'opportunity',
        icon: '⭐',
        title: `${eligibleGrants.length} Eligible Opportunities`,
        description: `You have a ${eligibilityRate}% eligibility rate. Focus on these high-potential grants first.`,
        action: {
          label: 'View Eligible Grants',
          onClick: () => console.log('Filter to eligible grants')
        }
      });
    }

    // Funding insights
    const totalFunding = grantsData.reduce((sum, grant) => {
      const amount = grant.amount_string?.replace(/[$,]/g, '');
      return sum + (parseFloat(amount) || 0);
    }, 0);

    if (totalFunding > 0) {
      insights.push({
        type: 'success',
        icon: '💰',
        title: `$${(totalFunding / 1000000).toFixed(1)}M Total Funding Available`,
        description: `Average of $${(totalFunding / totalGrants / 1000).toFixed(0)}K per grant across your opportunities.`,
        action: {
          label: 'View Analytics',
          onClick: () => console.log('Navigate to analytics')
        }
      });
    }

    // AI Discovery insights
    const discoveredGrants = grantsData.filter(g => g.source === 'fallback_data' || g.source === 'discovered');
    if (discoveredGrants.length > 0) {
      insights.push({
        type: 'info',
        icon: '🤖',
        title: `${discoveredGrants.length} AI-Discovered Grants`,
        description: `Our AI system has found ${discoveredGrants.length} relevant grants. Review these automated discoveries.`,
        action: {
          label: 'Review AI Finds',
          onClick: () => console.log('Filter to discovered grants')
        }
      });
    }

    setInsights(insights);
  };

  if (loading) {
    return (
      <div className="insights-loading">
        <div className="loading-spinner"></div>
        <p>Generating insights...</p>
      </div>
    );
  }

  return (
    <div className="insights">
      <div className="insights-header">
        <h1>Smart Insights</h1>
        <p>AI-powered recommendations and analysis for your grant opportunities</p>
      </div>

      <div className="insights-content">
        {insights.length > 0 ? (
          <InsightsWidget insights={insights} />
        ) : (
          <div className="no-insights">
            <div className="no-insights-icon">💡</div>
            <h3>No Insights Available</h3>
            <p>Add more grants to get personalized insights and recommendations.</p>
            <button className="btn btn-primary">
              Add Grants
            </button>
          </div>
        )}

        <div className="insights-stats">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{grants.length}</span>
              <span className="stat-label">Total Grants</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {grants.filter(g => g.eligibility?.category === 'eligible').length}
              </span>
              <span className="stat-label">Eligible</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {grants.filter(g => {
                  const deadline = new Date(g.due_date || g.deadline);
                  const daysUntil = (deadline - new Date()) / (1000 * 60 * 60 * 24);
                  return daysUntil <= 30 && daysUntil > 0;
                }).length}
              </span>
              <span className="stat-label">Due Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights; 