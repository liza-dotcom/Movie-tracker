const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/movies — return first 100 movies, with selected details for home page presentation
// Filtered results if title/genre query params are present

router.get('/', async (req, res) => {
  const { title, genre } = req.query;

  // If either filter is present, run the filtered query instead
  if (title || genre) {
    try {
      let sql = `
        SELECT m.*
        FROM movies m
        LEFT JOIN movie_genres mg ON m.movie_id = mg.movie_id
        LEFT JOIN genres g ON mg.genre_id = g.genre_id
        WHERE 1=1
      `;
      const params = [];

      if (title) {
        params.push(`%${title}%`);
        sql += ` AND m.title ILIKE $${params.length}`;
      }

      if (genre) {
        params.push(`%${genre}%`);
        sql += ` AND g.genre_name ILIKE $${params.length}`;
      }

      sql += ' GROUP BY m.movie_id';

      const result = await pool.query(sql, params);

      // Only include filters that were actually applied
      const appliedFilters = {};
      if (title) appliedFilters.title = title;
      if (genre) appliedFilters.genre = genre;

      return res.json({
        success: true,
        filters: appliedFilters,
        data: result.rows,
      });
    } catch (err) {
      console.error('Error filtering movies:', err);
      return res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
  }

  // If no filters were selected, return all movies 
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

// GET /api/movies/:id/rating — just the rating for one movie
router.get('/:id/rating', async (req, res) => {
  const movieId = parseInt(req.params.id, 10);

  if (Number.isNaN(movieId)) {
    return res.status(400).json({ success: false, message: 'Invalid movie id' });
  }

  try {
    const result = await pool.query(
      'SELECT vote_average FROM movies WHERE movie_id = $1 LIMIT 1',
      [movieId]
    );

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ id: movieId, rating: row.vote_average });
  } catch (err) {
    console.error('Error fetching movie rating:', err);
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