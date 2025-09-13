// AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const AuthContext = createContext();

const API_URL = "https://smartinspectionjobmonitoringsijm.vercel.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  useEffect(() => {
    // Add interceptors to attach token and handle 401 responses
    api.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
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

  // Email/password login function
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, user: userData } = response.data;
      await storeSession(newToken, userData);
      setToken(newToken);
      setUser(userData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Login failed. Please try again.";
      throw new Error(message);
    }
  };

  // Google social login function
  // This function should be called with the idToken you receive from expo-auth-session.
  const googleLogin = async (idToken) => {
    try {
      const response = await api.post("/auth/google", {
        provider: "google",
        idToken,
      });
      const { token: newToken, user: userData } = response.data;
      await storeSession(newToken, userData);
      setToken(newToken);
      setUser(userData);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Google login failed. Please try again.";
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
    googleLogin, // Expose the googleLogin function for social login
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
