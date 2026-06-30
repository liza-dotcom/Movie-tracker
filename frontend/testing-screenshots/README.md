# Assignment 3 Testing – Liza Choudhry  
**Partner:** Drishti Makhija  
**Live Loki Link:** [(https://loki.trentu.ca/~lizachoudhry/3430/assn/assn3-liza-dotcom/)]

**Existing User Credentials:**  
- **Username:** Lucky  
- **Password:** Lucky@123  

---

# 1. Authentication (Login / Logout)

### ✔ Successful Login
Confirms a user with correct credentials can log in successfully and renders the home page on successful login.
![Successful Login](Auth.png)

### ✔ Invalid Login
Checks that incorrect login attempts show a clear error message.  
![Invalid Login](invalid-auth.png)

### ✔ Logout
Ensures the session clears and the user returns to the login page.  
![Logout](logout.png)

---

# 2. Movies Catalogue

### ✔ Load All Movies
Verifies that all movies in the catalog load on the home page.  
![All Movies](movies.png)

### ✔ Movie Details View
Tests whether a user can see full information about a selected movie.  
![Movie Details](movie-details.png)

### ✔ Filter Movies 
Searcg works on Home page only 
Ensures movies can be filtered by a non-title attribute, in this case genre.  
![Filter Movies](filter.png)

### ✔ Search for a Movie
Checks search functionality for specific movie titles.  
![Search](search.png)

---

# 3. Plan-to-Watch List (Watchlist)

### ✔ Quick Add from Main Page
User can add a movie to the watchlist instantly from the catalogue.  
![Quick Add](add-to-watch.png)

### ✔ Watchlist Entry Options
Ensures each watchlist item shows its available actions (update, mark completed, remove).  
![Entry Options](toWatch-entryOptions.png)

### ✔ Watchlist Item – Full Details
Displays full details of the watchlist entry including notes and priority.  
![Watchlist Details](toWatch-details.png)

---

## Updating Watchlist Entries

### ✔ Update Page Display
User can open the update form to modify notes or priority.  
![Update Entry](toWatch-update-entry.png)

### ✔ Update Success
Tests that changes persist and a success message appears.  
![Update Success](toWatch-update-success.png)

---

## Priority Handling

### ✔ Valid Priority Update
Ensures priority updates correctly.  
![Priority Valid](toWatch-priority.png)

### ✔ Invalid Priority
Shows an error if the user enters an invalid priority.  
![Priority Invalid](toWatch-priority-invalid.png)

---

## Sorting the Watchlist

### ✔ Sort by Priority (Ascending)
![Sort Ascending](ascend-sort-toWatch.png)

### ✔ Sort by Priority (Descending)
(Filename contains a space → escaped below)  
![Sort Descending](desc%20end-sort-toWatch.png)

---

## Additional Watchlist Features

### ✔ Mark as Completed
Moves a watchlist item into the completed list.  
![Mark Completed](toWatch-mark-completed.png)

### ✔ Remove from Watchlist
User can remove an entry without completing it.  
![Remove Entry](toWatch-remove.png)

---

# 4. Completed Movies List

### ✔ View Completed Movies
Shows all movies marked as completed.  
![Completed List](completed.png)

### ✔ Completed Movie Details
Includes rating, notes, last watched, and times watched.  
![Completed Details](complete-user-details.png)

### ✔ Update Rating
User can modify their rating for a completed movie.  
![Rating Update](completed-update.png)

### ✔ Search Completed Movies
Completed List provides 3 criteria for sorting the entries. 
![Completed Search](completed-search-criteria.png)

### ✔ Sort Completed Movies (ASC)
![Completed ASC](completed-ascend.png)

### ✔ Increment “Watched Again” Count
Confirms updating the "times watched" counter works properly.  
![Watched Again](completed-watch-again.png)

---

# 5. User Statistics

### ✔ View User Statistics Dashboard
Displays user-generated statistics such as completed count, watchlist status, etc.  
![User Stats](user-stats.png)

---

# Summary

All required user stories have been tested:

- Authentication (login, logout)  
- View limited movie information  
- Detailed movie info (from catalog or user's lists)  
- Search & non-title filtering  
- Quick add to watchlist  
- Update watchlist entries  
- Sorting watchlist by priority  
- Quick priority adjustments  
- Mark as completed  
- Rate completed movies  
- Sort completed list (ASC/DESC)  
- Track "times watched"  
- Remove watchlist items  
- View user statistics  

The Movie App meets all functional expectations and provides a complete, smooth user experience.