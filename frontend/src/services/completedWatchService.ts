import { getApiBase } from './apiClient'; // call the function in apiClient to get BASE URL

// define an interface for required fields for a movie in completedWatchList 
export interface CompletedMovie {
  completed_id: number;
  user_id: number;
  movie_id: number;
  rating: number;
  notes: string;
  date_initially_watched: string;
  date_last_watched: string;
  times_watched: number;
  title: string;
  poster?: string; 
}

// Declare the function to get all the entries in a copletedWatchList(of given id) for the user whose apikey is recieved 
export async function getCompletedList(
  apiKey: string,
  minRating?: number,
  sortBy: 'rating' | 'date_last_watched' | 'date_initially_watched' = 'rating', // set default sort criteria to rating , but can be changed by user 
  sortOrder: 'ASC' | 'DESC' = 'DESC' // set default sorting order to descending order of rating 
): Promise<CompletedMovie[]>  //set treturn type to a promise 
 {
  const base = getApiBase(); // call the function to get apikey for logged in user

  const params = new URLSearchParams(); // get all the paramaters from the url and store it into an object var
  if (minRating !== undefined) params.append('min_rating', minRating.toString()); //add the rating criteria to the url before sending request
  params.append('sortBy', sortBy);  // add the sorting criteria to url as well 
  params.append('sortOrder', sortOrder); // add sorting order to url 

  const url = `${base}/completedwatchlist/entries?${params.toString()}`; // store the final url after addign sorting criteria and order

  const res = await fetch(url, 
    // prepare the request : body, type, headers etc.
    {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });
 // handle errors
  if (!res.ok) {
    let errorMsg = `Failed to fetch completed watch list (${res.status})`;
    try {
      const data = await res.json();
      if (data.message) errorMsg += `: ${data.message}`;
    } catch (e) {
      // ignore JSON parse errors
    }
    throw new Error(errorMsg);
  }

  try {
    const data = await res.json();
    return data.data; // return an array of movies in the completedWatchList
  } catch (err) {
    throw new Error('Failed to parse JSON from completed watch API');
  }
}

// declare the function to increment the number of times watched for a movie and also show the date when the movie was last watched by the user

export async function incrementTimesWatched(apiKey: string, completedID: number) {
  const base = getApiBase(); // get the request url 

  const url = `${base}/completedwatchlist/entries/${completedID}/times-watched`; // make the endpoint from base url by appending 

  // make the request (defien method, url, headers etc) and store the respose from request in a variable
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    }
  });

  // handle errors if there is any problem in the response
  if (!res.ok) {
    let msg = `Failed to increment times watched (${res.status})`;
    try {
      const data = await res.json();
      if (data.message) msg += `: ${data.message}`;
    } catch {}
    throw new Error(msg);
  }
  // return the reponnse in json format as a data array 
  const data = await res.json();
  return data;
}


