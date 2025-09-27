// context/AuthContext.js
'use client'; // Yeh zaroori hai kyunki hum hooks (useState, useEffect) istemaal kar rahe hain

import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Token se user data nikalne ke liye

// Helper function to get user from localStorage on initial load
const getInitialState = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          return { token, user: decoded, isAuthenticated: true };
        }
      } catch (e) {
        console.error('Invalid token:', e);
      }
    }
  }
  return { token: null, user: null, isAuthenticated: false };
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialState);

  const login = (token) => {
    localStorage.setItem('token', token);
    const decoded = jwtDecode(token);
    setAuthState({
      token,
      user: decoded,
      isAuthenticated: true,
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};