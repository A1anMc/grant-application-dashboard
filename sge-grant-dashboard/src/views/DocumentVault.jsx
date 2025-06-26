import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import './DocumentVault.css';

const DocumentVault = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'application', label: 'Application Documents' },
    { value: 'financial', label: 'Financial' },
    { value: 'legal', label: 'Legal' },
    { value: 'supporting', label: 'Supporting Materials' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory, selectedTag]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);

      const response = await api.get(`/documents?${params.toString()}`);
      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files, metadata) => {
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('description', metadata.description || '');
        formData.append('category', metadata.category || 'general');
        formData.append('tags', metadata.tags || '');
        if (metadata.grantId) formData.append('grantId', metadata.grantId);

        const response = await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      });

      await Promise.all(uploadPromises);
      setShowUploadModal(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (documentId, filename) => {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await api.delete(`/documents/${documentId}`);
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      case 'txt': return '📃';
      default: return '📎';
    }
  };

  const allTags = [...new Set(documents.flatMap(doc => doc.tags || []))];

  return (
    <div className="document-vault">
      <div className="vault-header">
        <div className="header-left">
          <h1>📁 Document Vault</h1>
          <p>Manage your grant-related documents with versioning and tagging</p>
        </div>
        <button 
          className="upload-btn"
          onClick={() => setShowUploadModal(true)}
        >
          📤 Upload Documents
        </button>
      </div>

      <div className="vault-controls">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="vault-stats">
        <div className="stat-card">
          <span className="stat-number">{documents.length}</span>
          <span className="stat-label">Total Documents</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
          </span>
          <span className="stat-label">Total Size</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{categories.length - 1}</span>
          <span className="stat-label">Categories</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{allTags.length}</span>
          <span className="stat-label">Tags</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading documents...</p>
        </div>
      ) : (
        <div className="documents-grid">
          {filteredDocuments.map(doc => (
            <div key={doc.id} className="document-card">
              <div className="document-header">
                <div className="file-icon">{getFileIcon(doc.filename)}</div>
                <div className="document-info">
                  <h3 className="document-name">{doc.filename}</h3>
                  <p className="document-description">{doc.description}</p>
                </div>
                <div className="document-actions">
                  <button
                    onClick={() => handleDownload(doc.id, doc.filename)}
                    className="action-btn download"
                    title="Download"
                  >
                    📥
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="action-btn delete"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="document-meta">
                <div className="meta-row">
                  <span className="meta-label">Size:</span>
                  <span className="meta-value">{formatFileSize(doc.size)}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Category:</span>
                  <span className="meta-value">{doc.category}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Uploaded:</span>
                  <span className="meta-value">
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {doc.tags && doc.tags.length > 0 && (
                <div className="document-tags">
                  {doc.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No documents found</h3>
          <p>Upload your first document or adjust your search filters</p>
          <button 
            className="upload-btn"
            onClick={() => setShowUploadModal(true)}
          >
            📤 Upload Documents
          </button>
        </div>
      )}

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
          uploading={uploading}
          categories={categories}
        />
      )}
    </div>
  );
};

const UploadModal = ({ onClose, onUpload, uploading, categories }) => {
  const [files, setFiles] = useState([]);
  const [metadata, setMetadata] = useState({
    description: '',
    category: 'general',
    tags: ''
  });
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please select files to upload');
      return;
    }
    onUpload(files, metadata);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Upload Documents</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div
            className={`drop-zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="file-input"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <div className="drop-zone-content">
              <div className="upload-icon">📤</div>
              <p>Drag and drop files here, or click to select</p>
              <p className="file-types">Supported: PDF, DOC, DOCX, TXT, JPG, PNG</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="selected-files">
              <h3>Selected Files ({files.length})</h3>
              <ul>
                {files.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="metadata-section">
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={metadata.description}
                onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
                placeholder="Brief description of these documents..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                >
                  {categories.filter(cat => cat.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={metadata.tags}
                  onChange={(e) => setMetadata({ ...metadata, tags: e.target.value })}
                  placeholder="grant-application, budget, supporting-docs"
                />
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="upload-btn" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentVault; 