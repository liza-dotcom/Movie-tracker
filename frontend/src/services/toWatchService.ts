import { getApiBase } from "./apiClient";

// set the base url imported from .env through apiClient 
const BASE = getApiBase();

export interface ToWatchEntry {
  list_id: number;      
  user_id: number;      
  movie_id: number;     
  notes?: string;
  priority?: number;
  title?: string;   
  
}
 // Declare the function to fetch all entries in the user's toWatch list to display when user visits it
 
export async function getToWatchList(apiKey: string): Promise<ToWatchEntry[]> {
  const res = await fetch(`${BASE}/towatchlist/entries`, {
    method: "GET",
    headers:
     {  
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
     },

  });
  if (!res.ok) throw new Error("Failed to fetch toWatch list"); // handle any error
  const data = await res.json();
  return data.data;
}


 // Declare the function to add a movie to the toWatch list (quick add)
 
 // used a paramater movieId to get ID of the movie to add
 
export async function addToWatch(movieID: number, apiKey: string) {
  const res = await fetch(`${BASE}/towatchlist/entries`, {
    // set the request 
    method: "POST",
    headers:
     {  
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
     },
    body: JSON.stringify({ movieID }), // send movieID for post 
  });
  if (!res.ok) throw new Error("Failed to add movie to toWatch list"); // handle error
  return await res.json(); // return json formatted response 
}

 // Declare the function to update an existing toWatch entry (notes, priority, etc.) uses the params toWatchListId , updated rating or notes and apikey  etc.
 
export async function updateToWatchEntry(
  listID: number,
  updates: { movieID:number; notes?: string; priority?: number },
  apiKey: string
) {
  const res = await fetch(`${BASE}/towatchlist/entries/${listID}`,
 {
    method: "PUT",
    headers:
     {  
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
     },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update toWatch entry");
  return await res.json();
}


 //Declare the function for quick update of just priority using a predesigned endpoint

export async function updatePriority(
  entryId: number,
  priority: number,
  apiKey: string
) {
  const res = await fetch(`${BASE}/towatchlist/entries/${entryId}/priority`, {
    method: "PATCH",
    headers:
     {  
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
     },
    body: JSON.stringify({ priority }),
  });
  if (!res.ok) throw new Error("Failed to update priority");
  return await res.json();
}

//Declare a function to delete/remove a movie from toWAtchList

export async function deleteToWatchEntry(entryId: number, apiKey: string) {
  const res = await fetch(`${BASE}/towatchlist/entries/${entryId}`, {
    method: "DELETE",
   headers:{ "Authorization": `Bearer ${apiKey}` },

  });   

  if (!res.ok) throw new Error("Failed to delete toWatch entry");
  return true;
}


// Declare the function to move a movie from toWatch to completedWatchList when user wants to do the transfer
export async function markAsWatched(
  entryId: number,  // ID in toWatchList table
  apiKey: string,  //apikey for the user 
  rating? : number|null,  // get rating only if user provides it  
  
) {
  // Step 1 — fetch all toWatch entries
  const allEntries = await getToWatchList(apiKey);

  // Step 2 — find the entry with the ID we want
  const entry = allEntries.find(e => e.list_id === entryId);
  if (!entry) throw new Error("Entry not found in toWatch list");


  // 2) Build the request body(required fields) for completed list like movieID, rating, notes, date_initially_watched, date_last_watched, times_watched
  const completedPayload = {
    movieID: entry.movie_id,
    ...(rating !== undefined && { rating }),
    notes: entry.notes || "",
    date_initially_watched: new Date().toISOString().split("T")[0],
    date_last_watched: new Date().toISOString().split("T")[0],
    times_watched: 1
  };
  

  // 3) Add to completed list
  const addRes = await fetch(`${BASE}/completedwatchlist/entries`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(completedPayload)
  });

  // handle any errors 
  if (!addRes.ok) {
    throw new Error("Failed to add movie to completed watch list");
  }

  // 4) Finally: delete from toWatch list
  await deleteToWatchEntry(entryId, apiKey);

  return await addRes.json();   // return success message
}
(window as any).markAsWatched = markAsWatched;
