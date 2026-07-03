 // scripts/seed_tmdb.js
// One-time script to seed the movie_app database with real TMDB data

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const TOTAL_PAGES = 10; // 20 movies per page = 200 movies total

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status} ${url}`);
  return res.json();
}

async function seedGenres() {
  console.log('Seeding genres...');
  const data = await fetchJSON(`${TMDB_BASE}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
  
  for (const genre of data.genres) {
    await pool.query(
      `INSERT INTO genres (genre_id, genre_name) VALUES ($1, $2)
       ON CONFLICT (genre_id) DO NOTHING`,
      [genre.id, genre.name]
    );
  }
  console.log(`Inserted ${data.genres.length} genres.`);
}

async function seedMovies() {
  console.log('Seeding movies...');
  let movieCount = 0;
  let companyCount = 0;

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`Fetching page ${page}/${TOTAL_PAGES}...`);
    
    const data = await fetchJSON(
      `${TMDB_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
    );

    for (const movie of data.results) {
      // Get full movie details (includes production companies, runtime, etc.)
      const details = await fetchJSON(
        `${TMDB_BASE}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=en-US`
      );

      // Insert movie
      await pool.query(
        `INSERT INTO movies (
          movie_id, title, tagline, overview, original_language,
          poster, runtime, vote_average, vote_count,
          budget, revenue, homepage, release_date
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        ON CONFLICT (movie_id) DO NOTHING`,
        [
          details.id,
          details.title,
          details.tagline || null,
          details.overview || null,
          details.original_language || null,
          details.poster_path ? `${POSTER_BASE}${details.poster_path}` : null,
          details.runtime || null,
          details.vote_average || null,
          details.vote_count || null,
          details.budget || null,
          details.revenue || null,
          details.homepage || null,
          details.release_date || null,
        ]
      );
      movieCount++;

      // Insert genres relationship
      for (const genre of details.genres || []) {
        await pool.query(
          `INSERT INTO movie_genres (movie_id, genre_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [details.id, genre.id]
        );
      }

      // Insert production companies
      for (const company of details.production_companies || []) {
        await pool.query(
          `INSERT INTO companies (company_id, company_name)
           VALUES ($1, $2) ON CONFLICT (company_id) DO NOTHING`,
          [company.id, company.name]
        );

        await pool.query(
          `INSERT INTO movie_companies (movie_id, company_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [details.id, company.id]
        );
        companyCount++;
      }

      // Small delay to be respectful to TMDB rate limits
      await new Promise(r => setTimeout(r, 100));
    }
  }

  console.log(`Inserted ${movieCount} movies and ${companyCount} company relationships.`);
}

async function main() {
  try {
    console.log('Starting TMDB seed...');
    await seedGenres();
    await seedMovies();
    console.log('Seeding complete!');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

main();