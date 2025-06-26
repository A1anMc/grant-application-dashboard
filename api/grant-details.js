const express = require('express');
const { authenticateToken } = require('./auth');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const GRANT_DETAILS_FILE = path.join(__dirname, '../mock/grant_details.json');

async function loadGrantDetails() {
  try {
    const data = await fs.readFile(GRANT_DETAILS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

async function saveGrantDetails(details) {
  await fs.writeFile(GRANT_DETAILS_FILE, JSON.stringify(details, null, 2));
}

// Enhanced eligibility scoring
function calculateDetailedEligibility(grant) {
  const scores = {
    alignment: 0,
    experience: 0,
    capacity: 0,
    innovation: 0,
    impact: 0
  };

  const factors = [];
  const recommendations = [];

  // Content alignment scoring
  if (grant.tags) {
    const relevantTags = ['DOCUMENTARY', 'FIRST NATIONS', 'ARTS', 'FILM'];
    const matchingTags = grant.tags.filter(tag => relevantTags.includes(tag));
    scores.alignment = (matchingTags.length / relevantTags.length) * 100;
    
    if (matchingTags.length > 0) {
      factors.push(`Strong content alignment: ${matchingTags.join(', ')}`);
    }
  }

  // Experience assessment
  if (grant.description) {
    const desc = grant.description.toLowerCase();
    if (desc.includes('experienced') || desc.includes('professional')) {
      scores.experience = 80;
      factors.push('Targets experienced professionals');
    } else if (desc.includes('emerging') || desc.includes('development')) {
      scores.experience = 60;
      factors.push('Suitable for emerging practitioners');
    }
  }

  // Capacity requirements
  const amount = parseFloat(grant.amount_string?.replace(/[^0-9]/g, '') || '0');
  if (amount > 100000) {
    scores.capacity = 90;
    factors.push('High-value grant requiring strong capacity');
    recommendations.push('Ensure robust project management and financial controls');
  } else if (amount > 50000) {
    scores.capacity = 70;
    factors.push('Medium-scale funding with moderate requirements');
  } else {
    scores.capacity = 50;
    factors.push('Accessible funding level');
  }

  // Innovation potential
  if (grant.description?.toLowerCase().includes('innovative') || 
      grant.description?.toLowerCase().includes('creative')) {
    scores.innovation = 85;
    factors.push('Values innovation and creativity');
  }

  // Impact assessment
  if (grant.tags?.includes('COMMUNITY') || grant.tags?.includes('SOCIAL IMPACT')) {
    scores.impact = 90;
    factors.push('Strong community impact potential');
    recommendations.push('Develop clear community engagement strategy');
  }

  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;

  return {
    overallScore: Math.round(overallScore),
    scores,
    factors,
    recommendations: recommendations.length > 0 ? recommendations : [
      'Review eligibility criteria thoroughly',
      'Prepare strong application narrative',
      'Ensure all required documentation is ready'
    ],
    riskLevel: overallScore > 70 ? 'Low' : overallScore > 50 ? 'Medium' : 'High'
  };
}

// Get detailed grant information
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Load basic grant data
    const grantsResponse = await fetch('http://localhost:3000/api/grants');
    const grantsData = await grantsResponse.json();
    const grant = grantsData.grants.find(g => g.id == req.params.id);

    if (!grant) {
      return res.status(404).json({ error: 'Grant not found' });
    }

    // Load or generate detailed analysis
    const grantDetails = await loadGrantDetails();
    let details = grantDetails[req.params.id];

    if (!details) {
      // Generate detailed analysis
      const eligibilityAnalysis = calculateDetailedEligibility(grant);
      
      details = {
        id: grant.id,
        eligibilityAnalysis,
        extractedQuestions: [
          {
            id: 1,
            question: "Describe your project's alignment with the fund's objectives",
            category: "Project Description",
            required: true,
            wordLimit: 500
          },
          {
            id: 2,
            question: "Provide detailed budget breakdown",
            category: "Financial",
            required: true,
            attachments: true
          },
          {
            id: 3,
            question: "Demonstrate community engagement strategy",
            category: "Impact",
            required: false,
            wordLimit: 300
          }
        ],
        timeline: {
          applicationDeadline: grant.due_date,
          estimatedDecision: '6-8 weeks after deadline',
          projectStart: 'Within 3 months of approval',
          reportingRequirements: 'Quarterly progress reports'
        },
        requirements: [
          'Australian entity or individual',
          'Relevant experience in the field',
          'Detailed project plan',
          'Budget and financial projections',
          'Letters of support'
        ],
        suggestedActions: [
          'Complete eligibility self-assessment',
          'Prepare project narrative',
          'Gather supporting documentation',
          'Review similar successful applications'
        ],
        lastUpdated: new Date().toISOString()
      };

      grantDetails[req.params.id] = details;
      await saveGrantDetails(grantDetails);
    }

    res.json({
      success: true,
      grant: {
        ...grant,
        ...details
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update grant analysis
router.put('/:id/analysis', authenticateToken, async (req, res) => {
  try {
    const grantDetails = await loadGrantDetails();
    
    if (!grantDetails[req.params.id]) {
      return res.status(404).json({ error: 'Grant details not found' });
    }

    grantDetails[req.params.id] = {
      ...grantDetails[req.params.id],
      ...req.body,
      lastUpdated: new Date().toISOString(),
      updatedBy: req.user.id
    };

    await saveGrantDetails(grantDetails);

    res.json({
      success: true,
      details: grantDetails[req.params.id]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
