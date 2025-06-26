import React, { useState } from 'react';
import './PDFAnalyzer.css';

const PDFAnalyzer = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF and DOCX files are supported';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 50MB';
    }

    return null;
  };

  const analyzeDocument = async () => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('document', file);

      const response = await fetch('/api/pdf/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setAnalysis(result.analysis);
        if (onAnalysisComplete) {
          onAnalysisComplete(result.analysis);
        }
      } else {
        setError(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('PDF analysis error:', error);
      setError('Failed to analyze document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetAnalyzer = () => {
    setFile(null);
    setAnalysis(null);
    setError(null);
    setUploading(false);
  };

  return (
    <div className="pdf-analyzer">
      <div className="pdf-analyzer-header">
        <h3>📄 Grant Document Analyzer</h3>
        <p>Upload a grant application or guidelines to extract tasks and requirements</p>
      </div>

      {!analysis && (
        <div className="upload-section">
          <div
            className={`drop-zone ${file ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf,.docx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {!file ? (
              <div className="drop-zone-content">
                <div className="upload-icon">📁</div>
                <p>Drag & drop your document here</p>
                <p>or</p>
                <label htmlFor="pdf-upload" className="upload-button">
                  Choose File
                </label>
                <div className="file-info">
                  <small>Supports PDF and DOCX files up to 50MB</small>
                </div>
              </div>
            ) : (
              <div className="file-selected">
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button 
                  className="remove-file"
                  onClick={() => setFile(null)}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {file && (
            <div className="action-buttons">
              <button
                className="analyze-button"
                onClick={analyzeDocument}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <div className="spinner"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🔍 Analyze Document
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
            </div>
          )}
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <div className="results-header">
            <h4>📊 Analysis Results</h4>
            <button className="reset-button" onClick={resetAnalyzer}>
              🔄 Analyze Another Document
            </button>
          </div>

          <div className="analysis-summary">
            <div className="summary-item">
              <span className="label">Document:</span>
              <span className="value">{analysis.filename}</span>
            </div>
            <div className="summary-item">
              <span className="label">Processed:</span>
              <span className="value">
                {new Date(analysis.processedAt).toLocaleString()}
              </span>
            </div>
            {analysis.mockData && (
              <div className="mock-notice">
                <span className="mock-badge">Demo Mode</span>
                <span>Using sample analysis data</span>
              </div>
            )}
          </div>

          {analysis.generatedTasks && analysis.generatedTasks.length > 0 && (
            <div className="generated-tasks">
              <h5>📋 Generated Tasks ({analysis.generatedTasks.length})</h5>
              <div className="tasks-list">
                {analysis.generatedTasks.map((task, index) => (
                  <div key={index} className="task-item">
                    <div className="task-header">
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority}
                      </span>
                      <span className={`category-badge ${task.category}`}>
                        {task.category}
                      </span>
                    </div>
                    <h6>{task.title}</h6>
                    <p>{task.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.strategic_elements && (
            <div className="strategic-elements">
              <h5>🎯 Strategic Elements</h5>
              <div className="elements-list">
                {analysis.strategic_elements.map((element, index) => (
                  <div key={index} className="element-item">
                    <div className="element-type">{element.type}</div>
                    <div className="element-content">{element.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.required_documents && (
            <div className="required-documents">
              <h5>📄 Required Documents</h5>
              <ul className="documents-list">
                {analysis.required_documents.map((doc, index) => (
                  <li key={index}>{doc}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.deadlines && (
            <div className="deadlines">
              <h5>⏰ Important Deadlines</h5>
              <div className="deadlines-list">
                {analysis.deadlines.map((deadline, index) => (
                  <div key={index} className="deadline-item">
                    <div className="deadline-title">{deadline.title}</div>
                    <div className="deadline-date">
                      {new Date(deadline.date).toLocaleDateString()}
                    </div>
                    <div className="deadline-description">{deadline.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFAnalyzer; 