import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if there's a token in localStorage on initial load
    const token = localStorage.getItem('token');
    
    if (token) {
      // Make a request to validate the token and get user data
      fetch('/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            // Invalid token, remove it
            localStorage.removeItem('token');
            throw new Error('Invalid token');
          }
        })
        .then(data => {
          setUser(data);
          setIsAuthenticated(true);
          setIsAdmin(data.role === 'admin');
        })
        .catch(err => {
          console.error('Auth error:', err);
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
        });
    }
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.role === 'admin');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};