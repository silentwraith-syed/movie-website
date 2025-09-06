import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast";

interface User {
  token: string;
  name?: string;
  email?: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;  // Modified to accept full user data
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      setUser({ token, ...JSON.parse(userData) });
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userData', JSON.stringify({
      name: userData.name,
      email: userData.email,
      picture: userData.picture
    }));
    setUser(userData);
    toast({
      title: "Successfully signed in",
      description: `Welcome back${userData.name ? `, ${userData.name}` : ''}!`,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setUser(null);
    toast({
      title: "Signed out",
      description: "Successfully signed out of your account",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};