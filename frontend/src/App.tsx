
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./AppRouter";
import "./services/toWatchService";
import "./services/completedWatchService";
import { getUserStats } from "./services/userStatsService";
import { useEffect } from "react";





export default function App() {

  const userId = 2;
  const apiKey = "b4e95b5ef95a11f597cb180cb4d1774f";
  useEffect(() => {
    getUserStats(userId, apiKey)
      .then(stats => console.log("User stats:", stats))
      .catch(err => console.error(err));
  }, []);
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
