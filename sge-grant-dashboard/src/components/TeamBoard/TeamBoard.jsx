import React, { useState, useEffect } from 'react';
import './TeamBoard.css';

const TeamBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers] = useState([
    { id: 'alan', name: 'Alan', role: 'Legal & Rights', avatar: '👨‍💼' },
    { id: 'ursula', name: 'Ursula', role: 'Admin & Submissions', avatar: '👩‍💼' },
    { id: 'sham', name: 'Sham', role: 'Finance & Budget', avatar: '👨‍💰' },
    { id: 'ash', name: 'Ash', role: 'Creative & Team', avatar: '👩‍🎨' },
    { id: 'maggie', name: 'Maggie', role: 'First Nations', avatar: '👩‍🏫' },
    { id: 'jordan', name: 'Jordan', role: 'Diversity & Inclusion', avatar: '👨‍🎓' }
  ]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const assignTask = async (taskId, assigneeId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: assigneeId })
      });
      
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error assigning task:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        loadTasks();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getTasksByMember = (memberId) => {
    return tasks.filter(task => task.assigned_to === memberId);
  };

  const getUnassignedTasks = () => {
    return tasks.filter(task => !task.assigned_to || task.assigned_to === '');
  };

  return (
    <div className="team-board">
      <div className="board-header">
        <h2>👥 Team Collaboration Board</h2>
        <p>Assign and track grant application tasks across your team</p>
      </div>

      <div className="team-columns">
        {/* Unassigned Tasks Column */}
        <div className="team-column unassigned-column">
          <div className="column-header">
            <h3>📋 Unassigned Tasks</h3>
            <span className="task-count">{getUnassignedTasks().length}</span>
          </div>
          <div className="task-list">
            {getUnassignedTasks().map(task => (
              <div key={task.id} className="task-card unassigned">
                <div className="task-header">
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority}
                  </span>
                  <span className="category-badge">{task.category}</span>
                </div>
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <div className="task-actions">
                  <select 
                    onChange={(e) => assignTask(task.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Assign to...</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Member Columns */}
        {teamMembers.map(member => (
          <div key={member.id} className="team-column member-column">
            <div className="column-header">
              <div className="member-info">
                <span className="member-avatar">{member.avatar}</span>
                <div>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
              <span className="task-count">{getTasksByMember(member.id).length}</span>
            </div>
            
            <div className="task-list">
              {getTasksByMember(member.id).map(task => (
                <div key={task.id} className={`task-card ${task.status}`}>
                  <div className="task-header">
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                    <span className="category-badge">{task.category}</span>
                  </div>
                  <h4>{task.title}</h4>
                  <p>{task.description}</p>
                  <div className="task-meta">
                    {task.estimated_hours && (
                      <span className="time-estimate">⏱️ {task.estimated_hours}h</span>
                    )}
                    {task.source && (
                      <span className="task-source">📄 {task.source}</span>
                    )}
                  </div>
                  <div className="task-status-controls">
                    <select 
                      value={task.status} 
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamBoard;
