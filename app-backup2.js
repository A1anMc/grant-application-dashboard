// SGE Grant Portal - Enhanced Application Logic
class GrantPortal {
    constructor() {
        this.grants = [];
        this.filteredGrants = [];
        this.currentView = 'grid';
        this.selectedTags = new Set();
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadGrants();
        this.updateStatistics();
    }

    setupEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const eligibilityFilter = document.getElementById('eligibilityFilter');
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');
        const tagFilters = document.getElementById('tagFilters');

        searchBtn.addEventListener('click', () => this.handleSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        statusFilter.addEventListener('change', () => this.handleSearch());
        eligibilityFilter.addEventListener('change', () => this.handleSearch());
        gridViewBtn.addEventListener('click', () => this.setView('grid'));
        listViewBtn.addEventListener('click', () => this.setView('list'));

        // Tag filter event listeners
        tagFilters.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-filter')) {
                this.toggleTagFilter(e.target);
            }
        });
    }

    toggleTagFilter(tagButton) {
        const tag = tagButton.dataset.tag;
        
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
            tagButton.classList.remove('active');
        } else {
            this.selectedTags.add(tag);
            tagButton.classList.add('active');
        }
        
        this.handleSearch();
    }

    async loadGrants() {
        const container = document.getElementById('grantsContainer');
        const loadingEl = document.getElementById('searchLoading');
        
        container.innerHTML = '<div class="loading">Loading grants...</div>';
        loadingEl.style.display = 'inline-block';

        try {
            const response = await fetch('/api/grants');
            const data = await response.json();
            
            this.grants = data.grants || [];
            this.filteredGrants = [...this.grants];
            
            this.renderGrants();
            this.updateStatistics();
        } catch (error) {
            console.error('Error loading grants:', error);
            container.innerHTML = `
                <div class="card">
                    <h3>Error Loading Grants</h3>
                    <p>Unable to load grants at this time. Please try again later.</p>
                    <button class="btn-primary" onclick="grantPortal.loadGrants()">Retry</button>
                </div>
            `;
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const statusFilter = document.getElementById('statusFilter').value;
        const eligibilityFilter = document.getElementById('eligibilityFilter').value;
        
        this.filteredGrants = this.grants.filter(grant => {
            const matchesSearch = !searchTerm || 
                grant.name.toLowerCase().includes(searchTerm) ||
                grant.funder.toLowerCase().includes(searchTerm) ||
                grant.description.toLowerCase().includes(searchTerm) ||
                grant.status.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || grant.status.toLowerCase() === statusFilter.toLowerCase();
            const matchesEligibility = !eligibilityFilter || 
                (grant.eligibility && grant.eligibility.category === eligibilityFilter);
            
            const matchesTags = this.selectedTags.size === 0 || 
                (grant.tags && grant.tags.some(tag => this.selectedTags.has(tag)));
            
            return matchesSearch && matchesStatus && matchesEligibility && matchesTags;
        });
        
        this.renderGrants();
        this.updateStatistics();
    }

    updateStatistics() {
        const total = this.grants.length;
        const eligible = this.grants.filter(g => g.eligibility && g.eligibility.category === 'eligible').length;
        const auspice = this.grants.filter(g => g.eligibility && g.eligibility.category === 'eligible_with_auspice').length;
        const notEligible = this.grants.filter(g => g.eligibility && g.eligibility.category === 'not_eligible').length;

        document.getElementById('totalGrants').textContent = total;
        document.getElementById('eligibleGrants').textContent = eligible;
        document.getElementById('auspiceGrants').textContent = auspice;
        document.getElementById('notEligibleGrants').textContent = notEligible;

        this.animateNumbers();
    }

    animateNumbers() {
        const numbers = document.querySelectorAll('.stat-number');
        numbers.forEach(number => {
            const finalValue = parseInt(number.textContent);
            let currentValue = 0;
            const increment = finalValue / 20;
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
                number.textContent = Math.floor(currentValue);
            }, 50);
        });
    }

    setView(view) {
        this.currentView = view;
        const container = document.getElementById('grantsContainer');
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');

        gridViewBtn.classList.toggle('btn-primary', view === 'grid');
        gridViewBtn.classList.toggle('btn-secondary', view !== 'grid');
        listViewBtn.classList.toggle('btn-primary', view === 'list');
        listViewBtn.classList.toggle('btn-secondary', view !== 'list');

        container.className = view === 'grid' ? 'grants-grid' : 'grants-list';
        
        this.renderGrants();
    }

    renderGrants() {
        const container = document.getElementById('grantsContainer');
        
        if (this.filteredGrants.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h3>No Grants Found</h3>
                    <p>No grants match your search criteria. Try adjusting your search terms, filters, or tags.</p>
                    <button class="btn-primary" onclick="grantPortal.clearFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredGrants.map(grant => this.createGrantCard(grant)).join('');
    }

    createGrantCard(grant) {
        const statusClass = this.getStatusClass(grant.status);
        const eligibilityClass = grant.eligibility ? grant.eligibility.category : 'not_eligible';
        const formattedAmount = this.formatAmount(grant.amount_string);
        const formattedDate = this.formatDate(grant.due_date);
        const daysUntilDue = this.getDaysUntilDue(grant.due_date);

        return `
            <div class="grant-card slide-up hover-lift">
                <div class="grant-header">
                    <h3 class="grant-title">${this.escapeHtml(grant.name)}</h3>
                    <span class="badge ${eligibilityClass}">${this.getEligibilityLabel(grant.eligibility)}</span>
                </div>
                <p class="grant-funder">${this.escapeHtml(grant.funder)}</p>
                <p class="grant-amount">${formattedAmount}</p>
                <p class="grant-due ${this.getDueDateClass(daysUntilDue)}">
                    Due: ${formattedDate}
                    ${daysUntilDue !== null ? `<span class="due-indicator">(${daysUntilDue} days)</span>` : ''}
                </p>
                <p class="grant-description">${this.escapeHtml(grant.description)}</p>
                
                ${grant.tags && grant.tags.length > 0 ? `
                    <div class="grant-tags">
                        ${grant.tags.map(tag => `<span class="grant-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
                
                ${grant.eligibility ? `
                    <div class="eligibility-details">
                        <div class="eligibility-confidence">
                            Confidence: ${Math.round(grant.eligibility.confidence * 100)}%
                        </div>
                        <div class="eligibility-reasoning">
                            ${this.escapeHtml(grant.eligibility.reasoning || grant.eligibility.details?.reasoning || 'No reasoning available')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="grant-meta">
                    <div class="grant-actions">
                        <button class="btn-secondary" onclick="grantPortal.viewGrantDetails('${grant.id}')">
                            View Details
                        </button>
                        <button class="btn-primary" onclick="grantPortal.applyForGrant('${grant.id}')">
                            Apply Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getEligibilityLabel(eligibility) {
        if (!eligibility) return 'Not Assessed';
        
        switch (eligibility.category) {
            case 'eligible':
                return 'Eligible';
            case 'eligible_with_auspice':
                return 'Eligible with Auspice';
            case 'not_eligible':
                return 'Not Eligible';
            default:
                return 'Not Assessed';
        }
    }

    getStatusClass(status) {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('eligible') || statusLower.includes('open') || statusLower.includes('potential')) {
            return 'eligible';
        } else if (statusLower.includes('pending') || statusLower.includes('review') || statusLower.includes('drafting')) {
            return 'pending';
        } else {
            return 'closed';
        }
    }

    getDaysUntilDue(dateString) {
        if (!dateString) return null;
        
        try {
            const dueDate = new Date(dateString);
            const today = new Date();
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            return null;
        }
    }

    getDueDateClass(daysUntilDue) {
        if (daysUntilDue === null) return '';
        if (daysUntilDue < 0) return 'overdue';
        if (daysUntilDue <= 7) return 'urgent';
        if (daysUntilDue <= 30) return 'soon';
        return '';
    }

    formatAmount(amountString) {
        if (!amountString) return 'Amount not specified';
        return amountString.replace(/\s+/g, ' ').trim();
    }

    formatDate(dateString) {
        if (!dateString) return 'Date not specified';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('eligibilityFilter').value = '';
        
        // Clear tag filters
        this.selectedTags.clear();
        document.querySelectorAll('.tag-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.handleSearch();
    }

    viewGrantDetails(grantId) {
        const grant = this.grants.find(g => g.id === grantId);
        if (!grant) return;

        const details = `
Grant Details: ${grant.name}

Funder: ${grant.funder}
Amount: ${grant.amount_string}
Due: ${grant.due_date}
Status: ${grant.status}
Eligibility: ${this.getEligibilityLabel(grant.eligibility)}
${grant.eligibility ? `Confidence: ${Math.round(grant.eligibility.confidence * 100)}%` : ''}

Description: ${grant.description}

${grant.tags && grant.tags.length > 0 ? `Tags: ${grant.tags.join(', ')}` : ''}
${grant.eligibility ? `Reasoning: ${grant.eligibility.reasoning || grant.eligibility.details?.reasoning || 'No reasoning available'}` : ''}
        `;

        alert(details);
    }

    applyForGrant(grantId) {
        const grant = this.grants.find(g => g.id === grantId);
        if (!grant) return;

        alert(`Application started for: ${grant.name}\n\nThis would open the application form in a new window.`);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.grantPortal = new GrantPortal();
});

// Add smooth scrolling and enhanced UX
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.header');
    header.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    const slideUpElements = document.querySelectorAll('.slide-up');
    slideUpElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
    });
});
