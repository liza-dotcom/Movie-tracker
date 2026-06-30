/*
this file contains. the logic for handling all the backend calls to perform all the movies related user stories
The entire functioning is divided among various functions with each function handling an appropriate endpoint call 
for a particular feature available to the user.
*/

import { getApiBase } from "./apiClient";

const BASE_URL = getApiBase();

// Declare the  function to fetch  all the movies for the main maovi catalogue with a limited info for each movie

export async function getAllMovies() {
    const res = await fetch(`${BASE_URL}/movies`);

    if (!res.ok) {
        throw new Error("Failed to fetch movies"); // throw a new error if response from backend is not as expected.
    }
 
    return res.json(); // return the response (movie data for all movies) in json format.
}

// Declare the function to get full movie details abouit 1 particular movie using the endpoint /movies/{id}

export async function getMovieDetails(movieId: string | number) {
    const res = await fetch(`${BASE_URL}/movies/${movieId}`);

    if (!res.ok) {
        throw new Error(`Failed to fetch movie details (${res.status})`); // do error handling 
    }

    return res.json(); // return response in json format
}

// declare the function used to filter movies by 2 criteria: title and genre

export async function getMoviesByFilter(filters: {
  title?: string;
  genre?: string;
}) {
  const query = new URLSearchParams();

  // verify the kind of filter passed/provided by the user 

  if (filters.title) query.append("title", filters.title); // append the suitable filter in query string 
  if (filters.genre) query.append("genre", filters.genre);

  const res = await fetch(`${BASE_URL}/movies?${query.toString()}`); // execute the final url after addding filters 

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch filtered movies"); // show error message
  }

  return await res.json(); // return json formatted response.                        
}                             