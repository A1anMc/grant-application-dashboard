import { useState, useEffect } from 'react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { fetchGrants } from '../utils/api'
import './Analytics.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export default function Analytics() {
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching analytics data...');
        const data = await fetchGrants();
        console.log('Received grants for analytics:', data);
        
        setGrants(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        setError('Failed to load analytics data')
        setLoading(false)
      }
    }

    loadAnalyticsData()
  }, [])

  const processData = () => {
    if (!grants.length) return {}

    const now = new Date()
    const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000)

    // Filter grants within time range
    const recentGrants = grants.filter(grant => new Date(grant.deadline) >= daysAgo)

    // Grant amounts over time
    const amountsByMonth = recentGrants.reduce((acc, grant) => {
      const month = new Date(grant.deadline).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
      acc[month] = (acc[month] || 0) + (parseInt(grant.amount.replace(/[^0-9]/g, '')) || 0)
      return acc
    }, {})

    // Eligibility distribution
    const eligibilityCounts = grants.reduce((acc, grant) => {
      const eligibility = grant.eligibility || 'Unknown'
      acc[eligibility] = (acc[eligibility] || 0) + 1
      return acc
    }, {})

    // Tag distribution
    const tagCounts = grants.reduce((acc, grant) => {
      grant.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    }, {})

    // Funder distribution
    const funderCounts = grants.reduce((acc, grant) => {
      acc[grant.funder] = (acc[grant.funder] || 0) + 1
      return acc
    }, {})

    return {
      amountsByMonth,
      eligibilityCounts,
      tagCounts,
      funderCounts
    }
  }

  const data = processData()

  const amountsChartData = {
    labels: Object.keys(data.amountsByMonth || {}),
    datasets: [
      {
        label: 'Grant Amounts ($)',
        data: Object.values(data.amountsByMonth || {}),
        borderColor: '#D95D39',
        backgroundColor: 'rgba(217, 93, 57, 0.1)',
        tension: 0.4,
      },
    ],
  }

  const eligibilityChartData = {
    labels: Object.keys(data.eligibilityCounts || {}),
    datasets: [
      {
        data: Object.values(data.eligibilityCounts || {}),
        backgroundColor: [
          '#dcfce7',
          '#dbeafe',
          '#fef3c7',
          '#fee2e2',
          '#f3f4f6',
        ],
        borderColor: [
          '#166534',
          '#1e40af',
          '#92400e',
          '#991b1b',
          '#6b7280',
        ],
        borderWidth: 2,
      },
    ],
  }

  const tagChartData = {
    labels: Object.keys(data.tagCounts || {}).slice(0, 10),
    datasets: [
      {
        label: 'Grants by Tag',
        data: Object.values(data.tagCounts || {}).slice(0, 10),
        backgroundColor: '#F4A261',
        borderColor: '#e76f51',
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Grant Analytics',
      },
    },
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="analytics">
        <h2>Analytics Dashboard</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="time-filter">
          <label htmlFor="time-range">Time Range:</label>
          <select
            id="time-range"
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <h3>Grant Amounts Over Time</h3>
          <Line data={amountsChartData} options={chartOptions} />
        </div>

        <div className="chart-card">
          <h3>Eligibility Distribution</h3>
          <Doughnut data={eligibilityChartData} options={chartOptions} />
        </div>

        <div className="chart-card">
          <h3>Top Grant Tags</h3>
          <Bar data={tagChartData} options={chartOptions} />
        </div>

        <div className="stats-card">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{grants.length}</span>
              <span className="stat-label">Total Grants</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                ${grants.reduce((sum, g) => sum + (parseInt(g.amount.replace(/[^0-9]/g, '')) || 0), 0).toLocaleString()}
              </span>
              <span className="stat-label">Total Value</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {grants.filter(g => new Date(g.deadline) > new Date()).length}
              </span>
              <span className="stat-label">Active Grants</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {Object.keys(data.funderCounts || {}).length}
              </span>
              <span className="stat-label">Unique Funders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 