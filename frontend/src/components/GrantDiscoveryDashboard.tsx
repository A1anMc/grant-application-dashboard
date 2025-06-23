import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { FadeIn, AnimatedCard, Skeleton, Spinner } from './AnimatedComponents'

interface Grant {
  id: number
  name: string
  funder: string
  description: string
  amount_string: string
  due_date: string
  status: string
  source_url: string
  created_at: string
  updated_at: string
}

interface GrantDiscoveryDashboardProps {
  onGrantClick: (grant: Grant) => void
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'potential', label: 'Potential' },
  { value: 'drafting', label: 'Drafting' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'successful', label: 'Successful' },
  { value: 'unsuccessful', label: 'Unsuccessful' }
]

const FOCUS_AREAS = [
  'Youth Services',
  'Environmental Conservation',
  'Screen Production',
  'Medical Research',
  'Education',
  'Arts & Culture',
  'Community Development',
  'Health & Wellbeing',
  'Technology',
  'Social Justice',
  'Animal Welfare',
  'Disability Services',
  'Mental Health',
  'Indigenous Affairs',
  'Women\'s Services',
  'Aged Care',
  'Housing',
  'Food Security',
  'Climate Action',
  'Innovation'
]

const DUE_DATE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'week', label: 'Due this week' },
  { value: 'month', label: 'Due this month' },
  { value: 'quarter', label: 'Due this quarter' }
]

export default function GrantDiscoveryDashboard({ onGrantClick }: GrantDiscoveryDashboardProps) {
  const [grants, setGrants] = useState<Grant[]>([])
  const [filteredGrants, setFilteredGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [focusAreaFilters, setFocusAreaFilters] = useState<string[]>([])
  const [dueDateFilter, setDueDateFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchGrants()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [grants, searchTerm, statusFilter, focusAreaFilters, dueDateFilter])

  const fetchGrants = async () => {
    try {
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGrants(data || [])
    } catch (err) {
      console.error('Error fetching grants:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching grants')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...grants]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(grant =>
        grant.name.toLowerCase().includes(term) ||
        grant.funder.toLowerCase().includes(term) ||
        grant.description.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(grant => grant.status === statusFilter)
    }

    // Focus area filters
    if (focusAreaFilters.length > 0) {
      filtered = filtered.filter(grant =>
        focusAreaFilters.some(area =>
          grant.name.toLowerCase().includes(area.toLowerCase()) ||
          grant.description.toLowerCase().includes(area.toLowerCase())
        )
      )
    }

    // Due date filter
    if (dueDateFilter !== 'all') {
      const now = new Date()
      const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const oneQuarter = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter(grant => {
        if (!grant.due_date) return false
        const dueDate = new Date(grant.due_date)
        
        switch (dueDateFilter) {
          case 'week':
            return dueDate >= now && dueDate <= oneWeek
          case 'month':
            return dueDate >= now && dueDate <= oneMonth
          case 'quarter':
            return dueDate >= now && dueDate <= oneQuarter
          default:
            return true
        }
      })
    }

    setFilteredGrants(filtered)
  }

  const clearAllFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setFocusAreaFilters([])
    setDueDateFilter('all')
  }

  const toggleFocusArea = (area: string) => {
    setFocusAreaFilters(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'potential':
        return 'bg-gray-100 text-gray-800'
      case 'drafting':
        return 'bg-yellow-100 text-yellow-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'successful':
        return 'bg-green-100 text-green-800'
      case 'unsuccessful':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDueDateColor = (dueDate: string) => {
    if (!dueDate) return 'text-gray-500'
    
    const now = new Date()
    const due = new Date(dueDate)
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) return 'text-red-600 font-medium' // Overdue
    if (daysUntilDue <= 7) return 'text-red-500 font-medium' // Due this week
    if (daysUntilDue <= 30) return 'text-yellow-600' // Due this month
    return 'text-gray-600'
  }

  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return 'No due date'
    return new Date(dueDate).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <FadeIn>
          <div className="flex items-center justify-center py-12">
            <Spinner size="large" />
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <FadeIn key={index} delay={index * 100}>
              <div className="bg-white rounded-lg shadow-md p-6">
                <Skeleton height="1.5rem" className="mb-4" />
                <Skeleton height="1rem" lines={3} className="mb-4" />
                <div className="flex justify-between items-center">
                  <Skeleton height="1rem" width="40%" />
                  <Skeleton height="2rem" width="30%" />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grant Discovery Engine</h1>
          <p className="text-gray-600">Find and manage grant opportunities for your organization</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredGrants.length} of {grants.length} grants
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search grants by keyword (e.g., 'sustainability', 'sydney')"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          
          {(searchTerm || statusFilter !== 'all' || focusAreaFilters.length > 0 || dueDateFilter !== 'all') && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Due Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <select
                value={dueDateFilter}
                onChange={(e) => setDueDateFilter(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {DUE_DATE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Focus Areas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Focus Areas</label>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {FOCUS_AREAS.map(area => (
                  <label key={area} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={focusAreaFilters.includes(area)}
                      onChange={() => toggleFocusArea(area)}
                      className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-xs text-gray-700">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Grant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGrants.map((grant, index) => (
          <FadeIn key={grant.id} delay={index * 50}>
            <AnimatedCard
              hoverEffect="lift"
              className="bg-white rounded-lg shadow border border-gray-200 cursor-pointer"
              onClick={() => onGrantClick(grant)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                    {grant.name}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(grant.status)}`}>
                    {grant.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2 font-medium">{grant.funder}</p>
                
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {grant.description}
                </p>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-green-600">
                    {grant.amount_string || 'Amount not specified'}
                  </span>
                  <span className={getDueDateColor(grant.due_date)}>
                    {formatDueDate(grant.due_date)}
                  </span>
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>
        ))}
      </div>

      {/* No Results */}
      {filteredGrants.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No grants found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}
    </div>
  )
} 