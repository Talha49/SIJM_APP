import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Button,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Link, useNavigation } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    try {
      setError("");
      await login(email, password);
    } catch (error) {
      setError(error.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login initiated");
  };
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  return (
    <View className="flex-1 relative">
      {/* Background Image with Opacity */}
      <Image
        source={require("../../assets/loginpic.jpg")}
        className="absolute w-full h-full"
        style={{ opacity: 0.1 }}
      />

      {/* Content Container */}
      <View className="flex-1 justify-center px-8">
        {/* Login Form Container */}
        <View className="bg-blue-200/35 p-8 rounded-3xl shadow-lg backdrop-blur-lg">
          {/* Header */}
          <Text className="text-3xl font-bold text-center mb-8 text-blue-900">
            Welcome Back
          </Text>

          {/* Email Input */}
          <View className="bg-white/90 rounded-xl shadow-sm mb-4 overflow-hidden">
            <View className="flex-row items-center px-4 py-3">
              <FontAwesome name="envelope" size={20} color="#3B82F6" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-800"
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="bg-white/90 rounded-xl shadow-sm mb-6 overflow-hidden">
            <View className="flex-row items-center px-4 py-3">
              <FontAwesome name="lock" size={20} color="#3B82F6" />
              <TextInput
                className="flex-1 ml-3 text-base text-gray-800"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-4 mb-4"
            onPress={handleLogin}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <Text className="text-white text-center text-lg font-bold">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {error ? (
            <Text className="text-red-600 text-center mt-2">{error}</Text>
          ) : null}

          {/* Divider */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-0.5 bg-gray-300" />
            <Text className="mx-4 text-gray-500">or</Text>
            <View className="flex-1 h-0.5 bg-gray-300" />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity
            className="bg-white rounded-xl py-4 flex-row justify-center items-center border border-gray-200"
            onPress={handleGoogleLogin}
          >
            <FontAwesome name="google" size={20} color="#DB4437" />
            <Text className="text-gray-700 font-semibold ml-3">
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex justify-center items-center">
          <Link href="/" className="text-blue-500  font-semibold mt-4">
            Go to home
          </Link>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
