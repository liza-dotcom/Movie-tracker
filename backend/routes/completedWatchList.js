const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

router.use(authenticateToken);

// Helper function to recalculate a movie's running average rating.
function calculateNewAvgRating(oldAvg, oldCount, oldRating, newRating) {
  if (oldRating === null || oldRating === undefined) {
    // Brand new rating being added
    const newCount = oldCount + 1;
    return { newAvg: (oldAvg * oldCount + newRating) / newCount, newCount };
  } else {
    // Replacing an existing rating while count stays the same
    const newCount = oldCount > 0 ? oldCount : 1;
    return { newAvg: (oldAvg * oldCount - oldRating + newRating) / newCount, newCount };
  }
}

// GET /api/completedwatchlist/entries to list entries in the list, optionally filtered by min_rating and sorted
router.get('/entries', async (req, res) => {
  const userId = req.user.userId;
  const { min_rating, sortBy, sortOrder } = req.query;

  const allowedSortBy = ['rating', 'date_last_watched', 'date_initially_watched'];
  const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'rating';
  const safeSortOrder = ['ASC', 'DESC'].includes((sortOrder || '').toUpperCase())
    ? sortOrder.toUpperCase()
    : 'DESC';

  try {
    let sql = `
      SELECT c.*, m.title, m.poster
      FROM completed_watchlist c
      JOIN movies m ON c.movie_id = m.movie_id
      WHERE c.user_id = $1
    `;
    const params = [userId];

    if (min_rating) {
      params.push(min_rating);
      sql += ` AND c.rating >= $${params.length}`;
    }

    // safeSortBy/safeSortOrder are validated against an allow-list above,
    // so it's safe to interpolate them directly (can't parameterize column/direction names in SQL)
    sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

    const result = await pool.query(sql, params);

    if (min_rating) {
      return res.json({
        success: true,
        filters: { min_rating, sortBy, sortOrder },
        data: result.rows,
      });
    }

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching completed watchlist:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/completedwatchlist/entries/:id/times-watched to get number of times a movie was watched by user
router.get('/entries/:id/times-watched', async (req, res) => {
  const userId = req.user.userId;
  const listId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT times_watched FROM completed_watchlist WHERE user_id = $1 AND completed_id = $2',
      [userId, listId]
    );

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({ success: false, message: 'Entry not found or not owned by user' });
    }

    res.json({ success: true, listID: listId, timesWatched: row.times_watched });
  } catch (err) {
    console.error('Error fetching times watched:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/completedwatchlist/entries/:id/rating to gte the rating of a movie 
router.get('/entries/:id/rating', async (req, res) => {
  const userId = req.user.userId;
  const listId = req.params.id;

  try {
    const result = await pool.query(
      'SELECT rating FROM completed_watchlist WHERE user_id = $1 AND completed_id = $2',
      [userId, listId]
    );

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({ success: false, message: 'Entry not found for this user' });
    }

    res.json({ success: true, listID: listId, rating: parseFloat(row.rating) });
  } catch (err) {
    console.error('Error fetching rating:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/completedwatchlist/entries to add or update a completed entry, recalculating movie's avg rating
router.post('/entries', async (req, res) => {
  const userId = req.user.userId;
  const { movieID, notes, date_initially_watched, date_last_watched, times_watched, rating } = req.body;

  // Validate required fields (rating intentionally excluded — optional)
  const required = { movieID, notes, date_initially_watched, date_last_watched, times_watched };
  for (const [field, value] of Object.entries(required)) {
    if (value === undefined || value === null) {
      return res.status(400).json({ success: false, message: `${field} is required` });
    }
  }

  const finalRating = rating !== undefined ? rating : null;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check for an existing entry for this user+movie
    const existingResult = await client.query(
      'SELECT rating FROM completed_watchlist WHERE user_id = $1 AND movie_id = $2',
      [userId, movieID]
    );
    const existing = existingResult.rows[0];

    // Get current movie average/count
    const movieResult = await client.query(
      'SELECT vote_average, vote_count FROM movies WHERE movie_id = $1',
      [movieID]
    );
    const movie = movieResult.rows[0];
    const oldAvg = movie?.vote_average || 0;
    const oldCount = movie?.vote_count || 0;

    let newAvg = oldAvg;
    let newCount = oldCount;

    if (existing) {
      // Update existing entry
      await client.query(
        `UPDATE completed_watchlist
         SET rating = $1, notes = $2, date_initially_watched = $3, date_last_watched = $4, times_watched = $5
         WHERE user_id = $6 AND movie_id = $7`,
        [finalRating, notes, date_initially_watched, date_last_watched, times_watched, userId, movieID]
      );

      if (finalRating !== null) {
        const oldRating = existing.rating;
        ({ newAvg, newCount } = calculateNewAvgRating(oldAvg, oldCount, oldRating, finalRating));
      }
    } else {
      // Insert new entry
      await client.query(
        `INSERT INTO completed_watchlist
           (user_id, movie_id, rating, notes, date_initially_watched, date_last_watched, times_watched)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, movieID, finalRating, notes, date_initially_watched, date_last_watched, times_watched]
      );

      if (finalRating !== null) {
        ({ newAvg, newCount } = calculateNewAvgRating(oldAvg, oldCount, null, finalRating));
      }
    }

    // Propagate the new average back to the movie row, only if a rating was involved
    if (finalRating !== null) {
      await client.query(
        'UPDATE movies SET vote_average = $1, vote_count = $2 WHERE movie_id = $3',
        [newAvg, newCount, movieID]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Entry added successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding completed watchlist entry:', err);
    res.status(500).json({ success: false, message: 'Failed to add entry' });
  } finally {
    client.release();
  }
});

// PATCH /api/completedwatchlist/entries/:id/rating — update rating, recalculate movie average
router.patch('/entries/:id/rating', async (req, res) => {
  const userId = req.user.userId;
  const completedId = req.params.id;
  const { rating, notes } = req.body;  // added notes

  if (rating === undefined || isNaN(rating)) {
    return res.status(400).json({ success: false, message: 'Missing or invalid rating' });
  }

  const newRating = parseFloat(rating);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingResult = await client.query(
      'SELECT rating, movie_id FROM completed_watchlist WHERE completed_id = $1 AND user_id = $2',
      [completedId, userId]
    );
    const existing = existingResult.rows[0];

    if (!existing) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Entry not found or not owned by user' });
    }

    const oldRating = parseFloat(existing.rating);
    const movieId = existing.movie_id;

    const movieResult = await client.query(
      'SELECT vote_average, vote_count FROM movies WHERE movie_id = $1',
      [movieId]
    );
    const movie = movieResult.rows[0];

    if (!movie) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: `Movie not found for movieID ${movieId}` });
    }

    const oldAvg = parseFloat(movie.vote_average);
    const oldCount = parseInt(movie.vote_count, 10);

    const { newAvg } = calculateNewAvgRating(oldAvg, oldCount, oldRating, newRating);

    // Update rating AND notes together
    const updateResult = await client.query(
      `UPDATE completed_watchlist 
       SET rating = $1, notes = COALESCE($2, notes)
       WHERE completed_id = $3 AND user_id = $4`,
      [newRating, notes || null, completedId, userId]
    );

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Update failed — no rows affected' });
    }

    await client.query(
      'UPDATE movies SET vote_average = $1 WHERE movie_id = $2',
      [newAvg, movieId]
    );

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Entry updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating entry:', err);
    res.status(500).json({ success: false, message: `Database error: ${err.message}` });
  } finally {
    client.release();
  }
});

// PATCH /api/completedwatchlist/entries/:id/times-watched — increment counter, update last-watched date
router.patch('/entries/:id/times-watched', async (req, res) => {
  const userId = req.user.userId;
  const completedId = req.params.id;

  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const result = await pool.query(
      `UPDATE completed_watchlist
       SET times_watched = times_watched + 1, date_last_watched = $1
       WHERE user_id = $2 AND completed_id = $3`,
      [today, userId, completedId]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ success: true, message: 'Times watched incremented successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Entry not found or update failed' });
    }
  } catch (err) {
    console.error('Error incrementing times watched:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/completedwatchlist/entries/:id — delete entry, recalculate movie average
router.delete('/entries/:id', async (req, res) => {
  const userId = req.user.userId;
  const completedId = req.params.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const oldResult = await client.query(
      'SELECT rating, movie_id FROM completed_watchlist WHERE user_id = $1 AND completed_id = $2',
      [userId, completedId]
    );
    const old = oldResult.rows[0];

    if (!old) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Entry not found or could not be deleted' });
    }

    const oldRating = old.rating;
    const movieId = old.movie_id;

    const movieResult = await client.query(
      'SELECT vote_average, vote_count FROM movies WHERE movie_id = $1',
      [movieId]
    );
    const movie = movieResult.rows[0];
    const oldAvg = movie?.vote_average || 0;
    const oldCount = movie?.vote_count || 0;

    const newCount = Math.max(0, oldCount - 1);
    const newAvg = newCount > 0 ? (oldAvg * oldCount - oldRating) / newCount : 0;

    await client.query(
      'DELETE FROM completed_watchlist WHERE user_id = $1 AND completed_id = $2',
      [userId, completedId]
    );

    await client.query(
      'UPDATE movies SET vote_average = $1, vote_count = $2 WHERE movie_id = $3',
      [newAvg, newCount, movieId]
    );

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: 'Entry deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting completed watchlist entry:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;