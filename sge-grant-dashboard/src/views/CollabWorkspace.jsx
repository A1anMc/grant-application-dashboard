import React, { useState } from 'react';
import PDFUploader from '../components/GrantDocs/PDFUploader';
import TeamBoard from '../components/TeamBoard/TeamBoard';
import './CollabWorkspace.css';

const CollabWorkspace = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [projectTasks, setProjectTasks] = useState([]);

  const handlePDFAnalysis = async (analysisResult) => {
    console.log('PDF Analysis completed:', analysisResult);
    
    // Convert analysis to tasks
    try {
      const response = await fetch('/api/tasks/from-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: analysisResult.analysis,
          project_name: analysisResult.metadata.filename
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setProjectTasks(result.tasks);
        setActiveTab('team'); // Switch to team view
        alert(`✅ Created ${result.count} tasks from PDF analysis!`);
      }
    } catch (error) {
      console.error('Error creating tasks:', error);
      alert('Failed to create tasks from PDF analysis');
    }
  };

  return (
    <div className="collab-workspace">
      <div className="workspace-header">
        <h1>🏢 Collaborative Workspace</h1>
        <p>Upload grant documents, extract tasks, and collaborate with your team</p>
      </div>

      <div className="workspace-tabs">
        <button 
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          📄 Documents
        </button>
        <button 
          className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          👥 Team Board
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          �� Analytics
        </button>
      </div>

      <div className="workspace-content">
        {activeTab === 'documents' && (
          <div className="documents-section">
            <PDFUploader onAnalysisComplete={handlePDFAnalysis} />
            
            <div className="document-features">
              <div className="feature-card">
                <h3>🤖 AI-Powered Analysis</h3>
                <p>Extract tasks, requirements, and deadlines from grant PDFs automatically</p>
                <ul>
                  <li>Task extraction and categorization</li>
                  <li>Priority assessment</li>
                  <li>Time estimation</li>
                  <li>Section mapping</li>
                </ul>
              </div>
              
              <div className="feature-card">
                <h3>📋 Smart Task Creation</h3>
                <p>Convert PDF analysis into actionable tasks for your team</p>
                <ul>
                  <li>Automatic task assignment suggestions</li>
                  <li>Category-based organization</li>
                  <li>Deadline tracking</li>
                  <li>Progress monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="team-section">
            <TeamBoard />
            
            {projectTasks.length > 0 && (
              <div className="recent-tasks">
                <h3>📋 Recently Created Tasks</h3>
                <div className="task-grid">
                  {projectTasks.slice(0, 6).map(task => (
                    <div key={task.id} className="task-preview">
                      <h4>{task.title}</h4>
                      <p>{task.category} • {task.priority} priority</p>
                      <span className="task-hours">⏱️ {task.estimated_hours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <div className="analytics-grid">
              <div className="analytics-card">
                <h3>📊 Team Workload</h3>
                <p>Coming soon: Visual workload distribution across team members</p>
              </div>
              
              <div className="analytics-card">
                <h3>⏰ Project Timeline</h3>
                <p>Coming soon: Gantt charts and deadline tracking</p>
              </div>
              
              <div className="analytics-card">
                <h3>📈 Progress Tracking</h3>
                <p>Coming soon: Task completion rates and velocity metrics</p>
              </div>
              
              <div className="analytics-card">
                <h3>🎯 Goal Achievement</h3>
                <p>Coming soon: Grant application milestone tracking</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollabWorkspace;
