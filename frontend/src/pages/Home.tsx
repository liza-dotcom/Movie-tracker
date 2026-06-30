//import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import MovieCard from "../components/MovieCard";
import { getAllMovies } from "../services/movieService";
import { useState } from "react";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import { getMoviesByFilter } from "../services/movieService";
import "../styles/Home.css";
import { addToWatch } from "../services/toWatchService";



export default function Home() {
  const { apiKey, setApiKey } = useAuth(); 
  const navigate = useNavigate();
  const [movies, setMovies] = useState<any[]>([]);

  function handleLogout() { 
    setApiKey(null);
    navigate("/login");
  }

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await getAllMovies(); // { success: true, data: [...] }
        setMovies(response.data || []); // set the actual array
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setMovies([]); // fallback
      }
    }
    fetchMovies();
  }, []);

  // function to call the API with title and genre filters
const handleSearch = async (filters: { title?: string; genre?: string }) => {
  try {
    const response = await getMoviesByFilter(filters);

    const moviesArray = Array.isArray(response.data) ? response.data : [];

    // map API fields to MovieCard props
    const formattedMovies = moviesArray.map((m: any) => ({
      movie_id: m.movie_id,
      title: m.title,
      cover: m.poster,           
      rating: m.vote_average,    
    }));

    setMovies(formattedMovies);
    console.log("Movies state updated:", formattedMovies);
  } catch (err) {
    console.error("Search failed:", err);
  }
};

// Function to handle quick add of a movie to toWatchList from home page 

  const handleQuickAdd = async (movieId: number) => {
    if (!apiKey) return; // safety
    try {
      await addToWatch(movieId, apiKey);
      alert("Movie added to To Watch list!"); // simple feedback
    } catch (err) {
      console.error("Failed to add movie:", err);
      alert("Failed to add movie to To Watch list");
    }
  };

  return (
    <div className="home-page">
      <Navbar onSearch={handleSearch} onLogout={handleLogout} />
      <h1>Home Page</h1>

      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard key={movie.movie_id} movie={movie} 
          actionButtonText="+ Add to Watchlist"
          onActionButtonClick={() => handleQuickAdd(movie.movie_id)}
          
          />
        ))}
      </div>
    </div>
  );
}


