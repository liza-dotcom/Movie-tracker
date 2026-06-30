import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";


// import required pages to correctly setup app routing 
import Login from "./pages/Login";
import Home from "./pages/Home";
import ToWatch from "./pages/ToWatch";
import CompletedWatch from "./pages/CompletedWatch";
import UserStats from "./pages/UserStats";
import MovieDetails from "./pages/MovieDetails";
import type { ReactNode } from "react";
import Navbar from "./components/Navbar";
export default function AppRouter() {
  const { apiKey } = useAuth();

  // Protect routes and redirect to login if not authenticated
  const PrivateRoute = ({ children }: { children: ReactNode }) =>
    apiKey ? children : <Navigate to="/login" replace />;
    


  
  return (
    
      
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
                                                        
        <Route
          path="/towatch"
          element={

            <PrivateRoute>
              <ToWatch />
            </PrivateRoute>
          }
        />

        <Route
          path="/completed"
          element={
            <PrivateRoute>
              <CompletedWatch />
            </PrivateRoute>
          }
        />

        <Route
          path="/userstats"
          element={
            <PrivateRoute>
              <UserStats />
            </PrivateRoute>
          }
        />

        {/* Movie details with URL param */}
        <Route
          path="/movie/:movieId"
          element={
            <PrivateRoute>
              <MovieDetails />
            </PrivateRoute>
          }
        />

        {/* Default redirect to /home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    
  );
}
