import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser, setAuthToken } from '../services/api.js';

const STORAGE_KEY = 'linkforge_token';
const USER_KEY = 'linkforge_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [bootstrapping, setBootstrapping] = useState(true);

  // Keep axios Authorization in sync whenever token state changes (e.g. refresh with stored session).
  useEffect(() => {
    setAuthToken(token || null);
    setBootstrapping(false);
  }, [token]);

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    // Must run immediately — not only in useEffect — or the first /api/* call after login
    // fires before the effect runs, gets 401, and SessionBridge logs the user out.
    setAuthToken(nextToken || null);
    if (nextToken) localStorage.setItem(STORAGE_KEY, nextToken);
    else localStorage.removeItem(STORAGE_KEY);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const data = await loginUser({ email, password });
      persistSession(data.token, data.user);
      return data;
    },
    [persistSession]
  );

  const register = useCallback(
    async (username, email, password) => {
      const data = await registerUser({ username, email, password });
      persistSession(data.token, data.user);
      return data;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      bootstrapping,
      login,
      register,
      signup: register, // alias used in Signup.jsx
      logout,
    }),
    [token, user, bootstrapping, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
