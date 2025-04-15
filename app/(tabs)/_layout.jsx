import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { Image, Platform, View } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../src/contexts/AuthContext";

export default function TabLayout() {
  const { user, logout } = useContext(AuthContext);

  const renderProfileButton = () => {
    if (!user) {
      return <Ionicons name="person-circle-outline" size={28} color="white" />;
    }

    // If user is logged in and has an image, show their image
    if (user.image) {
      return (
        <Image
          source={{ uri: user.image }}
          className="h-12 w-12 border-2 border-blue-500 rounded-full"
          resizeMode="cover"
        />
      );
    }

    console.log(user);
    // If user is logged in but no image, show default image from assets
    return (
      <Image
        source={require("../../assets/pp.jpg")}
        className="h-10 w-10 rounded-full"
        resizeMode="cover"
      />
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {  },
        }),
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Task Tab */}
      <Tabs.Screen
        name="Fields"
        options={{
          title: "Fields",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="tasks" size={size} color={color} />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="Profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            // <FontAwesome name="user-circle" size={size} color={color} />
            <View className="absolute bottom-1/4">{renderProfileButton()}</View>
          ),
        }}
      />

      {/* Inspector Tab */}
      <Tabs.Screen
        name="Inspector"
        options={{
          title: "Inspector",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="eye" size={size} color={color} />
          ),
        }}
      />
      {/* Shoot Video Tab */}
      <Tabs.Screen
        name="Shoot"
        options={{
          title: "Shoot",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="camera-retro" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
