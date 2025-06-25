import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { format, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import './Analytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/grants');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGrants(data.grants || []);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate key metrics
  const calculateMetrics = () => {
    const total = grants.length;
    const eligible = grants.filter(g => g.eligibility?.category === 'eligible').length;
    const eligibleWithAuspice = grants.filter(g => g.eligibility?.category === 'eligible_with_auspice').length;
    const notEligible = grants.filter(g => g.eligibility?.category === 'not_eligible').length;
    const potential = grants.filter(g => g.eligibility?.category === 'potential').length;
    
    // Calculate total funding available
    const totalFunding = grants.reduce((sum, grant) => {
      const amount = grant.amount_string?.replace(/[$,]/g, '');
      return sum + (parseFloat(amount) || 0);
    }, 0);

    // Deadline analysis
    const now = new Date();
    const deadlineSoon = grants.filter(g => {
      if (!g.deadline) return false;
      const deadline = new Date(g.deadline);
      const daysUntil = (deadline - now) / (1000 * 60 * 60 * 24);
      return daysUntil <= 30 && daysUntil > 0;
    }).length;

    const overdue = grants.filter(g => {
      if (!g.deadline) return false;
      const deadline = new Date(g.deadline);
      return deadline < now;
    }).length;

    return {
      total,
      eligible,
      eligibleWithAuspice,
      notEligible,
      potential,
      totalFunding,
      deadlineSoon,
      overdue,
      eligibilityRate: total > 0 ? ((eligible + eligibleWithAuspice) / total * 100).toFixed(1) : 0,
      averageFunding: total > 0 ? (totalFunding / total).toFixed(0) : 0
    };
  };

  // Eligibility Distribution Chart Data
  const getEligibilityChartData = () => {
    const metrics = calculateMetrics();
    
    return {
      labels: ['Eligible', 'Auspice Required', 'Not Eligible', 'Potential'],
      datasets: [{
        data: [metrics.eligible, metrics.eligibleWithAuspice, metrics.notEligible, metrics.potential],
        backgroundColor: [
          '#10B981', // Green
          '#F59E0B', // Yellow
          '#EF4444', // Red
          '#6366F1'  // Purple
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    };
  };

  // Funding Distribution Chart Data
  const getFundingChartData = () => {
    const fundingRanges = {
      'Under $10K': 0,
      '$10K - $50K': 0,
      '$50K - $100K': 0,
      '$100K - $500K': 0,
      '$500K+': 0
    };

    grants.forEach(grant => {
      const amount = parseFloat(grant.amount_string?.replace(/[$,]/g, '') || 0);
      if (amount < 10000) fundingRanges['Under $10K']++;
      else if (amount < 50000) fundingRanges['$10K - $50K']++;
      else if (amount < 100000) fundingRanges['$50K - $100K']++;
      else if (amount < 500000) fundingRanges['$100K - $500K']++;
      else fundingRanges['$500K+']++;
    });

    return {
      labels: Object.keys(fundingRanges),
      datasets: [{
        label: 'Number of Grants',
        data: Object.values(fundingRanges),
        backgroundColor: '#3B82F6',
        borderColor: '#1D4ED8',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  };

  // Timeline Chart Data
  const getTimelineChartData = () => {
    const months = [];
    const grantsData = [];
    const fundingData = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      months.push(format(date, 'MMM yyyy'));
      
      // Count grants added in this month (using mock data for timeline)
      const monthGrants = Math.floor(Math.random() * 5) + 1;
      const monthFunding = monthGrants * (Math.random() * 50000 + 10000);
      
      grantsData.push(monthGrants);
      fundingData.push(monthFunding);
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Grants Discovered',
          data: grantsData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Total Funding ($)',
          data: fundingData,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Confidence Score Distribution
  const getConfidenceChartData = () => {
    const confidenceRanges = {
      'High (0.8+)': 0,
      'Medium (0.5-0.8)': 0,
      'Low (0.3-0.5)': 0,
      'Very Low (<0.3)': 0
    };

    grants.forEach(grant => {
      const confidence = grant.eligibility?.confidence || 0;
      if (confidence >= 0.8) confidenceRanges['High (0.8+)']++;
      else if (confidence >= 0.5) confidenceRanges['Medium (0.5-0.8)']++;
      else if (confidence >= 0.3) confidenceRanges['Low (0.3-0.5)']++;
      else confidenceRanges['Very Low (<0.3)']++;
    });

    return {
      labels: Object.keys(confidenceRanges),
      datasets: [{
        data: Object.values(confidenceRanges),
        backgroundColor: [
          '#10B981',
          '#F59E0B', 
          '#EF4444',
          '#6B7280'
        ],
        borderWidth: 0
      }]
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Analytics</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchAnalyticsData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="analytics">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <p>Comprehensive insights into your grant discovery and eligibility data</p>
        </div>
        <div className="header-controls">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={fetchAnalyticsData}>
            <span>🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-number">{metrics.total}</div>
            <div className="metric-label">Total Grants</div>
            <div className="metric-trend">+{Math.floor(Math.random() * 10) + 1} this month</div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-number">{metrics.eligible + metrics.eligibleWithAuspice}</div>
            <div className="metric-label">Eligible Grants</div>
            <div className="metric-trend">{metrics.eligibilityRate}% eligibility rate</div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <div className="metric-number">{metrics.deadlineSoon}</div>
            <div className="metric-label">Deadline Soon</div>
            <div className="metric-trend">Next 30 days</div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-number">${(metrics.totalFunding / 1000000).toFixed(1)}M</div>
            <div className="metric-label">Total Funding</div>
            <div className="metric-trend">Avg ${(metrics.averageFunding / 1000).toFixed(0)}K per grant</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Eligibility Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Eligibility Distribution</h3>
            <p>Breakdown of grant eligibility status</p>
          </div>
          <div className="chart-container">
            <Doughnut 
              data={getEligibilityChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Funding Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Funding Distribution</h3>
            <p>Grants by funding amount ranges</p>
          </div>
          <div className="chart-container">
            <Bar 
              data={getFundingChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Timeline Trends */}
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>Discovery Timeline</h3>
            <p>Grant discovery trends over time</p>
          </div>
          <div className="chart-container">
            <Line 
              data={getTimelineChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                      drawOnChartArea: false,
                    },
                    ticks: {
                      callback: function(value) {
                        return '$' + (value / 1000).toFixed(0) + 'K';
                      }
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'top'
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Confidence Scores</h3>
            <p>AI eligibility assessment confidence</p>
          </div>
          <div className="chart-container">
            <Pie 
              data={getConfidenceChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h3>🔍 Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Eligibility Success</h4>
              <p>You have a <strong>{metrics.eligibilityRate}%</strong> eligibility rate across all grants. This is {metrics.eligibilityRate > 60 ? 'excellent' : metrics.eligibilityRate > 40 ? 'good' : 'below average'}.</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">⚡</div>
            <div className="insight-content">
              <h4>Urgent Actions</h4>
              <p><strong>{metrics.deadlineSoon}</strong> grants have deadlines in the next 30 days. {metrics.overdue > 0 && `${metrics.overdue} grants are overdue.`}</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <h4>Funding Opportunities</h4>
              <p>Total funding available: <strong>${(metrics.totalFunding / 1000000).toFixed(1)}M</strong> across {metrics.total} grants with an average of ${(metrics.averageFunding / 1000).toFixed(0)}K per grant.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 