import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchGrants } from '../utils/api'
import GrantFilterSidebar from './GrantFilterSidebar'
import GrantCard from './GrantCard'
import StickyNoteModal from './StickyNoteModal'
import './GrantList.css'

const GrantList = () => {
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedGrant, setSelectedGrant] = useState(null)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [grantNotes, setGrantNotes] = useState({})
  const limit = 12

  useEffect(() => {
    fetchGrants()
  }, [])

  const fetchGrants = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/grants')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setGrants(data.grants || [])
    } catch (err) {
      console.error('Error fetching grants:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredGrants = grants.filter(grant => {
    const matchesSearch = grant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grant.funder?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || 
                           grant.category?.toLowerCase() === filterCategory.toLowerCase() ||
                           grant.type?.toLowerCase() === filterCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...new Set(grants.map(g => g.category || g.type).filter(Boolean))]

  const handleViewDetails = (grantId) => {
    window.location.href = `/grants/${grantId}`
  }

  const handleFlagGrant = (grantId) => {
    // TODO: Implement flag functionality
    console.log('Flagging grant:', grantId)
  }

  const handleSaveGrant = (grantId) => {
    // TODO: Implement save functionality
    console.log('Saving grant:', grantId)
  }

  const handleAddNote = (grantId) => {
    setSelectedGrant(grants.find(g => g.id === grantId))
    setIsNoteModalOpen(true)
  }

  const handleSaveNote = async (grantId, note) => {
    // TODO: Implement note saving to backend
    setGrantNotes(prev => ({
      ...prev,
      [grantId]: note
    }))
    console.log('Saving note for grant:', grantId, note)
  }

  if (loading) {
    return (
      <div className="grant-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading grants...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grant-list-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Grants</h3>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={fetchGrants}>
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="grant-list">
      <div className="grant-list-header">
        <div className="header-content">
          <h1>Grant Discovery</h1>
          <p>Explore funding opportunities for your creative projects</p>
        </div>
        
        <div className="grant-list-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search grants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grant-list-stats">
        <span className="stats-text">
          Showing {filteredGrants.length} of {grants.length} grants
        </span>
      </div>

      {filteredGrants.length > 0 ? (
        <div className="grants-grid">
          {filteredGrants.map((grant) => (
            <GrantCard
              key={grant.id}
              grant={grant}
              onViewDetails={handleViewDetails}
              onFlag={handleFlagGrant}
              onSave={handleSaveGrant}
              isFlagged={false}
              isSaved={false}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">��</div>
          <h3>No Grants Found</h3>
          <p>Try adjusting your search terms or filters.</p>
          <button 
            className="btn btn-outline"
            onClick={() => {
              setSearchTerm('')
              setFilterCategory('all')
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Sticky Note Modal */}
      <StickyNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        grantId={selectedGrant?.id}
        initialNote={grantNotes[selectedGrant?.id] || ''}
        onSaveNote={handleSaveNote}
        grantTitle={selectedGrant?.name || selectedGrant?.title}
      />
    </div>
  )
}

export default GrantList 