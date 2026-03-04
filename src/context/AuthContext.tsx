import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { authApi, userApi } from '@/services/api';

const AuthContext = createContext<any>(null);

// Helper to decode JWT and get expiry time
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

// Check if token will expire in the next 5 minutes
function isTokenExpiringSoon(token: string): boolean {
  const expiry = getTokenExpiry(token);
  if (!expiry) return false;
  return Date.now() > expiry - 5 * 60 * 1000; // 5 minute buffer
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const login = (userData: any, token: string, refreshToken?: string) => {
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    window.dispatchEvent(new Event('auth-change'));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
  };

  // Refresh token automatically before expiry
  const refreshTokenIfNeeded = async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!token || !refreshToken) return;

    if (isTokenExpiringSoon(token)) {
      try {
        const response = await authApi.refresh(refreshToken);
        localStorage.setItem('token', response.token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        window.dispatchEvent(new Event('auth-change'));
      } catch (err) {
        console.error('Token refresh failed, logging out:', err);
        logout();
      }
    }
  };

  // Sync user data from database periodically
  const syncUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token || !isAuthenticated) return;

    try {
      const profile = await userApi.getProfile();
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);
      window.dispatchEvent(new Event('auth-change'));
    } catch (err) {
      console.error('Failed to sync user data:', err);
      // Don't logout on sync failure - token might still be valid
    }
  };

  // Set up token refresh interval (every 10 minutes)
  useEffect(() => {
    if (isAuthenticated) {
      // Check immediately
      refreshTokenIfNeeded();

      // Then check every 10 minutes
      refreshIntervalRef.current = setInterval(refreshTokenIfNeeded, 10 * 60 * 1000);

      return () => {
        if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      };
    }
  }, [isAuthenticated]);

  // Set up user data sync interval (every 30 minutes)
  useEffect(() => {
    if (isAuthenticated) {
      // Sync immediately
      syncUserData();

      // Then sync every 30 minutes
      syncIntervalRef.current = setInterval(syncUserData, 30 * 60 * 1000);

      return () => {
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
      };
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);