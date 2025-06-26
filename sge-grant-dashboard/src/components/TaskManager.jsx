import React, { useState, useEffect } from 'react';
import './TaskManager.css';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'Application',
    priority: 'medium'
  });

  const priorities = ['low', 'medium', 'high', 'critical'];
  const categories = ['Application', 'Documentation', 'Writing', 'Research', 'Strategic', 'Follow-up'];
  const statuses = ['todo', 'in-progress', 'completed', 'blocked'];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
      } else {
        setError('Failed to load tasks');
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      const data = await response.json();
      
      if (data.success) {
        setTasks([...tasks, data.task]);
        setNewTask({ title: '', description: '', category: 'Application', priority: 'medium' });
        setShowAddForm(false);
      } else {
        setError('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      setError('Failed to add task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setTasks(tasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7c2d12'
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Application': '📝',
      'Documentation': '📄',
      'Writing': '✍️',
      'Research': '🔍',
      'Strategic': '🎯',
      'Follow-up': '📞'
    };
    return icons[category] || '📋';
  };

  if (loading) {
    return (
      <div className="task-manager">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-manager">
      <div className="task-manager-header">
        <div className="header-content">
          <h3>📋 Task Management</h3>
          <p>Organize and track your grant application tasks</p>
        </div>
        <button 
          className="add-task-button"
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add Task
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {showAddForm && (
        <div className="add-task-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>Add New Task</h4>
              <button 
                className="close-button"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="form-group">
              <label>Task Title *</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title..."
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Task description (optional)..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button 
                className="save-button"
                onClick={addTask}
                disabled={!newTask.title.trim()}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="task-stats">
        <div className="stat-item">
          <div className="stat-number">{tasks.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{getTasksByStatus('todo').length}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{getTasksByStatus('in-progress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{getTasksByStatus('completed').length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="task-columns">
        {statuses.map(status => (
          <div key={status} className="task-column">
            <div className="column-header">
              <h4>
                {status === 'todo' && '📝 To Do'}
                {status === 'in-progress' && '🔄 In Progress'}
                {status === 'completed' && '✅ Completed'}
                {status === 'blocked' && '🚫 Blocked'}
              </h4>
              <span className="task-count">
                {getTasksByStatus(status).length}
              </span>
            </div>

            <div className="tasks-list">
              {getTasksByStatus(status).map(task => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <div className="task-meta">
                      <span className="category-icon">
                        {getCategoryIcon(task.category)}
                      </span>
                      <span className="category-name">{task.category}</span>
                    </div>
                    <div 
                      className="priority-indicator"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                      title={`Priority: ${task.priority}`}
                    ></div>
                  </div>

                  <h5 className="task-title">{task.title}</h5>
                  
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}

                  <div className="task-actions">
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="status-select"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      className="delete-task"
                      onClick={() => deleteTask(task.id)}
                      title="Delete task"
                    >
                      🗑️
                    </button>
                  </div>

                  {task.created_at && (
                    <div className="task-date">
                      Created: {new Date(task.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}

              {getTasksByStatus(status).length === 0 && (
                <div className="empty-column">
                  <p>No {status.replace('-', ' ')} tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager; 