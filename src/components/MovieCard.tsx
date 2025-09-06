import { Link, useNavigate } from "react-router-dom";
import { Play, Info, Heart, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";


const host = import.meta.env.VITE_API_URL;

interface MovieCardProps {
  _id: string;
  title: string;
  poster: string;
  year: string;
  rating?: string;
  duration?: string;
  genres?: string[];
}

export default function MovieCard({
  _id,
  title,
  poster,
  year,
  rating = "PG-13",
  duration = "2h 30m",
  genres = ["Action", "Drama"],
}: MovieCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token") // Assuming authentication token is stored in localStorage
  );

  if (!poster) {
    return null;
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate(`/movie/${_id}`);
    } else {
      toast({
        title: "Alert",
        description: "Please Login to View Movie Details!",
        variant: "default",
      });
    }
  };

  return (
    <Link
      to={isLoggedIn ? `/movie/${_id}` : "#"}
      onClick={handlePlayClick}
      className="group relative block transition-transform duration-300 hover:scale-105"
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-900">
        <img
          src={poster}
          alt={title}
          onError={(e) => {
            const img = e.target as HTMLImageElement; // Cast e.target to HTMLImageElement
            img.onerror = null; // Prevent infinite loop
            img.src =
              "https://eticketsolutions.com/demo/themes/e-ticket/img/movie.jpg"; // Fallback image path
          }}
          className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:brightness-75"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {/* Quick Action Buttons */}
          {/* <div className="absolute top-4 right-4 flex gap-2">
            <button className="rounded-full bg-black/50 p-2 backdrop-blur-sm transition-colors hover:bg-white hover:text-black">
              <Heart className="h-4 w-4" />
            </button>
            <button className="rounded-full bg-black/50 p-2 backdrop-blur-sm transition-colors hover:bg-white hover:text-black">
              <Plus className="h-4 w-4" />
            </button>
          </div> */}

          {/* Content */}
          <div className="absolute bottom-0 left-0 w-full p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-white/20 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                  {rating}
                </span>
                <span className="text-sm text-gray-300">{year}</span>
              </div>

              <h3 className="text-lg font-bold leading-tight text-white">
                {title}
              </h3>

              <div className="flex flex-wrap gap-2">
                {genres.slice(0, 2).map((genre) => (
                  <span key={genre} className="text-xs text-gray-400">
                    {genre}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayClick}
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
                >
                  <Play className="h-4 w-4" /> Play
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
