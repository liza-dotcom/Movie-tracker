-- Seed data for local testing
-- Small, realistic dataset — just enough to test queries and relationships

-- Genres
INSERT INTO genres (genre_name) VALUES
  ('Drama'),
  ('Sci-Fi'),
  ('Comedy'),
  ('Thriller');

-- Companies
INSERT INTO companies (company_name) VALUES
  ('Neon Pictures'),
  ('Atlas Studios'),
  ('Indie Frame Films');

-- Movies
INSERT INTO movies (title, tagline, overview, original_language, poster, runtime, vote_average, vote_count, budget, revenue, homepage, release_date) VALUES
  ('Signal Drift', 'Some signals are never meant to be found.', 'A radio engineer intercepts a transmission that shouldn''t exist.', 'en', NULL, 118.00, 7.4, 1820, 12000000, 38000000, NULL, '2023-09-15'),
  ('Paper Tigers', 'Everyone is performing.', 'A workplace comedy about a marketing team faking confidence they don''t have.', 'en', NULL, 96.50, 6.8, 940, 4000000, 9000000, NULL, '2022-03-02'),
  ('The Quiet Ledger', 'Some debts are not financial.', 'A forensic accountant uncovers a decades-old conspiracy in a small town.', 'en', NULL, 132.00, 8.1, 3105, 22000000, 71000000, NULL, '2024-11-08');

-- Movie <-> Genre relationships
INSERT INTO movie_genres (movie_id, genre_id) VALUES
  (1, 2), (1, 4),         -- Signal Drift: Sci-Fi, Thriller
  (2, 3),                 -- Paper Tigers: Comedy
  (3, 1), (3, 4);         -- The Quiet Ledger: Drama, Thriller

-- Movie <-> Company relationships
INSERT INTO movie_companies (movie_id, company_id) VALUES
  (1, 1),
  (2, 3),
  (3, 2);

-- Test user
-- Note: password below is a placeholder, NOT a real bcrypt hash.
-- Once we build auth in the backend, we'll replace this with a properly hashed password.
INSERT INTO users (username, email, password) VALUES
  ('testuser', 'testuser@example.com', 'placeholder_will_be_replaced_with_bcrypt_hash');

-- A to-watch entry and a completed entry, for testing both list types
INSERT INTO to_watchlist (user_id, movie_id, priority, notes) VALUES
  (1, 2, 3, 'Heard the writing is sharp');

INSERT INTO completed_watchlist (user_id, movie_id, rating, notes, date_initially_watched, times_watched) VALUES
  (1, 1, 8.5, 'Better the second time around', '2024-01-10', 2);