import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import MovieCard from "../components/MovieCard";
import Navbar from "../components/Navbar";
import { useNavigate, Navigate } from "react-router-dom";
import {
  getToWatchList,
  updatePriority,
  updateToWatchEntry,
  markAsWatched,
  deleteToWatchEntry,
  type ToWatchEntry,
} from "../services/toWatchService";
import "../styles/ToWatch.css";
import { getAllMovies } from "../services/movieService";



export default function ToWatchList() {

  // create state variables for various field required for toWatch (api key, watchList, sort order)
  const { apiKey } = useAuth();
  const {setApiKey} = useAuth();
  const navigate = useNavigate();
  const [watchList, setWatchList] = useState<ToWatchEntry[]>([]);
  const [sortAsc, setSortAsc] = useState(true); // default order is set to ascending 
  const [allMovies, setAllMovies] = useState<any[]>([]);


// Handle logout for navbar on the top of page 
  function handleLogout() {
    setApiKey(null);
    navigate("/login");
  }

  // fetch all movies to show movie card appropriately 
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

  // check for api key first
  useEffect(() => {
    if (!apiKey || allMovies.length === 0) return;
    fetchList();
  }, [apiKey, allMovies]);

  // if api key is authenticated call the service function to get all toWatch list entries 
  const fetchList = async () => {
    try {
      const entries = await getToWatchList(apiKey!);

      // set the watchList state
      setWatchList(entries);
    } catch (err) {
      console.error("Failed to fetch toWatch list:", err);
    }
  };

  //sort the entries in the list pair by pair and take priority=0 if its not set in the table(db)
  const sortedList = [...watchList].sort((a, b) =>
    sortAsc ? (a.priority || 0) - (b.priority || 0) : (b.priority || 0) - (a.priority || 0)
  );

  // Quick priority change by user
  const handlePriorityChange = async (entryId: number) => {
    const entry = watchList.find((e) => e.listID === entryId); // get the list credentials (id and all)
    if (!entry) return; // return if entry list with that id is not found
    const priorityInput = prompt("Enter new priority(1-10):", entry.priority?.toString() || "0"); // get the new priority 
    const newPriority = priorityInput ? parseInt(priorityInput) : 0;

    if (isNaN(newPriority)) {
      alert("Priority must be a number between 1 and 10");
      return;
    }
    try {
      await updatePriority(entryId, newPriority, apiKey!); // update priority and get the list according to updated priorities
      alert("Priority updated!");
      fetchList();   
    } catch (err) {
      console.error("Failed to update priority:", err);
      alert("Failed to update priority");
    }
  };

  // Mark a movie in list as watched/completed
  const handleMarkAsWatched = async (entryId: number) => {
    const ratingInput = prompt("Enter rating (1-10) for this movie (optional):");

  // Convert to number if provided, otherwise null
  const numericRating = ratingInput !== null && ratingInput.trim() !== "" ? parseFloat(ratingInput) : null; // send null if empty(user does not provide a rating )

  // Optional: validate numeric rating if provided
  if (numericRating !== null && (numericRating < 1 || numericRating > 10)) {
    alert("Rating must be between 1 and 10.");
    return;
  }

  try {
    await markAsWatched(entryId, apiKey!, numericRating);
    fetchList();
  } catch (err) {
    console.error("Failed to mark as watched:", err);
    alert("Failed to mark as watched. Please try again.");
  }
  };

  // Remove movie from toWatch list
  const handleRemove = async (entryId: number) => {
    if (!confirm("Are you sure you want to remove this movie?")) return;
    try {
      await deleteToWatchEntry(entryId, apiKey!);
      fetchList(); // refresh the watchList after removal
    } catch (err) {
      console.error("Failed to remove movie:", err);
    }
  };

  // Update full entry (notes + priority)
  const handleUpdateEntry = async (entryId: number) => {
    const entry = watchList.find((e) => e.listID === entryId);
    if (!entry) return;

    const newNotes = prompt("Enter notes:", entry.notes) || "";
    const priorityInput = prompt("Enter priority(1-10):", entry.priority?.toString() || "0");
    const newPriority = priorityInput ? parseInt(priorityInput) : 0;

    if (isNaN(newPriority)) {
      alert("Priority must be a number between 1 and 10");
      return;
    }

    try {
      await updateToWatchEntry(
        entryId,
        {
          notes: newNotes,
          priority: newPriority,
          movieID: entry.movieID  //pass the movieID for selected entry , on which user is doing stuff
        },
        apiKey!
      );
      alert("Entry updated successfully!");
      fetchList();
    } catch (err) {
      console.error("Failed to update entry:", err);
      alert("Failed to update entry");
    }
  };


  

  return (
    <>
    <Navbar onLogout={handleLogout} />
    <div className="watchlist-container">
      <div className="watchlist-header">
        <h1>My To-Watch List</h1>

        <button
          className="sort-btn"
          onClick={() => setSortAsc(!sortAsc)}
        >
          Sort {sortAsc ? "↑" : "↓"}
        </button>
      </div>


      <div className="watchlist-grid" style={{ display: "flex", flexWrap: "wrap", gap: "1em", marginTop: "1em" }}>
        {sortedList.map((entry) => {
          const movie = allMovies.find(m => m.movie_id === entry.movieID); // find movie details by ID

          return (
            <MovieCard
              key={entry.movieID}
              movie={{
                movie_id: entry.movieID,
                title: movie?.title || `Movie ${entry.movieID}`,
                cover: movie?.cover || "",
                rating: movie?.rating?.toString() || "-",
                priority: entry.priority,  // pass priority
                notes: entry.notes,        // pass notes
              }}
              onClick={() => handleMarkAsWatched(entry.listID)}
              actionButtonText="✔ Mark Completed"
              onActionButtonClick={() => handleMarkAsWatched(entry.listID)}
              onRemove={() => handleRemove(entry.listID)}
              onQuickPriority={() => handlePriorityChange(entry.listID)}
              onUpdateEntry={() => handleUpdateEntry(entry.listID)}
            />
          );
        })}
      </div>
    </div>
    </>
  );
}
