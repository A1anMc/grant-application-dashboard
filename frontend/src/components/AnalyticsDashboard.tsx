import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell
} from 'recharts'

interface Metrics {
  grant_success_metrics: {
    total_grants: number
    total_amount: number
    success_rate: number
    avg_processing_time: number
    monthly_trends: Array<{
      month: string
      submitted: number
      approved: number
    }>
    funder_stats: Array<{
      funder: string
      approved: number
      total: number
    }>
  }
  activity_metrics: {
    activity_counts: { [key: string]: number }
    recent_activities: Array<{
      type: string
      timestamp: string
      details: string
    }>
    daily_activity: { [key: string]: number }
  }
  task_metrics: {
    total_tasks: number
    status_distribution: { [key: string]: number }
    priority_distribution: { [key: string]: number }
    completion_rate: number
    avg_completion_time: number
    overdue_tasks: number
  }
  document_metrics: {
    total_documents: number
    total_templates: number
    type_distribution: { [key: string]: number }
    storage_used: number
    avg_size_bytes: number
    monthly_uploads: { [key: string]: number }
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    grant_success_metrics: {
      total_grants: 0,
      total_amount: 0,
      success_rate: 0,
      avg_processing_time: 0,
      monthly_trends: [],
      funder_stats: []
    },
    activity_metrics: {
      activity_counts: {},
      recent_activities: [],
      daily_activity: {}
    },
    task_metrics: {
      total_tasks: 0,
      status_distribution: {},
      priority_distribution: {},
      completion_rate: 0,
      avg_completion_time: 0,
      overdue_tasks: 0
    },
    document_metrics: {
      total_documents: 0,
      total_templates: 0,
      type_distribution: {},
      storage_used: 0,
      avg_size_bytes: 0,
      monthly_uploads: {}
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  async function fetchMetrics() {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_metrics')
      if (error) throw error

      // Type assertion to handle the RPC response
      const typedData = data as Metrics
      setMetrics(typedData)
    } catch (err) {
      console.error('Error fetching metrics:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching metrics')
    } finally {
      setLoading(false)
    }
  }

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num)
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grant Success Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Grant Success Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">Total Grants</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-700">
              {formatNumber(metrics.grant_success_metrics.total_grants)}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-900">Total Amount</h3>
            <p className="mt-2 text-3xl font-semibold text-green-700">
              {formatCurrency(metrics.grant_success_metrics.total_amount)}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-900">Success Rate</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-700">
              {metrics.grant_success_metrics.success_rate.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-medium text-purple-900">Avg. Processing Time</h3>
            <p className="mt-2 text-3xl font-semibold text-purple-700">
              {metrics.grant_success_metrics.avg_processing_time} days
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Monthly Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={metrics.grant_success_metrics.monthly_trends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#8884d8" />
                <Line type="monotone" dataKey="approved" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Funder Statistics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics.grant_success_metrics.funder_stats}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="funder" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" fill="#82ca9d" />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Activity Metrics</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">Activity Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(metrics.activity_metrics.activity_counts).map(([key, value]) => ({
                      name: key,
                      value
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(metrics.activity_metrics.activity_counts).map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Daily Activity</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Object.entries(metrics.activity_metrics.daily_activity).map(([date, count]) => ({
                    date,
                    count
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Task Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Task Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">Total Tasks</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-700">
              {metrics.task_metrics.total_tasks}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-900">Completion Rate</h3>
            <p className="mt-2 text-3xl font-semibold text-green-700">
              {metrics.task_metrics.completion_rate.toFixed(1)}%
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-900">Avg. Completion Time</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-700">
              {metrics.task_metrics.avg_completion_time} days
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="text-sm font-medium text-red-900">Overdue Tasks</h3>
            <p className="mt-2 text-3xl font-semibold text-red-700">
              {metrics.task_metrics.overdue_tasks}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Task Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(metrics.task_metrics.status_distribution).map(([key, value]) => ({
                    name: key,
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(metrics.task_metrics.status_distribution).map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Document Metrics */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Document Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">Total Documents</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-700">
              {metrics.document_metrics.total_documents}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-900">Templates</h3>
            <p className="mt-2 text-3xl font-semibold text-green-700">
              {metrics.document_metrics.total_templates}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-900">Average Size</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-700">
              {(metrics.document_metrics.avg_size_bytes / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-medium text-purple-900">Storage Used</h3>
            <p className="mt-2 text-3xl font-semibold text-purple-700">
              {(metrics.document_metrics.storage_used / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Document Type Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(metrics.document_metrics.type_distribution).map(([key, value]) => ({
                    name: key,
                    value
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.entries(metrics.document_metrics.type_distribution).map((_, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Monthly Document Uploads</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={Object.entries(metrics.document_metrics.monthly_uploads).map(([month, count]) => ({
                  month,
                  count
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
} 