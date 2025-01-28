import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext();
const NEXT_AUTH_URL = 'http://192.168.100.21:3000/api/auth/callback/credentials';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const session = await AsyncStorage.getItem('next-auth-session');
    if (session) {
      setUser(JSON.parse(session).user);
    }
    setLoading(false);
  };

// src/contexts/AuthContext.js
const login = async (email, password) => {
  try {
    setLoading(true);
    const response = await axios.post(
      NEXT_AUTH_URL,
      `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    setUser(response.data.user);
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};
  const logout = async () => {
    await AsyncStorage.removeItem('next-auth-session');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);