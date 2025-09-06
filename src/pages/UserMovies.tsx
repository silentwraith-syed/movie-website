import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";

export default function UserMovies() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "watchlater"; // default to watchlater view
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const host = import.meta.env.VITE_API_URL;

  const fetchUserMovies = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please login to view your movies");

      const endpoint = (view === "liked") ? "liked" : (view==="watchlater")?"watchlater":"purchased";
      const response = await fetch(`${host}/users/${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();
      console.log("Fetched movies:", data);

      const transformedMovies = data.map((item) => ({
        ...item.movieId,
        _id: item.movieId._id, // Ensure movie ID is set correctly
        addedAt: item.addedAt,
      }));

      setMovies(transformedMovies);
    } catch (err) {
      console.error("Error fetching movies:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserMovies();
  }, [view]); // Refetch when view changes

  const handleRemove = async (movieId) => {
    try {
      // Remove movie from state
      setMovies(movies.filter((movie) => movie._id !== movieId));

      const token = localStorage.getItem("token");
      const endpoint = view === "liked" ? "like-rm" : "watchlater-rm";

      const response = await fetch(`${host}/users/${endpoint}/${movieId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to remove movie");
      }

    } catch (err) {
      console.error("Error removing movie:", err);
      setError(err.message);
    }
  };

  const getPageTitle = () => {
    if (view === "purchased")return  "Your Movies" ;
    else return view === "liked" ? "Liked Movies" : "Watch Later";
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>

          {/* View Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => (window.location.search = "?view=watchlater")}
              className={`px-4 py-2 rounded-md ${
                view === "watchlater"
                  ? "bg-primary text-black"
                  : "bg-secondary text-primary"
              }`}
            >
              Watch Later
            </button>
            <button
              onClick={() => (window.location.search = "?view=liked")}
              className={`px-4 py-2 rounded-md ${
                view === "liked"
                  ? "bg-primary text-black"
                  : "bg-secondary text-primary"
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => (window.location.search = "?view=purchased")}
              className={`px-4 py-2 rounded-md ${
                view === "purchased"
                  ? "bg-primary text-black"
                  : "bg-secondary text-primary"
              }`}
            >
              Purchased
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : movies.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-8">
              {movies.length} {view === "liked" ? "liked" : "watch later"}{" "}
              movies
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((movie) => (
                <div key={movie._id} className="relative group">
                  <MovieCard {...movie} />
                  {view !="purchased" &&<button
                    onClick={() => handleRemove(movie._id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full 
                             opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>No {view === "liked" ? "liked" : "watch later"} movies yet.</p>
        )}
      </div>
    </div>
  );
}
