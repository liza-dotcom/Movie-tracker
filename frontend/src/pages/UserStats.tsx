import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import  { getUserStats, type UserStats } from "../services/userStatsService";
import "../styles/User.css";

export default function UserStatsPage() {
  const { apiKey, setApiKey, userID} = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const handleLogout = () => {
    setApiKey(null);
    navigate("/login");
  };

  useEffect(() => {
  if (!apiKey || userID === null) {
    setLoading(false); // <-- IMPORTANT
    return;
  }

  async function fetchStats() {
    try {
      setLoading(true);
      const data = await getUserStats(userID!, apiKey!);
      setStats(data);
      console.log("here is data" + data )
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }

  fetchStats();
}, [apiKey, userID]);

  if (!apiKey) return <p>Please log in to view stats.</p>;

  return (
    <>
      <Navbar onLogout={handleLogout} />
      <div className="stats-container">
        <h1>User Stats</h1>
        {loading && <p>Loading stats...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h2>Username</h2>
              <p>{stats.userInfo.username}</p>
            </div>
            <div className="stat-card">
              <h2>Email</h2>
              <p>{stats.userInfo.email}</p>
            </div>
            <div className="stat-card">
              <h2>Total Time Watched</h2>
              <p>{stats.totalTimeWatched} mins</p>
            </div>
            <div className="stat-card">
              <h2>Average Rating</h2>
              <p>{stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="stat-card">
              <h2>Completed Movies</h2>
              <p>{stats.completedMoviesCount}</p>
            </div>
            <div className="stat-card">
              <h2>Planned to Watch</h2>
              <p>{stats.plannedToWatchCount}</p>
            </div>
            <div className="stat-card">
              <h2>Planned Time to Watch</h2>
              <p>{stats.plannedTimeToWatch} mins</p>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
