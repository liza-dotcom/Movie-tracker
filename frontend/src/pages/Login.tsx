import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import "../styles/App.css"; 
import backgroundImg from "../imgs/backgroundImg.jpg"; 

// the main page component 
export default function Login() {

  // do the authentication first using the function in AuthContext  
  const { setApiKey , setUserID } = useAuth(); 
  // set the navigate var for page naviagtion
  const navigate = useNavigate();

  // sett he state variables for username, password and the error field
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // declare the callback function when user logs in/submit the form 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
    console.log("Attempting login with:", { username, password });

    const response = await loginUser(username, password);

    console.log("Raw login response:", response); // <-- log the full response

    // Check the structure of the response
    if (response.success) {
      console.log("Login success flag is true.");

      if (response.token && response.userID) {
        console.log("API key and userID found:", response.api_key, response.userID);
        setApiKey(response.token);
        setUserID(response.userID);
        navigate("/home");
      } else {
        console.warn("API key or userID missing in response:", response);
        setError("Login failed: API key or userID missing");
      }
    } else {
      console.warn("Login failed according to server:", response);
      setError("Incorrect username or password.");
    }
  } catch (err: any) {
    console.error("Exception during login:", err);
    setError("Incorrect username or password.");
  }
  };

  // originally this page component will just render a form to the browser to get credentials 
  return (
    <div className="login-container" style={{ backgroundImage: `url(${backgroundImg})` }}>
      <div className="login-card">
        <h1>Sign In</h1>
        <form onSubmit={handleLogin}> {/* call the callback function declared above */}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Sign In</button>
          {error && <p className="error-msg">{error}</p>}
        </form>
        <p>
          Don't have an account?{" "}
          {/* CHANGE 3: Link to /signup instead of external PHP URL */}
          <Link to="/signup">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

