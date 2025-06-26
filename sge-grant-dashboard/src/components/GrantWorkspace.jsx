import React, { useState } from 'react';
import PDFAnalyzer from './PDFAnalyzer';
import TaskManager from './TaskManager';
import './GrantWorkspace.css';

const GrantWorkspace = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalysisComplete = (analysis) => {
    setAnalysisData(analysis);
    
    // If tasks were generated, switch to task management tab
    if (analysis.generatedTasks && analysis.generatedTasks.length > 0) {
      setActiveTab('tasks');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analyze', label: 'Document Analysis', icon: '📄' },
    { id: 'tasks', label: 'Task Management', icon: '📋' },
  ];

  return (
    <div className="grant-workspace">
      <div className="workspace-header">
        <div className="header-content">
          <h2>🎯 Grant Application Workspace</h2>
          <p>Analyze documents, manage tasks, and streamline your grant application process</p>
        </div>
      </div>

      <div className="workspace-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="workspace-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="overview-card">
                <div className="card-header">
                  <h3>📄 Document Analysis</h3>
                  <div className="card-icon">📄</div>
                </div>
                <p>Upload grant applications or guidelines to automatically extract tasks and requirements.</p>
                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-value">{analysisData ? '1' : '0'}</span>
                    <span className="stat-label">Documents Analyzed</span>
                  </div>
                  {analysisData && (
                    <div className="stat">
                      <span className="stat-value">
                        {analysisData.generatedTasks ? analysisData.generatedTasks.length : 0}
                      </span>
                      <span className="stat-label">Tasks Generated</span>
                    </div>
                  )}
                </div>
                <button 
                  className="card-action"
                  onClick={() => setActiveTab('analyze')}
                >
                  Analyze Document
                </button>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <h3>📋 Task Management</h3>
                  <div className="card-icon">📋</div>
                </div>
                <p>Organize and track all your grant application tasks in one place.</p>
                <div className="card-stats">
                  <div className="stat">
                    <span className="stat-value">3</span>
                    <span className="stat-label">Active Tasks</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">1</span>
                    <span className="stat-label">In Progress</span>
                  </div>
                </div>
                <button 
                  className="card-action"
                  onClick={() => setActiveTab('tasks')}
                >
                  Manage Tasks
                </button>
              </div>

              <div className="overview-card">
                <div className="card-header">
                  <h3>🔗 Integration</h3>
                  <div className="card-icon">🔗</div>
                </div>
                <p>Seamlessly integrated with Grant IQ Pro's discovery and analytics features.</p>
                <div className="integration-status">
                  <div className="status-item">
                    <span className="status-indicator active"></span>
                    <span>Grant Discovery</span>
                  </div>
                  <div className="status-item">
                    <span className="status-indicator active"></span>
                    <span>Task Planning</span>
                  </div>
                  <div className="status-item">
                    <span className="status-indicator active"></span>
                    <span>Analytics</span>
                  </div>
                </div>
                <button className="card-action secondary">
                  View Integration
                </button>
              </div>
            </div>

            {analysisData && (
              <div className="recent-analysis">
                <h3>📊 Recent Analysis</h3>
                <div className="analysis-summary-card">
                  <div className="summary-header">
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <div>
                        <h4>{analysisData.filename}</h4>
                        <p>Analyzed {new Date(analysisData.processedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {analysisData.mockData && (
                      <span className="demo-badge">Demo</span>
                    )}
                  </div>
                  
                  <div className="summary-stats">
                    {analysisData.generatedTasks && (
                      <div className="summary-stat">
                        <span className="stat-number">{analysisData.generatedTasks.length}</span>
                        <span className="stat-text">Tasks Generated</span>
                      </div>
                    )}
                    {analysisData.strategic_elements && (
                      <div className="summary-stat">
                        <span className="stat-number">{analysisData.strategic_elements.length}</span>
                        <span className="stat-text">Strategic Elements</span>
                      </div>
                    )}
                    {analysisData.required_documents && (
                      <div className="summary-stat">
                        <span className="stat-number">{analysisData.required_documents.length}</span>
                        <span className="stat-text">Required Documents</span>
                      </div>
                    )}
                  </div>

                  <div className="summary-actions">
                    <button 
                      className="view-analysis-btn"
                      onClick={() => setActiveTab('analyze')}
                    >
                      View Full Analysis
                    </button>
                    <button 
                      className="view-tasks-btn"
                      onClick={() => setActiveTab('tasks')}
                    >
                      View Generated Tasks
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="getting-started">
              <h3>🚀 Getting Started</h3>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Upload Document</h4>
                    <p>Upload a grant application or guidelines PDF to get started</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Review Analysis</h4>
                    <p>Review the extracted tasks and strategic elements</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Manage Tasks</h4>
                    <p>Organize and track your application progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="analyze-tab">
            <PDFAnalyzer onAnalysisComplete={handleAnalysisComplete} />
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-tab">
            <TaskManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default GrantWorkspace; 