import { useCallback, useMemo, useState, useEffect, type ReactNode } from 'react';
import { createContext, useContext } from 'react';



// create the AuthObject interface to definr the type of Api key and pass it down as a context
 interface AuthObject {
  apiKey: string|null;
  userID: number | null;
  setApiKey: (key:string|null)=>void;
  setUserID: (id: number | null) => void;
}

// set the initial value of AuthContext while creating it to null so that useAuth can be called only inside the provider(when apikey is not null)
export const AuthContext = createContext<AuthObject | null>(null);

// declare the AuthProvider props

export function AuthProvider({ children }: { children?: ReactNode }){


    // set the initial state of apikey to null 
    const [apiKey, setApiKey] = useState<string | null>(() => {
      console.log("Initial apiKey from localStorage:", localStorage.getItem("apiKey"));
    return localStorage.getItem("apiKey"); // load from localStorage on first render
    });
    const [userID, setUserID] = useState<number | null>(() => {
      const saved = localStorage.getItem("userID");
      console.log("Initial userId from localStorage:", saved); 
      return saved ? parseInt(saved) : null;
    });


    useEffect(() => {
        if (apiKey) {
        localStorage.setItem("apiKey", apiKey); // save on change
        
        } else {
        localStorage.removeItem("apiKey"); // remove if null
        }
    }, [apiKey]);

    useEffect(() => {
      if (userID !== null) localStorage.setItem("userID", userID.toString());
      else localStorage.removeItem("userID");
    }, [userID]);
  
  return (
    <AuthContext.Provider value={{ apiKey, setApiKey, userID, setUserID }}>
      {children}
    </AuthContext.Provider>
  );
}



// helper function to avoid misuse (for example, if no value is provided for the apikey)
export function useAuth(): AuthObject {
  const value = useContext(AuthContext);

  if (value == null) {
    throw new Error("useAuth called without a provided value");
  }

  return value;
}