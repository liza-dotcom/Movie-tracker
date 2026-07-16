# 🎬 Movie Tracker

A full-stack movie tracking application built with React, TypeScript, Node.js, Express, and PostgreSQL. Users can browse movies, manage personal watchlists, track completed films with ratings and notes, and view personalized viewing stats.

**🔗 [Live Demo](https://movie-tracker-frontend-beryl.vercel.app)**

---

## Features

- **Browse Movies** — Search and filter 200+ real movies by title and genre
- **To-Watch List** — Add movies with priority levels and notes; mark as completed
- **Completed List** — Track watched movies with personal ratings, notes, and rewatch counts
- **User Stats** — View total watch time, average rating, and viewing history
- **Authentication** — Secure signup/login with JWT and bcrypt password hashing

---

## Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite
- React Router
- CSS (custom dark theme)

**Backend**
- Node.js + Express.js
- JWT Authentication (jsonwebtoken + bcrypt)
- RESTful API (12+ endpoints)
- CORS configuration for production

**Database**
- PostgreSQL (Render managed)
- Normalized relational schema with foreign keys and cascade deletes
- 200 real movies seeded via TMDB API

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

---

## Architecture Highlights

- **JWT auth middleware** protecting all user-specific routes with ownership checks
- **Database transactions** on rating updates and deletions to ensure atomicity across two tables
- **Incremental average rating recalculation** — user ratings propagate to the movie's global average in real time
- **Schema migration** from MySQL to PostgreSQL with precision bug fix discovered during testing (NUMERIC(2,1) → NUMERIC(3,1))
- **TMDB API integration** for seeding real movie data with posters, genres, and production companies

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/users/signup` | Register new user | No |
| POST | `/api/users/login` | Login, returns JWT | No |
| GET | `/api/users/:id/stats` | Get user viewing stats | Yes |
| GET | `/api/movies` | List all movies (filter by title/genre) | No |
| GET | `/api/movies/:id` | Get movie details with genres/companies | No |
| GET | `/api/movies/:id/rating` | Get movie rating | No |
| GET | `/api/towatchlist/entries` | Get user's to-watch list | Yes |
| POST | `/api/towatchlist/entries` | Add movie to watchlist | Yes |
| PUT | `/api/towatchlist/entries/:id` | Update watchlist entry | Yes |
| PATCH | `/api/towatchlist/entries/:id/priority` | Update priority | Yes |
| DELETE | `/api/towatchlist/entries/:id` | Remove from watchlist | Yes |
| GET | `/api/completedwatchlist/entries` | Get completed list | Yes |
| POST | `/api/completedwatchlist/entries` | Add completed movie | Yes |
| PATCH | `/api/completedwatchlist/entries/:id/rating` | Update rating + notes | Yes |
| PATCH | `/api/completedwatchlist/entries/:id/times-watched` | Increment rewatch count | Yes |
| DELETE | `/api/completedwatchlist/entries/:id` | Remove from completed list | Yes |

---

## Running Locally

**Prerequisites:** Node.js, PostgreSQL

```bash
# Clone the repo
git clone https://github.com/liza-dotcom/Movie-tracker.git
cd Movie-tracker

# Backend
cd backend
npm install
# Create .env with DATABASE_URL, JWT_SECRET, PORT
npm run dev

# Frontend (new terminal)
cd frontend
npm install
# Create .env with VITE_API_BASE=http://localhost:5050/api
npm run dev
```

---

## Project Structure

```
Movie-tracker/
├── backend/
│   ├── routes/          # Express route handlers
│   ├── middleware/       # JWT auth middleware
│   ├── scripts/          # TMDB seeding script
│   ├── db.js             # PostgreSQL connection pool
│   └── server.js         # Express app entry point
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Page-level components
    │   ├── services/     # API call functions
    │   └── context/      # Auth context (JWT storage)
    └── vercel.json       # Vercel routing config
```

---

*Built by [Liza Choudhry](https://github.com/liza-dotcom)*
