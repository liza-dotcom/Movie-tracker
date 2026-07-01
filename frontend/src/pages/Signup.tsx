import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/App.css";
import backgroundImg from "../imgs/backgroundImg.jpg";
import { getApiBase } from "../services/apiClient";

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${getApiBase()}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Use server's message if available (e.g. "Username or email already in use")
        throw new Error(data.message || "Signup failed");
      }

      // Signup successful — redirect to login so user can sign in
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Unable to create account at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${backgroundImg})` }}>
      <div className="login-card">
        <h1>Create Account</h1>
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
