// src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from "lucide-react";

interface AuthResponse {
  token: string;
  user: {
    name: string;
    email: string;
    picture?: string;
  };
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          throw new Error('No token received');
        }
    
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
    
        const userData: AuthResponse = await response.json();
        
        // Login with complete user data
        login({
          token,
          name: userData.user.name,
          email: userData.user.email,
          picture: userData.user.picture
        });
        
        const returnTo = params.get('returnTo') || '/';
        navigate(returnTo, { replace: true });
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/auth/error', { 
          replace: true,
          state: { 
            error: error instanceof Error ? error.message : 'Authentication failed' 
          }
        });
      }
    };

    handleCallback();
  }, [location.search, login, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Signing you in...</h2>
      <p className="text-muted-foreground">Please wait while we complete the process.</p>
    </div>
  );
}
