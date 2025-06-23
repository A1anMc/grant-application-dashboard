const express = require('express');
const router = express.Router();
const mockGrants = require('../mock/mockGrants.json');

router.get('/', async (req, res) => {
  try {
    const { SUPABASE_URL, SUPABASE_KEY } = process.env;
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('⚠️ Supabase credentials missing. Using mock data.');
      return res.json(mockGrants);
    }

    // If Supabase is configured, fetch real data here
    // const data = await fetchSupabaseGrants(); ← your logic
    // res.json(data);

    res.json(mockGrants); // Placeholder - using mock data for now
  } catch (err) {
    console.error('Grant API error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router; 