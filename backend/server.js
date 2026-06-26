require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.send('Movie app backend is running.');
});

// Route to test the database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Database connected successfully',
      serverTime: result.rows[0].now,
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Movie routes
const moviesRouter = require('./routes/movies');
app.use('/api/movies', moviesRouter);

// User routes (signup, login, stats)
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

