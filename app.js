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
        this.updateKPIs();
        this.updateDeadlines();
        this.createCharts();
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

        // KPI card click listeners
        document.querySelectorAll('.kpi-card').forEach(card => {
            card.addEventListener('click', () => {
                const filter = card.dataset.filter;
                this.handleKPIClick(filter);
            });
        });

        // Export button listeners
        document.getElementById('exportCSV').addEventListener('click', () => this.exportCSV());
        document.getElementById('exportPDF').addEventListener('click', () => this.exportPDF());
        document.getElementById('exportMarkdown').addEventListener('click', () => this.exportMarkdown());
        document.getElementById('shareLink').addEventListener('click', () => this.shareSummary());
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

    handleKPIClick(filter) {
        // Reset all filters first
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('eligibilityFilter').value = '';
        this.selectedTags.clear();
        document.querySelectorAll('.tag-filter').forEach(btn => btn.classList.remove('active'));

        // Apply specific filter based on KPI clicked
        switch(filter) {
            case 'eligible':
                document.getElementById('eligibilityFilter').value = 'eligible';
                break;
            case 'eligible_with_auspice':
                document.getElementById('eligibilityFilter').value = 'eligible_with_auspice';
                break;
            case 'not_eligible':
                document.getElementById('eligibilityFilter').value = 'not_eligible';
                break;
            case 'deadline':
                // Filter for grants due within 30 days
                this.filteredGrants = this.grants.filter(grant => {
                    const daysUntilDue = this.getDaysUntilDue(grant.due_date);
                    return daysUntilDue !== null && daysUntilDue <= 30;
                });
                this.renderGrants();
                return;
            case 'funding':
                // Sort by funding amount (highest first)
                this.filteredGrants = [...this.grants].sort((a, b) => {
                    const amountA = this.extractAmount(a.amount_string);
                    const amountB = this.extractAmount(b.amount_string);
                    return amountB - amountA;
                });
                this.renderGrants();
                return;
        }

        this.handleSearch();
    }

    extractAmount(amountString) {
        // Extract the highest amount from strings like "$50,000 - $200,000"
        const matches = amountString.match(/\$([0-9,]+)/g);
        if (matches) {
            const amounts = matches.map(match => parseInt(match.replace(/[$,]/g, '')));
            return Math.max(...amounts);
        }
        return 0;
    }

    updateKPIs() {
        const total = this.grants.length;
        const eligible = this.grants.filter(g => g.eligibility && g.eligibility.category === 'eligible').length;
        const auspice = this.grants.filter(g => g.eligibility && g.eligibility.category === 'eligible_with_auspice').length;
        const notEligible = this.grants.filter(g => g.eligibility && g.eligibility.category === 'not_eligible').length;
        
        // Calculate upcoming deadlines (within 30 days)
        const upcomingDeadlines = this.grants.filter(grant => {
            const daysUntilDue = this.getDaysUntilDue(grant.due_date);
            return daysUntilDue !== null && daysUntilDue <= 30;
        }).length;

        // Calculate total funding
        const totalFunding = this.grants.reduce((sum, grant) => {
            return sum + this.extractAmount(grant.amount_string);
        }, 0);

        // Update KPI elements
        document.getElementById('totalGrantsKPI').textContent = total;
        document.getElementById('eligibleGrantsKPI').textContent = eligible;
        document.getElementById('auspiceGrantsKPI').textContent = auspice;
        document.getElementById('notEligibleGrantsKPI').textContent = notEligible;
        document.getElementById('upcomingDeadlinesKPI').textContent = upcomingDeadlines;
        document.getElementById('totalFundingKPI').textContent = `$${(totalFunding / 1000).toFixed(0)}k`;

        // Animate KPI numbers
        this.animateKPINumbers();
    }

    animateKPINumbers() {
        const kpiNumbers = document.querySelectorAll('.kpi-number');
        kpiNumbers.forEach(number => {
            const finalValue = number.textContent;
            const isCurrency = finalValue.includes('$');
            const finalNum = isCurrency ? 
                parseFloat(finalValue.replace(/[$,k]/g, '')) : 
                parseInt(finalValue);
            
            let currentValue = 0;
            const increment = finalNum / 20;
            
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalNum) {
                    currentValue = finalNum;
                    clearInterval(timer);
                }
                
                if (isCurrency) {
                    number.textContent = `$${(currentValue / 1000).toFixed(0)}k`;
                } else {
                    number.textContent = Math.floor(currentValue);
                }
            }, 50);
        });
    }

    updateDeadlines() {
        const deadlinesList = document.getElementById('deadlinesList');
        
        // Get grants sorted by due date
        const sortedGrants = [...this.grants]
            .filter(grant => grant.due_date)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 5); // Show top 5 upcoming deadlines

        if (sortedGrants.length === 0) {
            deadlinesList.innerHTML = '<p>No upcoming deadlines found.</p>';
            return;
        }

        deadlinesList.innerHTML = sortedGrants.map(grant => {
            const daysUntilDue = this.getDaysUntilDue(grant.due_date);
            const urgencyClass = this.getDeadlineUrgencyClass(daysUntilDue);
            const formattedDate = this.formatDate(grant.due_date);
            
            return `
                <div class="deadline-item ${urgencyClass}">
                    <div class="deadline-info">
                        <h4>${this.escapeHtml(grant.name)}</h4>
                        <p>${this.escapeHtml(grant.funder)}</p>
                    </div>
                    <div class="deadline-date">
                        <div class="date">${formattedDate}</div>
                        <div class="days-left">${daysUntilDue} days left</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getDeadlineUrgencyClass(daysUntilDue) {
        if (daysUntilDue <= 7) return 'urgent';
        if (daysUntilDue <= 14) return 'soon';
        return 'normal';
    }

    createCharts() {
        this.createEligibilityChart();
        this.createConfidenceChart();
    }

    createEligibilityChart() {
        const ctx = document.getElementById('eligibilityChart');
        if (!ctx) return;

        const eligible = this.grants.filter(g => g.eligibility && g.eligibility.category === 'eligible').length;
        const auspice = this.grants.filter(g => g.eligibility && g.eligibility.category === 'eligible_with_auspice').length;
        const notEligible = this.grants.filter(g => g.eligibility && g.eligibility.category === 'not_eligible').length;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Eligible', 'Auspice Required', 'Not Eligible'],
                datasets: [{
                    data: [eligible, auspice, notEligible],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12
                            },
                            color: '#475569'
                        }
                    }
                }
            }
        });
    }

    createConfidenceChart() {
        const ctx = document.getElementById('confidenceChart');
        if (!ctx) return;

        const highConfidence = this.grants.filter(g => g.eligibility && g.eligibility.confidence >= 0.8).length;
        const mediumConfidence = this.grants.filter(g => g.eligibility && g.eligibility.confidence >= 0.5 && g.eligibility.confidence < 0.8).length;
        const lowConfidence = this.grants.filter(g => g.eligibility && g.eligibility.confidence < 0.5).length;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['High (0.8+)', 'Medium (0.5-0.8)', 'Low (<0.5)'],
                datasets: [{
                    data: [highConfidence, mediumConfidence, lowConfidence],
                    backgroundColor: [
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: {
                                family: 'Inter, sans-serif',
                                size: 12
                            },
                            color: '#475569'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                family: 'Inter, sans-serif',
                                size: 11
                            },
                            color: '#475569'
                        }
                    }
                }
            }
        });
    }

    exportCSV() {
        const headers = ['Name', 'Funder', 'Amount', 'Due Date', 'Status', 'Eligibility', 'Confidence', 'Tags'];
        const csvContent = [
            headers.join(','),
            ...this.filteredGrants.map(grant => [
                `"${grant.name}"`,
                `"${grant.funder}"`,
                `"${grant.amount_string}"`,
                grant.due_date,
                grant.status,
                grant.eligibility?.category || 'unknown',
                grant.eligibility?.confidence || 0,
                `"${(grant.tags || []).join('; ')}"`
            ].join(','))
        ].join('\n');

        this.downloadFile(csvContent, 'grants-export.csv', 'text/csv');
    }

    exportMarkdown() {
        const markdown = `# SGE Grant Portal Export

Generated on: ${new Date().toLocaleDateString()}
Total Grants: ${this.filteredGrants.length}

${this.filteredGrants.map(grant => `
## ${grant.name}

- **Funder:** ${grant.funder}
- **Amount:** ${grant.amount_string}
- **Due Date:** ${this.formatDate(grant.due_date)}
- **Status:** ${grant.status}
- **Eligibility:** ${grant.eligibility?.category || 'unknown'} (${Math.round((grant.eligibility?.confidence || 0) * 100)}% confidence)
- **Tags:** ${(grant.tags || []).join(', ')}
- **Description:** ${grant.description}

${grant.eligibility?.reasoning ? `**Reasoning:** ${grant.eligibility.reasoning}` : ''}

---
`).join('')}`;

        this.downloadFile(markdown, 'grants-export.md', 'text/markdown');
    }

    exportPDF() {
        // Simple PDF export using browser print
        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head>
                    <title>SGE Grant Portal Export</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .grant { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
                        .header { text-align: center; margin-bottom: 30px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>SGE Grant Portal Export</h1>
                        <p>Generated on: ${new Date().toLocaleDateString()}</p>
                        <p>Total Grants: ${this.filteredGrants.length}</p>
                    </div>
                    ${this.filteredGrants.map(grant => `
                        <div class="grant">
                            <h3>${grant.name}</h3>
                            <p><strong>Funder:</strong> ${grant.funder}</p>
                            <p><strong>Amount:</strong> ${grant.amount_string}</p>
                            <p><strong>Due Date:</strong> ${this.formatDate(grant.due_date)}</p>
                            <p><strong>Status:</strong> ${grant.status}</p>
                            <p><strong>Eligibility:</strong> ${grant.eligibility?.category || 'unknown'} (${Math.round((grant.eligibility?.confidence || 0) * 100)}% confidence)</p>
                            <p><strong>Tags:</strong> ${(grant.tags || []).join(', ')}</p>
                            <p><strong>Description:</strong> ${grant.description}</p>
                            ${grant.eligibility?.reasoning ? `<p><strong>Reasoning:</strong> ${grant.eligibility.reasoning}</p>` : ''}
                        </div>
                    `).join('')}
                </body>
            </html>
        `;
        
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    }

    shareSummary() {
        const summary = {
            totalGrants: this.grants.length,
            eligibleGrants: this.grants.filter(g => g.eligibility && g.eligibility.category === 'eligible').length,
            auspiceGrants: this.grants.filter(g => g.eligibility && g.eligibility.category === 'eligible_with_auspice').length,
            notEligibleGrants: this.grants.filter(g => g.eligibility && g.eligibility.category === 'not_eligible').length,
            upcomingDeadlines: this.grants.filter(grant => {
                const daysUntilDue = this.getDaysUntilDue(grant.due_date);
                return daysUntilDue !== null && daysUntilDue <= 30;
            }).length,
            exportDate: new Date().toISOString()
        };

        const shareText = `SGE Grant Portal Summary:
- Total Grants: ${summary.totalGrants}
- Eligible: ${summary.eligibleGrants}
- Auspice Required: ${summary.auspiceGrants}
- Not Eligible: ${summary.notEligibleGrants}
- Upcoming Deadlines: ${summary.upcomingDeadlines}

Generated on ${new Date().toLocaleDateString()}`;

        if (navigator.share) {
            navigator.share({
                title: 'SGE Grant Portal Summary',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Summary copied to clipboard!');
            });
        }
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
