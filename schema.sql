-- Movie Tracking App — PostgreSQL Schema
-- Translated from MySQL/MariaDB (cois3430 movie app tables)

-- --------------------------------------------------------
-- Companies
-- --------------------------------------------------------
CREATE TABLE companies (
  company_id   SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL
);

-- --------------------------------------------------------
-- Genres
-- --------------------------------------------------------
CREATE TABLE genres (
  genre_id   SERIAL PRIMARY KEY,
  genre_name VARCHAR(100) NOT NULL
);

-- --------------------------------------------------------
-- Movies
-- --------------------------------------------------------
CREATE TABLE movies (
  movie_id           SERIAL PRIMARY KEY,
  title              VARCHAR(255) NOT NULL,
  tagline            VARCHAR(255),
  overview           TEXT,
  original_language  VARCHAR(10),
  poster             VARCHAR(255),
  runtime            NUMERIC(5,2),
  vote_average       NUMERIC(3,1),
  vote_count         INTEGER,
  budget             BIGINT,
  revenue            BIGINT,
  homepage           VARCHAR(255),
  release_date       DATE
);

-- --------------------------------------------------------
-- Movie <-> Company (many-to-many)
-- --------------------------------------------------------
CREATE TABLE movie_companies (
  movie_id   INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
  company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, company_id)
);

CREATE INDEX idx_movie_companies_company_id ON movie_companies(company_id);

-- --------------------------------------------------------
-- Movie <-> Genre (many-to-many)
-- --------------------------------------------------------
CREATE TABLE movie_genres (
  movie_id INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
  genre_id INTEGER NOT NULL REFERENCES genres(genre_id) ON DELETE CASCADE,
  PRIMARY KEY (movie_id, genre_id)
);

CREATE INDEX idx_movie_genres_genre_id ON movie_genres(genre_id);

-- --------------------------------------------------------
-- Users
-- --------------------------------------------------------
CREATE TABLE users (
  user_id   SERIAL PRIMARY KEY,
  username  VARCHAR(50) NOT NULL UNIQUE,
  email     VARCHAR(100) NOT NULL UNIQUE,
  password  VARCHAR(255) NOT NULL,
  api_key   VARCHAR(64) UNIQUE,
  api_date  TIMESTAMP
);

-- --------------------------------------------------------
-- Completed Watch List
-- --------------------------------------------------------
CREATE TABLE completed_watchlist (
  completed_id            SERIAL PRIMARY KEY,
  user_id                 INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  movie_id                INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
  rating                  NUMERIC(2,1) CHECK (rating BETWEEN 1 AND 10),
  notes                   TEXT,
  date_initially_watched  DATE,
  date_last_watched       DATE,
  times_watched           INTEGER DEFAULT 1
);

CREATE INDEX idx_completed_watchlist_user_id ON completed_watchlist(user_id);
CREATE INDEX idx_completed_watchlist_movie_id ON completed_watchlist(movie_id);

-- --------------------------------------------------------
-- To-Watch List
-- --------------------------------------------------------
CREATE TABLE to_watchlist (
  list_id   SERIAL PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  movie_id  INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
  priority  SMALLINT CHECK (priority BETWEEN 1 AND 10),
  notes     TEXT
);

CREATE INDEX idx_to_watchlist_user_id ON to_watchlist(user_id);
CREATE INDEX idx_to_watchlist_movie_id ON to_watchlist(movie_id);