import { getApiBase } from "./apiClient";

const BASE = getApiBase(); // gett he base url 

export interface UserInfo {
  username: string;
  email: string;
}

// Define an interface for the stats that should be shown tot he user 
export interface UserStats {
  totalTimeWatched: number;       // from completedWatchList
  averageRating: number;          // from completedWatchList
  plannedToWatchCount: number;    // from toWatchList
   plannedTimeToWatch: number; 
  completedMoviesCount: number;   // from completedWatchList
  userInfo: UserInfo;
  
  
}

// Declare the function to fetch user stats from the backend
export async function getUserStats(userID: number, apiKey: string): Promise<UserStats> {
    // make the request body (type, userID and auth headers)
    const url = `${BASE}/users/${userID}/stats`;
console.log("FETCHING STATS FROM:", url);

  const res = await fetch(`${BASE}/users/${userID}/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
  });

  if (!res.ok) {
    let msg = `Failed to fetch user stats (${res.status})`;
    try {
      const data = await res.json();
      if (data.message) msg += `: ${data.message}`;
    } catch (e) {
      // ignore parse errors
    }
    throw new Error(msg);
  }
  // store the data in a var and return to the caller function 
  
  const data = await res.json();
console.log("FULL RAW STATS RESPONSE:", data);

  const completed = data?.data?.completed ?? {};
  const toWatch = data?.data?.toWatch ?? {};
  const userInfo= data?.data?.userInfo ?? {};

  return {
    totalTimeWatched: parseFloat(data.data.completed.total_time_watched_in_minutes) || 0,
    averageRating: parseFloat(data.data.completed.avg_score) || 0,
    completedMoviesCount: data.data.completed.total_completed || 0,
    plannedToWatchCount: data.data.toWatch.total_to_watch || 0,
    plannedTimeToWatch: Number(toWatch.planned_time_to_watch_in_minutes) || 0,
    userInfo: {
      username: userInfo.username,
      email: userInfo.email
    }

  }; 
}
