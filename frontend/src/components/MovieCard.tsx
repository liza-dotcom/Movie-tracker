import "../styles/movieCardStyles.css";
import { useState } from "react";
import { getMovieDetails } from "../services/movieService";


// declare the interface for props (including basic details for main page), all the details will be visible/rendered on click 
export interface MovieCardProps {
  movie: {
    movie_id: number;
    title: string;
    cover: string;
    rating: string;
    priority?: number; // optional for To Watch list
    notes?: string; // optional 
  };
  onClick?: (movie: any) => void;
  onQuickAdd?: () => void; 
  actionButtonText?: string; // text for the button (add or mark completed based on the list/page user is at )
  onActionButtonClick?: () => void;
  onRemove?: () => void;       
  onQuickPriority?: () => void; 
  onUpdateEntry?: () => void; 
  children?: React.ReactNode;

  
}

export default function MovieCard({ movie, onClick, actionButtonText , onActionButtonClick, onRemove, onQuickPriority,onUpdateEntry, children }: MovieCardProps) {

  const [showDetails, setShowDetails] = useState(false); // do not show deatils in default state 
  const [details, setDetails] = useState<any>(null); 
  const [showDropdown, setShowDropdown] = useState(false); // dropdown button for features(update priority, remove,or edit entry-notes or priority) but its set to false by default 


  const handleClick = async () => {
    
    try {
      const data = await getMovieDetails(movie.movie_id);
      setDetails(data.data); // full movie details
      setShowDetails(true); // set the state to true 
    } catch (err) {
      console.error("Failed to fetch movie details:", err);
    }
  };
  
   
  return (
      <>
      <div
        className="movie-card"
        onClick={handleClick}
      >

        
        <img
          src={movie.cover}
          alt={movie.title}
          className="movie-poster"
        />
        <div className="movie-info">
          <span className="movie-title">{movie.title}</span>
          <span className="movie-rating">⭐️{movie.rating}</span>
        </div>
        <div className="action-buttons-wrapper" style={{ position: "relative" }}>
        <div className="action-buttons">

          {onActionButtonClick && (
            <button
              className="quick-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onActionButtonClick();
              }}
            >
              {actionButtonText}
            </button>
          )}

          {onRemove || onQuickPriority || onUpdateEntry ? (
            <button
              className="more-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              ⋯
            </button>
          ) : null}

       </div>

          {/* ✅ Render children here */}
          {children && <div className="movie-card-children">{children}</div>}
       </div>
       <div>
        {showDropdown && (
    <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
      {onRemove && <button onClick={() => { setShowDropdown(false); onRemove(); }}>Delete</button>}
      {onQuickPriority && <button onClick={() => { setShowDropdown(false); onQuickPriority(); }}>Change Priority</button>}
      {onUpdateEntry && <button onClick={() => { setShowDropdown(false); onUpdateEntry(); }}>Update Entry</button>}
    </div>
  )}
       </div>
  
    </div>
    {/* movie details section for showing the details of a movie , only show details when state is true(i.e. user click a movie) and details exist(fetcehd from backend)*/}
    {showDetails && details && (
        
        <div

          className="movie-details-overlay" 
          onClick={() => setShowDetails(false)} 
        >  
          <div
            className="movie-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={() => setShowDetails(false)}>
              ✕
            </button>

            <div className="details-header">
              <img
                src={details.poster}
                alt={details.title}
                className="details-poster"
              />
              <div className="details-basic">
                <h2>{details.title}</h2>
                <p><strong>Tagline:</strong> {details.tagline}</p>
                <p><strong>Overview:</strong> {details.overview}</p>
              </div>
            </div>

            <div className="details-grid">
              <div className="details-col">
                <p><strong>Rating:</strong> {details.vote_average}</p>
                <p><strong>Votes:</strong> {details.vote_count}</p>
                <p><strong>Runtime:</strong> {details.runtime} mins</p>
                <p><strong>Language:</strong> {details.original_language}</p>
              </div>

              {/* Extra info for To Watch list */}
              <div className="details-extra">
                {movie.priority && (
                  <p><strong>Priority:</strong> {movie.priority}</p>
                )}
                {movie.notes && (
                  <p><strong>Notes:</strong> {movie.notes}</p>
                )}
              </div>


              <div className="details-col">
                <p><strong>Release Date:</strong> {details.release_date}</p>
                <p><strong>Budget:</strong> ${details.budget.toLocaleString()}</p>
                <p><strong>Revenue:</strong> ${details.revenue.toLocaleString()}</p>
              </div>

              <div className="details-col">
                <p>
                  <strong>Genres:</strong>
                  <br />
                  {details.genres.join(", ")}
                </p>
                <p>
                  <strong>Companies:</strong>
                  <br />
                  {details.companies.join(", ")}
                </p>
              </div>
            </div>

            {details.homepage && (
              <a
                href={details.homepage}
                target="_blank"
                rel="no link availabe in api :)"
                className="homepage-link"
              >
                Visit Official Website
              </a>
            )}
          </div>
        </div>
      )}
    
    </>
  );
}
