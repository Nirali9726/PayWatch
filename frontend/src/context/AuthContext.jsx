import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('paywatch_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('paywatch_token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Validate session on launch if token exists
    if (token && !user) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('paywatch_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: jwtToken, user: userProfile } = res.data;
        setToken(jwtToken);
        setUser(userProfile);
        localStorage.setItem('paywatch_token', jwtToken);
        localStorage.setItem('paywatch_user', JSON.stringify(userProfile));
        setLoading(false);
        return true;
      }
    } catch (err) {
      const errMsg = !err.response 
        ? 'Cannot reach backend server. Please ensure the backend is running on port 5000.'
        : (err.response.data?.message || 'Login failed. Please check your credentials.');
      setError(errMsg);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('paywatch_token');
    localStorage.removeItem('paywatch_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        error,
        setError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
