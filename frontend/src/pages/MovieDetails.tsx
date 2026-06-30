import { useParams } from "react-router-dom";

export default function MovieDetails() {
  const { movieId } = useParams<{ movieId: string }>();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Movie Details</h1>
      <p>Movie ID: {movieId}</p>
    </div>
  );
}
