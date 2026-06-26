const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

const SALT_ROUNDS = 10;

// POST /api/users/signup — create a new user
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required',
    });
  }

  try {
    // Check if username or email already exists
    const existing = await pool.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username or email already in use',
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING user_id, username, email`,
      [username, email, hashedPassword]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      data: newUser,
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/users/login to verify credentials and issue JWT
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password required',
    });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Issue a signed JWT containing the user id, expires in 24h
    const token = jwt.sign(
      { userId: user.user_id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      userId: user.user_id,
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:id/stats for a protected route i.e. user can only view their own stats
router.get('/:id/stats', authenticateToken, async (req, res) => {
  const requestedId = parseInt(req.params.id, 10);

  if (Number.isNaN(requestedId)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }

  // Authorization check to make sure that token's userId match the requested id
  if (req.user.userId !== requestedId) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: You can only view your own stats',
    });
  }

  try {
    // Completed list stats
    const completedResult = await pool.query(
      `SELECT 
         COUNT(*) AS total_completed,
         AVG(rating) AS avg_score,
         SUM(times_watched * m.runtime) AS total_time_watched_in_minutes
       FROM completed_watchlist c
       JOIN movies m ON c.movie_id = m.movie_id
       WHERE c.user_id = $1`,
      [requestedId]
    );

    // To-watch list stats
    const toWatchResult = await pool.query(
      `SELECT 
         COUNT(*) AS total_to_watch,
         SUM(m.runtime) AS planned_time_to_watch_in_minutes
       FROM to_watchlist t
       JOIN movies m ON t.movie_id = m.movie_id
       WHERE t.user_id = $1`,
      [requestedId]
    );

    // Basic user info
    const userInfoResult = await pool.query(
      'SELECT username, email FROM users WHERE user_id = $1',
      [requestedId]
    );

    const stats = {
      completed: completedResult.rows[0] || {},
      toWatch: toWatchResult.rows[0] || {},
      userInfo: userInfoResult.rows[0] || {},
    };

    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;