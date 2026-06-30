import React from "react";
import { Navigate , useNavigate} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";

// create a component to make sure user is redirected to login page if Auth context is empty/null, it will be used to wrap the routes to avoid any page access without an api key(login)
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {

   // call the useAuth helper to fill the vaue of API key 
  const { apiKey, setApiKey } = useAuth(); 
  
  
  const navigate = useNavigate();
  if (!apiKey) {
    // if not logged in then redirect to login page
    return <Navigate to="/login" replace />;
  }
  
  const handleLogout = () => {
    
      setApiKey(null);
    
    navigate("/login");
  };
  return (
    <>
      <Navbar onLogout={handleLogout} />
      <main>{children}</main>
    </>
  );
};
