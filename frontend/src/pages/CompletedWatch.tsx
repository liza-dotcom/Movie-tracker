import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import {
  getCompletedList,
  incrementTimesWatched,
  type CompletedMovie,
} from "../services/completedWatchService";
import { getAllMovies } from "../services/movieService";
import { getApiBase } from "../services/apiClient";
import "../styles/Completed.css"; 

export default function CompletedWatch() {
  const { apiKey, setApiKey } = useAuth();
  const navigate = useNavigate();

  // State variables
  const [completedList, setCompletedList] = useState<CompletedMovie[]>([]);
  const [allMovies, setAllMovies] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'date_last_watched' | 'date_initially_watched'>('rating');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [personalDetailsMovie, setPersonalDetailsMovie] = useState<CompletedMovie | null>(null); // state to show personalized details like times watched etc
  
    const [modal, setModal] = useState<{
    message: string;
    defaultValue: string;
    onConfirm: (val: string) => void;
  } | null>(null);

  const showPrompt = (message: string, defaultValue: string = ""): Promise<string | null> => {
    return new Promise((resolve) => {
      setModal({
        message,
        defaultValue,
        onConfirm: (val) => {
          setModal(null);
          resolve(val);
        },
      });
    });
  };
  

  // Logout handler
  const handleLogout = () => {
    setApiKey(null);
    navigate("/login");
  };

  // Fetch all movies (for cover and title)
  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await getAllMovies();
        setAllMovies(response.data || []);
      } catch (err) {
        console.error("Failed to fetch movies:", err);
      }
    }
    fetchMovies();
  }, []);

  // Fetch completed list whenever apiKey, sortBy, sortOrder, or allMovies changes
  useEffect(() => {
    if (!apiKey || allMovies.length === 0) return;
    fetchCompletedList();
  }, [apiKey, allMovies, sortBy, sortOrder]);

  // Fetch completed list
  const fetchCompletedList = async () => {
    try {
      const entries = await getCompletedList(apiKey!, undefined, sortBy, sortOrder);
      console.log("First completed entry:", entries[0]); // add this line
      setCompletedList(entries);
    } catch (err) {
      console.error("Failed to fetch completed list:", err);
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
  };

  // Increment times watched 
  const handleIncrementTimesWatched = async (completedID: number) => {
    try {
      await incrementTimesWatched(apiKey!, completedID);
      fetchCompletedList(); // refresh
    } catch (err) {
      console.error("Failed to increment times watched:", err);
      alert("Failed to increment times watched");
    }
  };

  // handle when user update rating for a movie
  const handleUpdateRating = async (entry: CompletedMovie) => {
  const ratingInput = await showPrompt(
    `Enter new rating (1-10) for "${entry.title}":`, 
    entry.rating?.toString() || ""
  );
  if (ratingInput === null) return;

  const notesInput = await showPrompt(
    `Enter notes for "${entry.title}":`,
    entry.notes || ""
  );
  if (notesInput === null) return;

  const numericRating = ratingInput.trim() !== "" ? parseFloat(ratingInput) : null;

  if (numericRating !== null && (numericRating < 1 || numericRating > 10)) {
    console.error("Rating must be between 1 and 10.");
    return;
  }

  try {
    // Update rating
    if (numericRating !== null) {
      const res = await fetch(`${getApiBase()}/completedwatchlist/entries/${entry.completed_id}/rating`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ rating: numericRating })
      });
      if (!res.ok) throw new Error("Failed to update rating");
    }

    // Update notes if changed
    if (notesInput !== entry.notes) {
      await fetch(`${getApiBase()}/completedwatchlist/entries/${entry.completed_id}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ notes: notesInput })
      });
    }

    fetchCompletedList();
  } catch (err) {
    console.error(err);
  }
};

  // Merge movie details with completed entries
  const mergedList = completedList.map(entry => {
    const movie = allMovies.find(m => m.movie_id === entry.movie_id);
    return {
      ...entry,
      rating: entry.rating ?? 0,
    };
  });

  

  // Sort based on current sortBy and sortOrder
  const sortedMergedList = [...mergedList].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'date_last_watched':
        aValue = new Date(a.date_last_watched).getTime();
        bValue = new Date(b.date_last_watched).getTime();
        break;
      case 'date_initially_watched':
        aValue = new Date(a.date_initially_watched).getTime();
        bValue = new Date(b.date_initially_watched).getTime();
        break;
    }

    if (aValue < bValue) return sortOrder === 'ASC' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'ASC' ? 1 : -1;
    return 0;
  });

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="completed-container">
        <h1>My Completed Movies</h1>

        <div className = "sort-btn">
          <label>Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="rating">Rating</option>
            <option value="date_last_watched">Date Last Watched</option>
            <option value="date_initially_watched">Date Initially Watched</option>
          </select>
          <button onClick={toggleSortOrder}>{sortOrder === 'ASC' ? '↑' : '↓'}</button>
        </div>

        <div className="completedlist-grid">
          {sortedMergedList.map(entry => (
            <MovieCard
              key={entry.completed_id}
              movie={{
                movie_id: entry.movie_id,
                title: entry.title,
                cover: entry.poster || '',
                rating: entry.rating.toString(),
                notes: entry.notes,
              }}
              actionButtonText="↺ Watched Again"
              onActionButtonClick={() => handleIncrementTimesWatched(entry.completed_id)}
              onUpdateEntry={() => handleUpdateRating(entry)}
            >
              {/* Add personalized details button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // prevent main movie modal from opening
                  setPersonalDetailsMovie(entry); // set the current entry for the modal
                }}
                style={{ marginTop: "0.5em", fontSize: "0.85em" }}
              >
                📋 My Details
              </button>
            </MovieCard>
          ))} 
          {personalDetailsMovie && (
            <div className="movie-details-overlay" onClick={() => setPersonalDetailsMovie(null)}>
              <div className="movie-details-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setPersonalDetailsMovie(null)}>✕</button>
                <h2>{personalDetailsMovie.title}</h2>
                <div className="details-grid">
                  <p><strong>Rating:</strong> {personalDetailsMovie.rating}</p>
                  <p><strong>Times Watched:</strong> {personalDetailsMovie.times_watched}</p>
                  <p><strong>Date Initially Watched:</strong> {personalDetailsMovie.date_initially_watched}</p>
                  <p><strong>Date Last Watched:</strong> {personalDetailsMovie.date_last_watched}</p>
                  {personalDetailsMovie.notes && <p><strong>Notes:</strong> {personalDetailsMovie.notes}</p>}
                </div>
              </div>
            </div>
          )}



        </div>
      </div>

      {modal && (
    <Modal
      message={modal.message}
      defaultValue={modal.defaultValue}
      onConfirm={modal.onConfirm}
      onCancel={() => setModal(null)}
    />
)}
    </>
  );
}
