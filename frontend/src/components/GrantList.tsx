import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import EditGrantForm from './EditGrantForm'
import GrantFilters from './GrantFilters'
import DocumentManager from './DocumentManager'
import CommentSection from './CommentSection'
import TaskManager from './TaskManager'
import GrantCalendar from './GrantCalendar'

interface Grant {
  id: number
  title: string
  description: string
  amount: string
  due_date: string
  status: string
  funder: string
  source_url: string
  requirements: string
  created_at: string
  updated_at: string
}

export default function GrantList() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingGrantId, setEditingGrantId] = useState<number | null>(null)
  const [filters, setFilters] = useState({ status: 'all', search: '', sortBy: 'due_date' })
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'comments' | 'tasks'>('details')

  useEffect(() => {
    fetchGrants()
  }, [])

  async function fetchGrants() {
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

  async function deleteGrant(id: number) {
    try {
      const { error } = await supabase
        .from('grants')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchGrants()
    } catch (err) {
      console.error('Error deleting grant:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the grant')
    }
  }

  const filteredGrants = useMemo(() => {
    return grants.filter(grant => {
      const matchesStatus = filters.status === 'all' || grant.status === filters.status
      const matchesSearch = filters.search === '' || 
        grant.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        grant.funder.toLowerCase().includes(filters.search.toLowerCase()) ||
        grant.description?.toLowerCase().includes(filters.search.toLowerCase())
      
      return matchesStatus && matchesSearch
    })
  }, [grants, filters])

  const statusBadgeClasses = {
    draft: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    submitted: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (editingGrantId) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Edit Grant</h2>
          <EditGrantForm
            grantId={editingGrantId}
            onUpdate={() => {
              setEditingGrantId(null)
              fetchGrants()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  view === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  view === 'calendar'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Calendar View
              </button>
            </div>
          </div>

          {view === 'calendar' ? (
            <GrantCalendar />
          ) : (
            <>
              <GrantFilters onFilterChange={setFilters} />
              
              {filteredGrants.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No grants found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {filters.search || filters.status !== 'all' 
                      ? 'Try adjusting your filters'
                      : 'Get started by creating a new grant.'}
                  </p>
                </div>
              ) : (
                <div className="flex">
                  <div className={`${selectedGrant ? 'w-1/2 pr-4' : 'w-full'}`}>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {filteredGrants.map((grant) => (
                          <li
                            key={grant.id}
                            className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                              selectedGrant?.id === grant.id ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => setSelectedGrant(grant)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-lg font-medium text-gray-900 truncate">
                                    {grant.title}
                                  </h3>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses[grant.status as keyof typeof statusBadgeClasses]}`}>
                                    {grant.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                  {grant.description}
                                </p>
                              </div>
                              <div className="ml-6 flex-shrink-0">
                                <div className="flex flex-col items-end">
                                  {grant.amount && (
                                    <span className="text-lg font-medium text-gray-900">
                                      Amount: {grant.amount}
                                    </span>
                                  )}
                                  {grant.due_date && (
                                    <span className="text-sm text-gray-500">
                                      Due: {new Date(grant.due_date).toLocaleDateString()}
                                    </span>
                                  )}
                                  <span className="text-sm text-gray-500">
                                    Funder: {grant.funder}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {selectedGrant && (
                    <div className="w-1/2 pl-4">
                      <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {selectedGrant.title}
                            </h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingGrantId(selectedGrant.id)}
                                className="text-sm text-blue-600 hover:text-blue-800"
                              >
                                Edit
                              </button>
                              {deleteConfirm === selectedGrant.id ? (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => deleteGrant(selectedGrant.id)}
                                    className="text-sm text-red-600 hover:text-red-800"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirm(selectedGrant.id)}
                                  className="text-sm text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                              {['details', 'documents', 'comments', 'tasks'].map((tab) => (
                                <button
                                  key={tab}
                                  onClick={() => setActiveTab(tab as typeof activeTab)}
                                  className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                    ${activeTab === tab
                                      ? 'border-blue-500 text-blue-600'
                                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }
                                  `}
                                >
                                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                              ))}
                            </nav>
                          </div>

                          <div className="mt-6">
                            {activeTab === 'details' && (
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                                  <p className="mt-1">{selectedGrant.description}</p>
                                </div>
                                {selectedGrant.amount && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                                    <p className="mt-1">{selectedGrant.amount}</p>
                                  </div>
                                )}
                                {selectedGrant.due_date && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Due Date</h4>
                                    <p className="mt-1">{new Date(selectedGrant.due_date).toLocaleDateString()}</p>
                                  </div>
                                )}
                                {selectedGrant.source_url && (
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500">Source URL</h4>
                                    <a
                                      href={selectedGrant.source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-1 text-blue-600 hover:text-blue-800"
                                    >
                                      {selectedGrant.source_url}
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {activeTab === 'documents' && (
                              <DocumentManager grantId={selectedGrant.id} />
                            )}

                            {activeTab === 'comments' && (
                              <CommentSection grantId={selectedGrant.id} />
                            )}

                            {activeTab === 'tasks' && (
                              <TaskManager grantId={selectedGrant.id} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
} 