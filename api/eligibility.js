const eligibilityProfile = require('../mock/eligibilityProfile.json');

class EligibilityAssessor {
    constructor() {
        this.profile = eligibilityProfile;
    }

    assessGrant(grant) {
        const text = this.normalizeText(`${grant.name} ${grant.description} ${grant.funder}`);
        const tags = this.extractTags(text);
        const amountScore = this.assessAmount(grant.amount_string);
        const keywordScore = this.assessKeywords(text);
        const locationScore = this.assessLocation(text);
        
        const totalScore = (tags.score + amountScore + keywordScore + locationScore) / 4;
        
        return {
            category: this.categorizeGrant(totalScore, tags.count),
            confidence: totalScore,
            tags: tags.found,
            details: {
                tagScore: tags.score,
                amountScore,
                keywordScore,
                locationScore,
                reasoning: this.generateReasoning(tags, amountScore, keywordScore, locationScore)
            }
        };
    }

    normalizeText(text) {
        return text.toLowerCase().replace(/[^\w\s]/g, ' ');
    }

    extractTags(text) {
        const requiredTags = this.profile.eligibility_criteria.required_tags;
        const found = [];
        let count = 0;

        requiredTags.forEach(tag => {
            const tagLower = tag.toLowerCase();
            if (text.includes(tagLower) || text.includes(tagLower.replace(' ', ''))) {
                found.push(tag);
                count++;
            }
        });

        return {
            found,
            count,
            score: Math.min(count / 2, 1) // Score based on number of tags found
        };
    }

    assessAmount(amountString) {
        if (!amountString) return 0.5;

        const numbers = amountString.match(/\d+/g);
        if (!numbers) return 0.5;

        const amounts = numbers.map(n => parseInt(n));
        const maxAmount = Math.max(...amounts);
        const minAmount = Math.min(...amounts);

        const { min, max, preferred_min } = this.profile.eligibility_criteria.amount_ranges;

        if (maxAmount >= min && minAmount <= max) {
            if (minAmount >= preferred_min) return 1.0;
            return 0.8;
        }

        return 0.3;
    }

    assessKeywords(text) {
        const preferred = this.profile.eligibility_criteria.preferred_keywords;
        const excluded = this.profile.eligibility_criteria.excluded_keywords;

        let score = 0.5; // Base score

        // Check preferred keywords
        preferred.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 0.1;
            }
        });

        // Check excluded keywords
        excluded.forEach(keyword => {
            if (text.includes(keyword)) {
                score -= 0.2;
            }
        });

        return Math.max(0, Math.min(1, score));
    }

    assessLocation(text) {
        const locations = this.profile.eligibility_criteria.location_requirements;
        
        for (const location of locations) {
            if (text.includes(location.toLowerCase())) {
                return 1.0;
            }
        }

        return 0.5; // Neutral score if no location found
    }

    categorizeGrant(totalScore, tagCount) {
        if (totalScore >= 0.8 && tagCount >= 2) {
            return 'eligible';
        } else if (totalScore >= 0.6 && tagCount >= 1) {
            return 'eligible_with_auspice';
        } else {
            return 'not_eligible';
        }
    }

    generateReasoning(tags, amountScore, keywordScore, locationScore) {
        const reasons = [];

        if (tags.count >= 2) {
            reasons.push(`Strong match with ${tags.count} relevant tags: ${tags.found.join(', ')}`);
        } else if (tags.count === 1) {
            reasons.push(`Partial match with tag: ${tags.found[0]}`);
        } else {
            reasons.push('No relevant tags found');
        }

        if (amountScore >= 0.8) {
            reasons.push('Amount within preferred range');
        } else if (amountScore >= 0.5) {
            reasons.push('Amount within acceptable range');
        } else {
            reasons.push('Amount may be outside preferred range');
        }

        if (keywordScore >= 0.7) {
            reasons.push('Strong keyword alignment');
        } else if (keywordScore <= 0.3) {
            reasons.push('Some keywords may not align with focus areas');
        }

        if (locationScore === 1.0) {
            reasons.push('Location requirements met');
        }

        return reasons.join('. ');
    }
}

module.exports = new EligibilityAssessor();
