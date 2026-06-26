const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/movies — return all movies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM movies ORDER BY title ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

module.exports = router;