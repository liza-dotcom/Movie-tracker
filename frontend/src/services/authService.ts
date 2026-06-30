import { getApiBase } from "./apiClient";

// Declare an asynchronous function for making the login request and getting the token from backend

export async function loginUser(username: string, password: string) {
  const url = `${getApiBase()}/users/login`; // updated: new backend uses /users/login, not /users/session

  try {
    // declare the request info (type,header,body etc) convert the credentials to json and wait to response from backend before proceeding further,
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // If the backend returned any error
    if (!response.ok) {
      // Get readable text from the server if provided
      const errorText = await response.text();
      throw new Error(
        errorText || `Login failed with status ${response.status}` // if no error text is recieved from backend , throw a new error
      );
    }

    // convert response into json and store it into a const
    const data = await response.json();

    // confirm that expected structure is received at the end
    // updated: new backend returns { success, token, userId } instead of { api_key }
    if (!data.token) {
      throw new Error("Server did not return a valid token.");
    }

    return data; // returns { success: true, token: "...", userId: ... }
  } catch (error: any) {
    // Catch connection errors, server timeouts, etc.
    console.error("Login request failed:", error);
    throw new Error(error.message || "Unable to login at this time.");
  }
}