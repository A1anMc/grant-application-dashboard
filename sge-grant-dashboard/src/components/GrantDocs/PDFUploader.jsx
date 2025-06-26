import React, { useState } from 'react';
import './PDFUploader.css';

const PDFUploader = ({ onAnalysisComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/pdf/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysisResult(result);
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
      } else {
        alert('Analysis failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  return (
    <div className="pdf-uploader">
      <div className="upload-header">
        <h3>📄 Grant Document Analysis</h3>
        <p>Upload a PDF grant application to extract tasks and requirements</p>
      </div>

      <div className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
           onDrop={handleDrop}
           onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
           onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}>
        {uploading ? (
          <div className="upload-progress">
            <div className="spinner"></div>
            <p>Analyzing PDF document...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📁</div>
            <p>Drag & drop your PDF here, or</p>
            <label className="file-select-btn">
              Choose File
              <input type="file" accept=".pdf" onChange={handleFileSelect} hidden />
            </label>
          </div>
        )}
      </div>

      {analysisResult && (
        <div className="analysis-results">
          <h4>📊 Analysis Results</h4>
          <div className="results-summary">
            <div className="stat">
              <span className="stat-number">{analysisResult.analysis.tasks.length}</span>
              <span className="stat-label">Tasks</span>
            </div>
            <div className="stat">
              <span className="stat-number">{analysisResult.analysis.sections.length}</span>
              <span className="stat-label">Sections</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
