import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Heart,
  Plus,
  Minus,
  Calendar,
  Clock,
  Eye,
  User,
  Star,
  Film,
  Languages,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  VolumeX,
  Volume2,
  Maximize,
  Minimize,
  Settings,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import videos from "../assets/videos.json";
import { set } from "date-fns";

export default function Movie() {
  const host = import.meta.env.VITE_API_URL;
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [liked, setLiked] = useState(false);
  const [watchLater, setWatchLater] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to get a random video from JSON
  const getRandomVideo = () => {
    const randomIndex = Math.floor(Math.random() * videos.length);
    return videos[randomIndex];
  };

  useEffect(() => {
    const loadMovieData = async () => {
      setIsLoading(true);
      try {
        // Get random video for playback
        const randomVideo = getRandomVideo();

        // Fetch movie metadata from backend
        const response = await fetch(`${host}/movies/${id}`);
        const data = await response.json();

        // Combine backend data with random video source
        setMovie({
          ...data,
          videoUrl: randomVideo.videoUrl,
          thumbnailUrl: randomVideo.thumbnailUrl,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load movie details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    const token = localStorage.getItem("token");

    const checkWatchLater = async () => {
      try {
        const response = await fetch(`${host}/users/watchlater`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) throw new Error("Failed to fetch watch later list");
    
        const watchLaterMovies = await response.json();
        console.log(watchLaterMovies);
        // Find the index of the movieId
        const index = watchLaterMovies.findIndex(movie => movie.movieId._id === id);
        if(index == -1)setWatchLater(false);
        else setWatchLater(true);
    
      } catch (error) {
        console.error("Error checking watch later status:", error);
      }
    };

const checkLiked = async () => {
  try {
    const response = await fetch(`${host}/users/liked`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch liked list");

    const likedMovies = await response.json();

    // Find the index of the movieId
    const index = likedMovies.findIndex(movie => movie.movieId._id === id);
    if(index == -1)setLiked(false);
    else setLiked(true);

  } catch (error) {
    console.error("Error checking liked list status:", error);
  }
};
    loadMovieData();    
    checkLiked();
    checkWatchLater();
  }, [id]);

  // ----------------------------------------------------------Handle Like & WatchLater---------------------------------------------------
  const handleLike = async () => {
    try {
      setLiked(!liked);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${host}/users/${liked ? "like-rm" : "like"}/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) 
      {
          setLiked(!liked);
          throw new Error("Failed to update like status");
      }

      toast({
        title: liked ? "Removed from liked" : "Added to liked",
        description: liked
          ? "Movie removed from your liked list"
          : "Movie added to your liked list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleWatchLater = async () => {
    try {
      setWatchLater(!watchLater);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${host}/users/${watchLater ? "watchlater-rm" : "watchlater"}/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok)
      {  
        setWatchLater(!watchLater);
        throw new Error("Failed to update watch later status");
      }
      toast({
        title: watchLater ? "Removed from Watch Later" : "Added to Watch Later",
        description: watchLater
          ? "Movie removed from watch later list"
          : "Movie added to watch later list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16">
          <Skeleton className="w-full aspect-video" />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-[2fr,1fr] gap-8">
              <div>
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/4 mb-6" />
                <Skeleton className="h-24 w-full mb-6" />
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
              <div>
                <Skeleton className="h-8 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="relative">
          <VideoPlayer
            videoSrc={movie.videoUrl}
            thumbnailUrl={movie.thumbnailUrl}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-[2fr,1fr] gap-8">
            <div>
              <h1 className="text-4xl font-bold mb-4 text-foreground">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {(!movie.genres)?"":movie.genres}
                  </Badge>
                )}
                {movie.imdb.rating && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" /> {!(movie.imdb.rating)?"":movie.imdb.rating} IMDB
                  </Badge>
                )}
                {movie.year && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Calendar className="w-3 h-3" /> {movie.year}
                  </Badge>
                )}
              </div>

              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-line">
                    {movie.fullplot}
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="lg"
                  onClick={handleLike}
                  className="w-40 transition-all"
                >
                  <Heart
                    className={`mr-2 h-4 w-4 ${liked ? "fill-current" : ""}`}
                  />
                  {liked ? "Liked" : "Like"}
                </Button>

                <Button
                  variant={watchLater ? "default" : "outline"}
                  size="lg"
                  onClick={handleWatchLater}
                  className="w-40 transition-all"
                >
                  {watchLater ? (
                    <Minus className="mr-2 h-4 w-4" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {watchLater ? "Remove" : "Watch Later"}
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Movie Info</h3>
                <div className="space-y-3">
                  {movie.year && (
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Released on:
                      </span>
                      <span className="font-medium">{movie.year}</span>
                    </div>
                  )}
                  {movie.genres && (
                    <div className="flex items-center text-sm">
                      <Film className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Categories:
                      </span>
                      <span className="font-medium">{movie.genres}</span>
                    </div>
                  )}
                  {movie.languages && (
                    <div className="flex items-center text-sm">
                      <Languages className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Languages:
                      </span>
                      <span className="font-medium">{movie.languages}</span>
                    </div>
                  )}
                  {movie.directors && (
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Directors:
                      </span>
                      <span className="font-medium">{movie.directors}</span>
                    </div>
                  )}
                  {movie.imdb && (
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">
                        Ratings:
                      </span>
                      <span className="font-medium">{movie.imdb.rating}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const VideoPlayer = ({ videoSrc, thumbnailUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showCentralPlay, setShowCentralPlay] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const skipDuration = 5;

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
      setCurrentTime(formatTime(video.currentTime));
      setDuration(formatTime(video.duration));
    };

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", () =>
      setDuration(formatTime(video.duration))
    );

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        setShowCentralPlay(true); // Show play/pause animation
        setTimeout(() => setShowCentralPlay(false), 500);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowCentralPlay(true); // Show play/pause animation
        setTimeout(() => setShowCentralPlay(false), 500);
      }
    }
  };

  const skipVideo = (direction) => {
    if (videoRef.current) {
      videoRef.current.currentTime +=
        direction === "forward" ? skipDuration : -skipDuration;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = clickX / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const handlePlaybackRateChange = () => {
    if (videoRef.current) {
      const newRate = playbackRate === 2 ? 0.5 : playbackRate + 0.5;
      videoRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  // 🎮 Add Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          skipVideo("forward");
          break;
        case "ArrowLeft":
          skipVideo("backward");
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyF":
          toggleFullscreen();
          break;
        case "KeyP":
          handlePlaybackRateChange();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playbackRate]);

  return (
    <div
      className="relative aspect-video bg-black"
      onDoubleClick={toggleFullscreen}
    >
      {/* 🎬 Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls={false}
        poster={thumbnailUrl}
        onClick={togglePlay}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 🎛️ Central Play/Pause Animation */}
      {showCentralPlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/50 p-6 rounded-full animate-ping">
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" />
            ) : (
              <Play className="w-12 h-12 text-white" />
            )}
          </div>
        </div>
      )}

      {/* 🎛️ Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/50 to-transparent ${
          controlsVisible ? "opacity-100" : "opacity-0"
        } transition-opacity duration-300`}
      >
        {/* Progress Bar */}
        <div
          className="h-2 bg-gray-700 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-red-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center mt-2 text-white">
          {/* Playback Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-2 hover:bg-gray-800 rounded"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={() => skipVideo("backward")}
              className="p-2 hover:bg-gray-800 rounded"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={() => skipVideo("forward")}
              className="p-2 hover:bg-gray-800 rounded"
            >
              <RotateCw className="w-6 h-6" />
            </button>
          </div>

          {/* Time Display */}
          <span className="text-sm">
            {currentTime} / {duration}
          </span>

          {/* Additional Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlaybackRateChange}
              className="p-2 hover:bg-gray-800 rounded"
            >
              {playbackRate}x
            </button>
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-gray-800 rounded"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6" />
              ) : (
                <Volume2 className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-800 rounded"
            >
              {isFullscreen ? (
                <Minimize className="w-6 h-6" />
              ) : (
                <Maximize className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
