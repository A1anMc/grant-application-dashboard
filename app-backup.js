// SGE Grant Portal - Enhanced Application Logic
class GrantPortal {
    constructor() {
        this.grants = [];
        this.filteredGrants = [];
        this.currentView = 'grid';
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
        const gridViewBtn = document.getElementById('gridView');
        const listViewBtn = document.getElementById('listView');

        searchBtn.addEventListener('click', () => this.handleSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
        statusFilter.addEventListener('change', () => this.handleSearch());
        gridViewBtn.addEventListener('click', () => this.setView('grid'));
        listViewBtn.addEventListener('click', () => this.setView('list'));
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
        
        this.filteredGrants = this.grants.filter(grant => {
            const matchesSearch = !searchTerm || 
                grant.name.toLowerCase().includes(searchTerm) ||
                grant.funder.toLowerCase().includes(searchTerm) ||
                grant.description.toLowerCase().includes(searchTerm) ||
                grant.status.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || grant.status.toLowerCase() === statusFilter.toLowerCase();
            
            return matchesSearch && matchesStatus;
        });
        
        this.renderGrants();
        this.updateStatistics();
    }

    updateStatistics() {
        const total = this.grants.length;
        const potential = this.grants.filter(g => g.status.toLowerCase() === 'potential').length;
        const inProgress = this.grants.filter(g => g.status.toLowerCase() === 'drafting').length;
        const submitted = this.grants.filter(g => g.status.toLowerCase() === 'submitted').length;

        document.getElementById('totalGrants').textContent = total;
        document.getElementById('potentialGrants').textContent = potential;
        document.getElementById('inProgressGrants').textContent = inProgress;
        document.getElementById('submittedGrants').textContent = submitted;

        // Add animation to statistics
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

        // Update button states
        gridViewBtn.classList.toggle('btn-primary', view === 'grid');
        gridViewBtn.classList.toggle('btn-secondary', view !== 'grid');
        listViewBtn.classList.toggle('btn-primary', view === 'list');
        listViewBtn.classList.toggle('btn-secondary', view !== 'list');

        // Update container class
        container.className = view === 'grid' ? 'grants-grid' : 'grants-list';
        
        this.renderGrants();
    }

    renderGrants() {
        const container = document.getElementById('grantsContainer');
        
        if (this.filteredGrants.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h3>No Grants Found</h3>
                    <p>No grants match your search criteria. Try adjusting your search terms or status filter.</p>
                    <button class="btn-primary" onclick="grantPortal.clearFilters()">Clear Filters</button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredGrants.map(grant => this.createGrantCard(grant)).join('');
    }

    createGrantCard(grant) {
        const statusClass = this.getStatusClass(grant.status);
        const formattedAmount = this.formatAmount(grant.amount_string);
        const formattedDate = this.formatDate(grant.due_date);
        const daysUntilDue = this.getDaysUntilDue(grant.due_date);

        return `
            <div class="grant-card slide-up hover-lift">
                <div class="grant-header">
                    <h3 class="grant-title">${this.escapeHtml(grant.name)}</h3>
                    <span class="badge ${statusClass}">${grant.status}</span>
                </div>
                <p class="grant-funder">${this.escapeHtml(grant.funder)}</p>
                <p class="grant-amount">${formattedAmount}</p>
                <p class="grant-due ${this.getDueDateClass(daysUntilDue)}">
                    Due: ${formattedDate}
                    ${daysUntilDue !== null ? `<span class="due-indicator">(${daysUntilDue} days)</span>` : ''}
                </p>
                <p class="grant-description">${this.escapeHtml(grant.description)}</p>
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
        this.handleSearch();
    }

    viewGrantDetails(grantId) {
        const grant = this.grants.find(g => g.id === grantId);
        if (!grant) return;

        // Create a more sophisticated modal or expand the card
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${this.escapeHtml(grant.name)}</h2>
                    <button class="modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Funder:</strong> ${this.escapeHtml(grant.funder)}</p>
                    <p><strong>Amount:</strong> ${this.formatAmount(grant.amount_string)}</p>
                    <p><strong>Due Date:</strong> ${this.formatDate(grant.due_date)}</p>
                    <p><strong>Status:</strong> <span class="badge ${this.getStatusClass(grant.status)}">${grant.status}</span></p>
                    <p><strong>Description:</strong></p>
                    <p>${this.escapeHtml(grant.description)}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Close</button>
                    <button class="btn-primary" onclick="grantPortal.applyForGrant('${grant.id}')">Apply Now</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
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
    // Smooth scroll to top when clicking on header
    const header = document.querySelector('.header');
    header.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Add loading animation delays for staggered effect
    const slideUpElements = document.querySelectorAll('.slide-up');
    slideUpElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.grant-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}); 