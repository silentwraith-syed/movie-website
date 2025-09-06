import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { mockMovies } from "@/data/mockData";

interface SearchResult {
  _id: string;
  title: string;
  poster: string;
  year: string;
  genre?: string;
}

export default function SearchBar({ onClose }: { onClose: () => void }) {

  const host = import.meta.env.VITE_API_URL;

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem("recentSearches");
    return saved ? JSON.parse(saved) : [];
  });
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleMovieName = async (query) => {
    // if (!e.target.value) {
    //   setMovies([]); // Clear the state
    //   return;
    // }

    const response = await fetch(
      `${host}/movies/autocomplete?t=${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // "auth-token": localStorage.getItem('token')
        },
      }
    );
    const json = await response.json(); //Parsing the json
    console.log(json);
    setSuggestions(json);
  };
  useEffect(() => {
    if (query.length > 1) {
      handleMovieName(query);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const addToRecentSearches = (searchQuery: string) => {
    const updated = [
      searchQuery,
      ...recentSearches.filter(item => item !== searchQuery)
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = (searchQuery = query) => {
    if (searchQuery) {
      addToRecentSearches(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selected = suggestions[selectedIndex];
          console.log("HI")
          console.log(selected);
          navigate(`/movie/${selected._id}`);
          onClose();
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div 
  ref={containerRef}
  className="w-full max-w-3xl mx-4 bg-gray-900/95 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
>
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search movies, series, genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg"
          />
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Search Results */}
          {suggestions.length > 0 ? (
            <div className="p-2">
              {suggestions.map((movie, index) => (
                <Link
                  key={movie._id}
                  to={`/movie/${movie._id}`}
                  className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                    index === selectedIndex ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                  onClick={onClose}
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-16 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{movie.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{movie.year}</span>
                      {movie.genre && (
                        <>
                          <span>•</span>
                          <span>{movie.genre}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : query.length <= 1 && (
            /* Recent Searches & Trending */
            <div className="p-4 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Recent Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Trending Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Action Movies", "New Releases", "Top Rated", "Sci-Fi"].map((trend) => (
                    <button
                      key={trend}
                      onClick={() => handleSearch(trend)}
                      className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white transition-colors"
                    >
                      {trend}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}