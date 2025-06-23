import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

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

interface MyGrantsWorkspaceProps {
  onGrantClick: (grant: Grant) => void
}

const STATUS_COLUMNS = [
  { id: 'potential', label: 'Potential', color: 'bg-gray-100', textColor: 'text-gray-800' },
  { id: 'drafting', label: 'Drafting', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { id: 'submitted', label: 'Submitted', color: 'bg-blue-100', textColor: 'text-blue-800' },
  { id: 'successful', label: 'Successful', color: 'bg-green-100', textColor: 'text-green-800' },
  { id: 'unsuccessful', label: 'Unsuccessful', color: 'bg-red-100', textColor: 'text-red-800' }
]

export default function MyGrantsWorkspace({ onGrantClick }: MyGrantsWorkspaceProps) {
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [draggedGrant, setDraggedGrant] = useState<Grant | null>(null)

  useEffect(() => {
    fetchMyGrants()
  }, [])

  const fetchMyGrants = async () => {
    try {
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .neq('status', 'archived')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setGrants(data || [])
    } catch (err) {
      console.error('Error fetching grants:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching grants')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (grantId: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('grants')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', grantId)

      if (error) throw error

      setGrants(prev => prev.map(grant =>
        grant.id === grantId ? { ...grant, status: newStatus } : grant
      ))
    } catch (_err) {
      setError('Failed to update grant status. Please try again.')
    }
  }

  const handleDragStart = (e: React.DragEvent, grant: Grant) => {
    setDraggedGrant(grant)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedGrant && draggedGrant.status !== newStatus) {
      handleStatusChange(draggedGrant.id, newStatus)
    }
    setDraggedGrant(null)
  }

  const getGrantsByStatus = (status: string) => {
    return grants.filter(grant => grant.status === status)
  }

  const getDueDateColor = (dueDate: string) => {
    if (!dueDate) return 'text-gray-500'
    
    const now = new Date()
    const due = new Date(dueDate)
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) return 'text-red-600 font-medium'
    if (daysUntilDue <= 7) return 'text-red-500 font-medium'
    if (daysUntilDue <= 30) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return 'No due date'
    return new Date(dueDate).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short'
    })
  }

  const getStatusStats = () => {
    return STATUS_COLUMNS.map(column => ({
      ...column,
      count: getGrantsByStatus(column.id).length
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Grants</h1>
          <p className="text-gray-600">Manage your grant applications and track progress</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {getStatusStats().map(stat => (
          <div key={stat.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${stat.color.replace('bg-', 'bg-').replace('-100', '-400')} mr-2`} />
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {STATUS_COLUMNS.map(column => (
            <div
              key={column.id}
              className="bg-gray-50 rounded-lg p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{column.label}</h3>
                <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                  {getGrantsByStatus(column.id).length}
                </span>
              </div>

              <div className="space-y-3">
                {getGrantsByStatus(column.id).map(grant => (
                  <div
                    key={grant.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, grant)}
                    onClick={() => onGrantClick(grant)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {grant.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{grant.funder}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-green-600">
                        {grant.amount_string || 'Amount TBD'}
                      </span>
                      <span className={getDueDateColor(grant.due_date)}>
                        {formatDueDate(grant.due_date)}
                      </span>
                    </div>
                  </div>
                ))}

                {getGrantsByStatus(column.id).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No grants</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {grants.map(grant => (
                  <tr key={grant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="cursor-pointer" onClick={() => onGrantClick(grant)}>
                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                          {grant.name}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {grant.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {grant.funder}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {grant.amount_string || 'TBD'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${getDueDateColor(grant.due_date)}`}>
                        {grant.due_date ? new Date(grant.due_date).toLocaleDateString('en-AU') : 'No due date'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={grant.status}
                        onChange={(e) => handleStatusChange(grant.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {STATUS_COLUMNS.map(status => (
                          <option key={status.id} value={status.id}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onGrantClick(grant)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {grants.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No grants found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by exploring the Grant Discovery Engine to find opportunities.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 