import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Render the app component after wrapping it into browserRouter and AuthProvider for safe api usage 

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode> 
    
      <AuthProvider>
        <App />
      </AuthProvider>
    
  </React.StrictMode>
);
