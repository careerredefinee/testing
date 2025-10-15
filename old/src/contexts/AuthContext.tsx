import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import api from '../utils/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
  phone?: string;
  address?: string;
  dob?: string;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  googleLogin: (idToken: string) => Promise<User>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshToken: () => Promise<string | null>;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [, setToken] = useState<string | null>(null);

  // Token validation is now handled by the API interceptor and refresh token flow

  const refreshToken = useCallback(async () => {
    try {
      const { data } = await api.post('/api/v1/auth/refresh-token');
      // Backend returns shape: { status, token, data: { user } }
      const newToken = (data as any)?.token ?? (data as any)?.data?.token;
      const newUser = (data as any)?.data?.user;

      if (!newToken) throw new Error('No token in refresh response');

      // Update token in state and localStorage
      setToken(newToken);
      if (newUser) setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('token', newToken);

      // Update axios default headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return newToken as string;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Do not auto-logout; let the app continue and user can retry.
      return null;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // Try silent refresh using HTTP-only cookie (if present)
          try {
            const newToken = await refreshToken();
            if (!newToken) {
              setIsAuthenticated(false);
              setUser(null);
              return;
            }
          } catch (e) {
            setIsAuthenticated(false);
            setUser(null);
            return;
          }
        }

        // Set auth header and fetch current user
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.get('/api/v1/auth/me');
        const userData = (data as any)?.data?.user ?? (data as any)?.data;
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [refreshToken]);

  const login = async (email: string, password: string, rememberMe = false): Promise<User> => {
    try {
      const { data } = await api.post('/api/v1/auth/login', { email, password, rememberMe });
      // Backend returns { status, token, data: { user } }
      const token = (data as any)?.token ?? (data as any)?.data?.token;
      const user = (data as any)?.data?.user;
      
      // Update auth state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      // Update token in localStorage and axios
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      // Extract server message if available
      const serverMsg = (error as any)?.response?.data?.message || 'Login failed';
      // Clear any partial auth state on failure
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      // Rethrow a clean Error with backend message so UI can show it
      throw new Error(serverMsg);
    }
  };

  const googleLogin = async (idToken: string): Promise<User> => {
    try {
      const { data } = await api.post('/api/v1/auth/google-auth', { token: idToken });
      // Backend returns { status, token, data: { user } }
      const token = (data as any)?.token ?? (data as any)?.data?.token;
      const user = (data as any)?.data?.user;
      
      if (!token || !user) throw new Error('Invalid Google login response');
      
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return user;
    } catch (error) {
      console.error('Google login failed:', error);
      const serverMsg = (error as any)?.response?.data?.message || 'Google login failed';
      // Clear any partial auth state on failure
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      throw new Error(serverMsg);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const { data } = await api.post('/api/v1/auth/signup', userData);
    // Backend returns { status, token, data: { user } }
    const token = (data as any)?.token ?? (data as any)?.data?.token;
    const user = (data as any)?.data?.user;
    if (!token || !user) throw new Error('Invalid signup response');
    setToken(token);
    setUser(user);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await api.post('/api/v1/auth/logout');
        } catch (error) {
          console.error('Logout API error:', error);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear client-side auth state
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  // Validate current token or attempt refresh, returning boolean
  const validateToken = async (): Promise<boolean> => {
    try {
      // Try to fetch current user with existing token
      await api.get('/api/v1/auth/me');
      return true;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        try {
          await refreshToken();
          return true;
        } catch (_) {
          return false;
        }
      }
      return false;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const authContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    googleLogin,
    register,
    logout,
    updateUser,
    refreshToken, // Expose refreshToken through context
    validateToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
