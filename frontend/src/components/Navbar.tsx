import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

interface NavbarProps {
  onSearch?: (filters: { title?: string; genre?: string }) => void; // callback from Home
  onLogout: () => void;
}

export default function Navbar({ onSearch , onLogout}: NavbarProps) {
  const [title, setTitle] = useState(""); // state for title input
  const [genre, setGenre] = useState(""); // state for genre input

  // handle input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGenre(value);
  };

  // prevent form submission from refreshing page
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onSearch) onSearch({ title, genre }); // trigger search on submit
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="nav-logo">MovieApp</Link>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/towatch" className="nav-link">To Watch</Link>
        <Link to="/completed" className="nav-link">Completed</Link>
        <Link to="/userstats" className="nav-link">User Stats</Link>
      </div>

      <form className="navbar-search" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search by title"
          value={title}
          onChange={handleTitleChange} // handle title changes
        />
        <input
          type="text"
          placeholder="Search by genre"
          value={genre}
          onChange={handleGenreChange} // handle genre changes
        />
        <button type="submit">Search</button>
      </form>

      <div className="navbar-right">
        <button className="logout-btn" onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}
