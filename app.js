// SGE Grant Portal - Application Logic
class GrantPortal {
    constructor() {
        this.grants = [];
        this.filteredGrants = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadGrants();
    }

    setupEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');

        searchBtn.addEventListener('click', () => this.handleSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });
    }

    async loadGrants() {
        const container = document.getElementById('grantsContainer');
        container.innerHTML = '<div class="loading">Loading grants...</div>';

        try {
            const response = await fetch('/api/grants');
            const data = await response.json();
            
            this.grants = data.grants || [];
            this.filteredGrants = [...this.grants];
            
            this.renderGrants();
        } catch (error) {
            console.error('Error loading grants:', error);
            container.innerHTML = `
                <div class="card">
                    <h3>Error Loading Grants</h3>
                    <p>Unable to load grants at this time. Please try again later.</p>
                    <button class="btn-primary" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredGrants = [...this.grants];
        } else {
            this.filteredGrants = this.grants.filter(grant => 
                grant.name.toLowerCase().includes(searchTerm) ||
                grant.funder.toLowerCase().includes(searchTerm) ||
                grant.description.toLowerCase().includes(searchTerm) ||
                grant.status.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderGrants();
    }

    renderGrants() {
        const container = document.getElementById('grantsContainer');
        
        if (this.filteredGrants.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h3>No Grants Found</h3>
                    <p>No grants match your search criteria. Try adjusting your search terms.</p>
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

        return `
            <div class="grant-card slide-up">
                <h3 class="grant-title">${this.escapeHtml(grant.name)}</h3>
                <p class="grant-funder">${this.escapeHtml(grant.funder)}</p>
                <p class="grant-amount">${formattedAmount}</p>
                <p class="grant-due">Due: ${formattedDate}</p>
                <p class="grant-description">${this.escapeHtml(grant.description)}</p>
                <div class="grant-meta">
                    <span class="badge ${statusClass}">${grant.status}</span>
                    <button class="btn-secondary" onclick="grantPortal.viewGrantDetails('${grant.id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    getStatusClass(status) {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('eligible') || statusLower.includes('open')) {
            return 'eligible';
        } else if (statusLower.includes('pending') || statusLower.includes('review')) {
            return 'pending';
        } else {
            return 'closed';
        }
    }

    formatAmount(amountString) {
        if (!amountString) return 'Amount not specified';
        
        // Clean up the amount string
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

    viewGrantDetails(grantId) {
        const grant = this.grants.find(g => g.id === grantId);
        if (!grant) return;

        // Create a modal or expand the card with more details
        alert(`Grant Details: ${grant.name}\n\nFunder: ${grant.funder}\nAmount: ${grant.amount_string}\nDue: ${grant.due_date}\n\nDescription: ${grant.description}`);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.grantPortal = new GrantPortal();
});

// Add smooth scrolling for better UX
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
}); 