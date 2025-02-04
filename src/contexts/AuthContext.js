// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = "http://192.168.100.21:3000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  // Configure axios interceptor for token handling
  useEffect(() => {
    api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await logout();
        }
        return Promise.reject(error);
      }
    );
  }, [token]);

  const loadStoredSession = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem("authToken"),
        AsyncStorage.getItem("user"),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error loading session:", error);
    } finally {
      setLoading(false);
    }
  };

  const storeSession = async (token, user) => {
    try {
      await Promise.all([
        AsyncStorage.setItem("authToken", token),
        AsyncStorage.setItem("user", JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error("Error storing session:", error);
      throw new Error("Failed to store session");
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, user: userData } = response.data;

      await storeSession(newToken, userData);
      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed. Please try again.";
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("authToken"),
        AsyncStorage.removeItem("user"),
      ]);
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error during logout:", error);
      throw new Error("Logout failed");
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};