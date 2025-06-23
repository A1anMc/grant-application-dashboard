import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchGrants } from '../utils/api'
import GrantFilterSidebar from './GrantFilterSidebar'
import GrantCard from './GrantCard'
import StickyNoteModal from './StickyNoteModal'
import './GrantList.css'

export default function GrantList() {
  const [grants, setGrants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    eligibility: 'All',
    tags: [],
    amountRange: [0, 1000000]
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedGrant, setSelectedGrant] = useState(null)
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [grantNotes, setGrantNotes] = useState({})
  const limit = 12

  // Extract unique categories and tags from grants
  const categories = [...new Set(grants.map(g => g.category || g.type || 'General'))]
  const allTags = grants.reduce((tags, grant) => {
    if (grant.tags) {
      tags.push(...grant.tags)
    }
    return tags
  }, [])
  const uniqueTags = [...new Set(allTags)]

  useEffect(() => {
    const loadGrants = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const apiFilters = {
          tag: filters.tags.join(','),
          eligibility: filters.eligibility === 'All' ? '' : filters.eligibility,
          search: filters.search,
          page,
          limit
        };
        
        console.log('Fetching grants with filters:', apiFilters);
        const data = await fetchGrants(apiFilters);
        console.log('Received grants data:', data);
        
        // Handle both array and object responses
        const grantsData = Array.isArray(data) ? data : (data.grants || data.data || []);
        const total = data.total || data.length || grantsData.length;
        
        setGrants(grantsData);
        setTotalPages(Math.ceil(total / limit));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching grants:', error);
        setError('Failed to load grants. Please try again.');
        setGrants([]);
        setLoading(false);
      }
    };

    loadGrants();
  }, [filters, page]);

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

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      eligibility: 'All',
      tags: [],
      amountRange: [0, 1000000]
    })
    setPage(1)
  }

  if (error) {
    return (
      <div className="grant-list">
        <h2>Grants Database</h2>
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grant-list">
      <div className="grant-list-header">
        <h2>🎬 Grant Discovery</h2>
        <p>Find your perfect creative funding opportunity</p>
      </div>

      <div className="grant-list-content">
        {/* Filter Sidebar */}
        <GrantFilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          categories={categories}
          tags={uniqueTags}
        />

        {/* Main Content */}
        <div className="grants-content">
          {/* Results Header */}
          <div className="results-header">
            <div className="results-info">
              <h3>Found {grants.length} grant{grants.length !== 1 ? 's' : ''}</h3>
              {Object.values(filters).some(v => v !== '' && v !== 'All' && (!Array.isArray(v) || v.length > 0)) && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear All Filters
                </button>
              )}
            </div>
            
            <div className="view-options">
              <button className="view-option active">Cards</button>
              <button className="view-option">List</button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grants-loading">
              <div className="loading-spinner"></div>
              <p>Discovering grants...</p>
            </div>
          ) : grants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h4>No funding found... yet.</h4>
              <p>Try adjusting your filters or check back later for new opportunities.</p>
              <button onClick={clearFilters} className="btn-primary">
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Grants Grid */}
              <div className="grants-grid">
                {grants.map(grant => (
                  <GrantCard
                    key={grant.id}
                    grant={{
                      id: grant.id,
                      title: grant.name || grant.title,
                      description: grant.description || grant.summary || 'No description available',
                      amount: grant.amount || grant.amount_string || 'TBD',
                      deadline: new Date(grant.deadline || grant.due_date).toLocaleDateString(),
                      category: grant.category || grant.type || 'General',
                      eligibility: grant.eligibility,
                      tags: grant.tags || [],
                      source: grant.funder || 'Unknown',
                      sourceVerified: grant.source_verified || false
                    }}
                    onViewDetails={handleViewDetails}
                    onFlag={handleFlagGrant}
                    onSave={handleSaveGrant}
                    isFlagged={false} // TODO: Get from state
                    isSaved={false} // TODO: Get from state
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setPage(p => Math.max(p - 1, 1))} 
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    ← Previous
                  </button>
                  <div className="page-info">
                    Page {page} of {totalPages}
                  </div>
                  <button 
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                    disabled={page === totalPages}
                    className="pagination-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

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