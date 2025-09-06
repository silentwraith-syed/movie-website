import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";

interface MovieCarouselProps {
  category: string;
  movies?: Array<{
    id: string;
    title: string;
    poster: string;
    year: string;
  }>;
}

export default function MovieCarousel({ category }: MovieCarouselProps) {
  const host = import.meta.env.VITE_API_URL;
  const [movies, setMovies] = useState([]);

  const fetchByCategory = async (category) => {
    const response = await fetch(`${host}/movies/category?t=${category}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // "auth-token": localStorage.getItem('token')
      },
    });
    const json = await response.json(); //Parsing the json
    const validMovies = json.filter(
      (movie) =>
        movie.poster && movie.poster !== "N/A" && movie.poster.endsWith(".jpg")
    );
    setMovies(validMovies);
  };

  useEffect(() => {
    fetchByCategory(category);
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!movies.length) {
    return null;
  }

  return (
    <div className="relative py-8">
      <h2 className="text-2xl font-semibold mb-4 px-4">{category}</h2>

      <div className="group relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                   w-12 h-32 flex items-center justify-center
                   bg-black/50 hover:bg-black/70
                   opacity-0 group-hover:opacity-100 
                   transition-all duration-300
                   rounded-r-lg"
        >
          <ChevronLeft className="h-8 w-8 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory"
        >
          {movies.map((movie) => (
            <div key={movie._id} className="flex-none w-[200px] snap-start">
              <MovieCard {...movie} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                   w-12 h-32 flex items-center justify-center
                   bg-black/50 hover:bg-black/70
                   opacity-0 group-hover:opacity-100 
                   transition-all duration-300
                   rounded-l-lg"
        >
          <ChevronRight className="h-8 w-8 text-white" />
        </button>
      </div>
    </div>
  );
}
