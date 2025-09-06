import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import { Button } from "@/components/ui/button";
import {
  ArrowDown01,
  ArrowDownCircle,
  ArrowDownNarrowWide,
} from "lucide-react";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const host = import.meta.env.VITE_API_URL;

  const handleMovieName = async (query) => {
    if (!query) {
      setResults([]);
      setSimilar([]);
      setHasMore(true);
      return;
    }

    setLoading(true);
    setError("");
    setPage(1);

    try {
      // Fuzzy Search
      const response = await fetch(`${host}/movies/fuzzy?t=${query}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch fuzzy search results");
      const json = await response.json();
      setResults(json);

      // Semantic Search
      const similarResponse = await fetch(
        `${host}/movies/semantic-search?query=${query}&page=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!similarResponse.ok)
        throw new Error("Failed to fetch similar search results");
      const similarJson = await similarResponse.json();
      setSimilar(similarJson.results || []); // Default to empty if no results
      setHasMore(similarJson.results.length === 10);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;

    try {
      const similarResponse = await fetch(
        `${host}/movies/semantic-search?query=${query}&page=${nextPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!similarResponse.ok)
        throw new Error("Failed to fetch more semantic search results");

      const similarJson = await similarResponse.json();
      setSimilar((prev) => [...prev, ...similarJson.results]); // Append new results
      setPage(nextPage); // Increase page count
      setHasMore(similarJson.results.length === 10); // If less than 10, no more results
    } catch (err) {
      console.error("Error fetching more results:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    handleMovieName(query);
  }, [query]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">
          Search Results for "{query}"
        </h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : results.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-8">
              Found {results.length} results
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
              {results.map((movie) => (
                <MovieCard key={movie._id} {...movie} />
              ))}
            </div>

            {similar.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  Similar Suggestions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {similar.map((movie) => (
                    <MovieCard key={movie._id} {...movie} />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-6 mb-5">
                    <Button
                      className="px-6 py-3 rounded-lg"
                      onClick={handleLoadMore}
                    >
                      <ArrowDownCircle />
                      Load More
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <p>No results found. Try a different search term.</p>
        )}
      </div>
    </div>
  );
}