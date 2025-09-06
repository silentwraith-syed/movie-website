// src/App.jsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Movie from "./pages/Movie";
import AuthCallback from "./pages/AuthCallback";

import UserMovies from "./pages/UserMovies";
import PaymentSuccess from "./pages/paymentSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movie/:id" element={<Movie />} />
            <Route path="/auth/success" element={<AuthCallback />} />
            <Route path="/my-movies" element={<UserMovies />} />
            <Route path="/paymentsuccess" element={<PaymentSuccess />} />
            
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;