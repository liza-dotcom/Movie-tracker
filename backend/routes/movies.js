const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/movies — return first 100 movies, trimmed/aliased columns
// Matches original: movie_id, title, poster AS cover, vote_average AS rating
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT movie_id, title, poster AS cover, vote_average AS rating
       FROM movies
       LIMIT 100`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/movies/:id — single movie, with its genres and companies joined in
router.get('/:id', async (req, res) => {
  const movieId = parseInt(req.params.id, 10);

  // Validate the id is actually a number before querying
  if (Number.isNaN(movieId)) {
    return res.status(400).json({ success: false, message: 'Invalid movie id' });
  }

  try {
    const movieResult = await pool.query(
      'SELECT * FROM movies WHERE movie_id = $1',
      [movieId]
    );

    const movie = movieResult.rows[0];

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Get genres for this movie
    const genresResult = await pool.query(
      `SELECT g.genre_name
       FROM genres g
       JOIN movie_genres mg ON g.genre_id = mg.genre_id
       WHERE mg.movie_id = $1`,
      [movieId]
    );
    movie.genres = genresResult.rows.map((row) => row.genre_name);

    // Get companies for this movie
    const companiesResult = await pool.query(
      `SELECT c.company_name
       FROM companies c
       JOIN movie_companies mc ON c.company_id = mc.company_id
       WHERE mc.movie_id = $1`,
      [movieId]
    );
    movie.companies = companiesResult.rows.map((row) => row.company_name);

    res.json({ success: true, data: movie });
  } catch (err) {
    console.error('Error fetching movie by id:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;