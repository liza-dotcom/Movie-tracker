require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      'http://localhost:5173',
      /\.vercel\.app$/  // allows any vercel.app subdomain
    ];
    if (!origin || allowed.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
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

// To-watch list routes
const toWatchListRouter = require('./routes/toWatchList');
app.use('/api/towatchlist', toWatchListRouter);

const completedWatchListRouter = require('./routes/completedWatchList');
app.use('/api/completedwatchlist', completedWatchListRouter);


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

