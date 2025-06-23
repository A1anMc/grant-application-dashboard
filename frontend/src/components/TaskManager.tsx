import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export interface Task {
  id: number
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  assigned_to: string | null
  grant_id: number
  created_at: string
  updated_at: string
  assignee_details?: {
    email: string
  }
}

interface TaskManagerProps {
  grantId: number
}

export default function TaskManager({ grantId }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<{ id: string; email: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    priority: 'medium' as Task['priority'],
    due_date: '',
    assigned_to: ''
  })

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [grantId])

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee_details:auth.users(email)
        `)
        .eq('grant_id', grantId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const typedData = data as unknown as Task[]
      setTasks(typedData || [])
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching tasks')
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('id, email')

      if (error) throw error

      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const handleFormChange = (field: string, value: string) => {
    setNewTask(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    if (!newTask.title.trim()) {
      errors.title = 'Title is required'
    }
    if (!newTask.priority) {
      errors.priority = 'Priority is required'
    }
    if (newTask.due_date && isNaN(Date.parse(newTask.due_date))) {
      errors.due_date = 'Invalid date format'
    }
    return errors
  }

  async function createTask() {
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          grant_id: grantId,
          ...newTask,
          due_date: newTask.due_date || null
        })

      if (error) throw error

      setShowNewTaskForm(false)
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        assigned_to: ''
      })
      setFormErrors({})
      await fetchTasks()
    } catch (err) {
      console.error('Error creating task:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while creating the task')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function updateTaskStatus(taskId: number, status: Task['status']) {
    setError(null)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status, updated_at: new Date().toISOString() } : task
        )
      )
    } catch (err) {
      console.error('Error updating task:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while updating the task')
    }
  }

  async function deleteTask(taskId: number) {
    setError(null)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the task')
    }
  }

  const statusBadgeClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    blocked: 'bg-red-100 text-red-800'
  }

  const priorityBadgeClasses = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
            <button
              type="button"
              onClick={() => setShowNewTaskForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Task
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32" role="status">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              <span className="sr-only">Loading...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {tasks.map(task => (
                <li key={task.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                      <p className="text-sm text-gray-500">{task.description}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadgeClasses[task.status]}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityBadgeClasses[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className="text-xs text-gray-500">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {task.assignee_details?.email && (
                          <span className="text-xs text-gray-500">
                            Assigned to: {task.assignee_details.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        aria-label={`Change status for ${task.title}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        aria-label={`Delete ${task.title}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showNewTaskForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              createTask()
            }}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    id="title"
                    value={newTask.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
                    className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                      formErrors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.title && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    id="description"
                    rows={3}
                    value={newTask.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
                      formErrors.priority ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                    }`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  {formErrors.priority && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.priority}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input
                    type="date"
                    id="due_date"
                    value={newTask.due_date}
                    onChange={(e) => handleFormChange('due_date', e.target.value)}
                    className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
                      formErrors.due_date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  />
                  {formErrors.due_date && (
                    <p className="mt-2 text-sm text-red-600">{formErrors.due_date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700">Assign To</label>
                  <select
                    id="assigned_to"
                    value={newTask.assigned_to}
                    onChange={(e) => handleFormChange('assigned_to', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.email}>{user.email}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewTaskForm(false)
                    setFormErrors({})
                    setNewTask({
                      title: '',
                      description: '',
                      status: 'pending',
                      priority: 'medium',
                      due_date: '',
                      assigned_to: ''
                    })
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 