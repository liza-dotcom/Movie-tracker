const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

// All routes in this file require a valid token to ensure only the authorized user has access to all the watchList CRUD features
router.use(authenticateToken);

// GET /api/towatchlist/entries to list all entries for the logged-in user
// OR filtered by priority if ?priority= is present in the url/query 
router.get('/entries', async (req, res) => {
  const userId = req.user.userId;
  const { priority } = req.query;

  try {
    let sql = `
      SELECT t.*, m.title
      FROM to_watchlist t
      JOIN movies m ON t.movie_id = m.movie_id
      WHERE t.user_id = $1
    `;
    const params = [userId];

    if (priority) {
      params.push(priority);
      sql += ` AND t.priority = $${params.length}`;
    }

    const result = await pool.query(sql, params);

    if (priority) {
      return res.json({
        success: true,
        filters: { priority },
        data: result.rows,
      });
    }

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Error fetching to-watch list:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/towatchlist/entries to add a new entry to the list
router.post('/entries', async (req, res) => {
  const userId = req.user.userId;
  const { movieID, priority, notes } = req.body;

  if (!movieID) {
    return res.status(400).json({ success: false, message: 'Missing movieID' });
  }

  const finalPriority = priority || 1; // default priority is set to 1 

  try {
    const result = await pool.query(
      `INSERT INTO to_watchlist (user_id, movie_id, priority, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING list_id`,
      [userId, movieID, finalPriority, notes || null]
    );

    res.json({
      success: true,
      message: 'Entry added to watch list',
      listID: result.rows[0].list_id,
    });
  } catch (err) {
    console.error('Error adding to watch list:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/towatchlist/entries/:id to upsert i.e. update if exists or insert if not
router.put('/entries/:id', async (req, res) => {
  const userId = req.user.userId;
  const listId = req.params.id;
  const { movieID, priority, notes } = req.body;

  if (!movieID) {
    return res.status(400).json({ success: false, message: 'movieID is required' });
  }

  try {
    const existing = await pool.query(
      'SELECT list_id FROM to_watchlist WHERE list_id = $1 AND user_id = $2',
      [listId, userId]
    );

    if (existing.rows.length > 0) {
      // Update existing entry
      await pool.query(
        `UPDATE to_watchlist
         SET movie_id = $1, priority = $2, notes = $3
         WHERE list_id = $4 AND user_id = $5`,
        [movieID, priority, notes, listId, userId]
      );
      return res.status(200).json({
        success: true,
        message: 'Watch list entry updated successfully',
      });
    } else {
      // Insert new entry with the specified id
      await pool.query(
        `INSERT INTO to_watchlist (list_id, user_id, movie_id, priority, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [listId, userId, movieID, priority, notes]
      );
      return res.status(201).json({
        success: true,
        message: 'There was no previous data for the id, new watch list entry created successfully',
      });
    }
  } catch (err) {
    console.error('Error upserting watch list entry:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/towatchlist/entries/:id/priority to update just the priority of an entry in the list 
router.patch('/entries/:id/priority', async (req, res) => {
  const userId = req.user.userId;
  const listId = req.params.id;
  const { priority } = req.body;

  if (priority === undefined || isNaN(priority)) {
    return res.status(400).json({ success: false, message: 'Missing or invalid priority' });
  }

  try {
    const result = await pool.query(
      `UPDATE to_watchlist
       SET priority = $1
       WHERE list_id = $2 AND user_id = $3`,
      [parseInt(priority, 10), listId, userId]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ success: true, message: 'Priority updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Record not found or not owned by user' });
    }
  } catch (err) {
    console.error('Error updating priority:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/towatchlist/entries/:id to delete ab entry from the list 
router.delete('/entries/:id', async (req, res) => {
  const userId = req.user.userId;
  const listId = parseInt(req.params.id, 10);

  if (Number.isNaN(listId) || listId <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid listID in URL' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM to_watchlist WHERE user_id = $1 AND list_id = $2',
      [userId, listId]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ success: true, message: 'Entry deleted from watchlist' });
    } else {
      res.status(404).json({ success: false, message: 'Record not found or not owned by user' });
    }
  } catch (err) {
    console.error('Error deleting watch list entry:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;