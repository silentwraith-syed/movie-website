import { useEffect, useState, useCallback } from "react";
import  {useNavigate}  from "react-router-dom";
import Navbar from "../components/Navbar";
import MovieCarousel from "../components/MovieCarousel";
import { Play, Info, NutOff } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import Spinner from "@/components/Spinner";
import InfiniteScroll from "react-infinite-scroll-component";
import MovieCardSkeleton from "@/components/MovieCardSkeleton";
import { useToast } from "@/hooks/use-toast";
import Razorpay from "razorpay";

const host = import.meta.env.VITE_API_URL;

export default function Index() {
  const categories = ["Horror", "Action", "Thriller", "Comedy", "Romance"];

  // Predefined list of movies with local image paths
  const localMovies = [
    {
      id: "67a866cc33abf6d32758c6dc",
      title: "Deadpool 2",
      year: "2023",
      poster: "https://images3.alphacoders.com/678/thumb-1920-678085.jpg", // Replace with your local image path
      description: "Foul-mouthed mutant mercenary Wade Wilson (a.k.a. Deadpool) assembles a team of fellow mutant rogues to protect a young boy with abilities from the brutal, time-traveling cyborg Cable.",
      amount:"100",
    },
    {
      id: "67a869fce67f205611c2ce49",
      title: "Godzilla vs Kong",
      year: "2022",
      poster: "https://images5.alphacoders.com/135/thumb-1920-1355086.jpeg",
      description: "The epic next chapter in the cinematic Monsterverse pits two of the greatest icons in motion picture history against each other--the fearsome Godzilla and the mighty Kong--with humanity caught in the balance..",
      amount:"100",
    },
    {
      id: "67a86b39dd52839b3c36a450",
      title: "Captain America:Civil War",
      year: "2021",
      poster: "https://images5.alphacoders.com/689/thumb-1920-689398.jpg",
      description: "Political involvement in the Avengers' affairs causes a rift between Captain America and Iron Man..",
      amount:"100",
    },
  ];

  const [movies, setMovies] = useState(localMovies);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const [latestMovies, setLatestMovies] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    !!localStorage.getItem("token") // Assuming authentication token is stored in localStorage
  );

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total_res, setTotal_res] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  //Set user details
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  const fetchUser = async () => {
    try {
        const response = await fetch(`${host}/users/findUser`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}` // Sending token for authentication
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch user");
        }

        const userData = await response.json();
        console.log("User Data:", userData);
        // setUser(userData);
        return userData;

    } catch (error) {
        console.error("Error fetching user:", error.message);
    }
};  

  const featuredMovie = movies[currentMovieIndex] || {
    id: "0",  // Add a default id
    poster: "/placeholder.jpg",
    title: "Sample Movie",
    description:
      "An epic adventure that will keep you on the edge of your seat.",
    year: "2023",
    amount:100,
  };

  const LoadingGrid = () => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {[...Array(5)].map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );

  const fetchLatestMovies = async () => {
    console.log("HI");
    const [latest] = await Promise.all([
      fetch(`${host}/movies/latest?page=${page}`).then((res) => res.json()),
    ]);

    const updatedMovies = [...latestMovies, ...latest.movies].reduce(
      (acc, movie) => {
        if (!acc.some((m) => m._id === movie._id)) {
          acc.push(movie);
        }
        return acc;
      },
      []
    );

    setLatestMovies(updatedMovies);
    setTotal_res(latest.totalMovies);
    setPage(page + 1);
    console.log(latest);

    const x = await latestMovies.length;
    console.log("Fetching LAtest Movies", x);
  };

  useEffect(() => {
    fetchLatestMovies();
  }, []);


  const nextMovie = useCallback(() => {
    if (!isAutoplayPaused) {
      setIsTransitioning(true);
      setCurrentMovieIndex((prev) => (prev + 1) % movies.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isAutoplayPaused, movies.length]);

  useEffect(() => {
    if (!isAutoplayPaused) {
      const interval = setInterval(nextMovie, 5000);
      return () => clearInterval(interval);
    }
  }, [nextMovie, isAutoplayPaused]);

  const fetchMoreMovies = async () => {
    setLoading(true);
    setPage(page + 1);
    fetchLatestMovies();
    setLoading(false);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const id = featuredMovie?.id; 
    if (isLoggedIn) {
      navigate(`/movie/${featuredMovie.id}`);
    } else {
      toast({
        title: "Alert",
        description: "Please Login to View Movie Details!",
        variant: "default",
      });
    }
  };

  const handleCheckout = async (featuredMovie) => {
    //Check if logged in
    if(!token){
      toast({
        title: "Alert",
        description: "Please Login to View Movie Details!",
        variant: "default",
      });
      return;
    }
    const user= await fetchUser();
    const amount  = featuredMovie.amount;
    const movieId = featuredMovie.id;
    const movieName = featuredMovie.title;

    //Fetching the key
    const response = await fetch(`${host}/getkey`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    const key= data.key;

    //Creating the order
    console.log("Checking out with amount:", amount);
    try {
      const response = await fetch(`${host}/payment/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),  // Send amount in the request body
      });
  
      const data = await response.json();
      const order = data.order;

      console.log("Response:", order);

      const options = {
        key: key, 
        amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: movieName,
        description:"Test Transaction",
        image: featuredMovie.poster,
        order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        callback_url: `${host}/payment/paymentverification?movieId=${movieId}`,
        prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone ? user.phone : "9000090009",
        },
        notes: {
            "address": "Razorpay Corporate Office"
        },
        theme: {
            color: "#3399cc"
        }
    };
    const razor = new (window as any).Razorpay(options);
    razor.open();

    } catch (error) {
      console.error("Checkout error:", error.message);
    }
  };
  

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={featuredMovie.poster}
            alt={featuredMovie.title}
            className={`h-full w-full object-cover transition-all duration-700 ${
              isTransitioning ? "scale-105 brightness-50" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-2xl space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="rounded bg-white/20 px-2 py-1 text-sm font-medium backdrop-blur-sm">
                  {featuredMovie.year}
                </span>
                <span className="text-sm text-gray-300">2h 30m</span>
                <span className="rounded bg-red-500/20 px-2 py-1 text-sm font-medium text-red-500 backdrop-blur-sm animate-pulse">
                  NEW
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold animate-fade-in">
                {featuredMovie.title}
              </h1>
            </div>
            <p className="text-lg text-gray-300 animate-fade-in line-clamp-3">
              {featuredMovie.description}
            </p>
            <div className="flex items-center gap-4 animate-fade-in">
              <button className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-white/90" onClick={()=>handleCheckout(featuredMovie)}>
                <Play className="h-5 w-5" /> Buy Now
              </button>
              {/* <button className="flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 font-semibold backdrop-blur-sm transition-colors hover:bg-white/30">
                <Info className="h-5 w-5" /> More Info
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Category Carousels */}
      <div className="relative -mt-8 py-8 z-10">
        {categories.map((category) => (
          <MovieCarousel key={category} category={category} />
        ))}
      </div>

      {/* Latest Movies */}
      <div className="px-4 py-9 md:px-16">
        <h2 className="text-2xl font-semibold mb-6">Latest Releases</h2>
        {loading && latestMovies.length === 0 ? (
          <LoadingGrid /> // Show Skeletons when loading and no movies yet
        ) : (
          <InfiniteScroll
            dataLength={latestMovies.length}
            next={fetchMoreMovies}
            hasMore={latestMovies.length < total_res}
            loader={<LoadingGrid />} // Show skeletons when more movies are loading
          >
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {latestMovies.map((movie) => (
                <MovieCard key={movie._id} {...movie} />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
}
