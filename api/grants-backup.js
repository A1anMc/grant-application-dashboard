const express = require('express');
const router = express.Router();
const mockGrants = require('../mock/mockGrants.json');
const eligibilityAssessor = require('./eligibility');

router.get('/', async (req, res) => {
  try {
    const { SUPABASE_URL, SUPABASE_KEY } = process.env;
    let grants = [];

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('⚠️ Supabase credentials missing. Using mock data.');
      grants = mockGrants.grants;
    } else {
      // If Supabase is configured, fetch real data here
      // const data = await fetchSupabaseGrants();
      // grants = data.grants;
      grants = mockGrants.grants; // Placeholder - using mock data for now
    }

    // Auto-assess eligibility for each grant if not already assessed
    const assessedGrants = grants.map(grant => {
      if (!grant.eligibility) {
        const assessment = eligibilityAssessor.assessGrant(grant);
        return {
          ...grant,
          eligibility: assessment
        };
      }
      return grant;
    });

    res.json({ grants: assessedGrants });
  } catch (err) {
    console.error('Grant API error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get eligibility profile
router.get('/eligibility-profile', (req, res) => {
  try {
    const profile = require('../mock/eligibilityProfile.json');
    res.json(profile);
  } catch (err) {
    console.error('Eligibility profile error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Assess a single grant
router.post('/assess', (req, res) => {
  try {
    const { grant } = req.body;
    if (!grant) {
      return res.status(400).json({ error: 'Grant data required' });
    }

    const assessment = eligibilityAssessor.assessGrant(grant);
    res.json({ assessment });
  } catch (err) {
    console.error('Grant assessment error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 