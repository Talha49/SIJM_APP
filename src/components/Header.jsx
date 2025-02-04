import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { AuthContext } from "../contexts/AuthContext";

export default function Header() {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const toggleDialog = () => {
    setIsDialogVisible(!isDialogVisible);
  };

  const renderProfileButton = () => {
    if (!user) {
      return <Ionicons name="person-circle-outline" size={28} color="white" />;
    }

    // If user is logged in and has an image, show their image
    if (user.image) {
      return (
        <Image
          source={{ uri: user.image }}
          className="h-8 w-8 rounded-full"
          resizeMode="cover"
        />
      );
    }

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
    <View style={{ zIndex: 50 }}>
      {/* Header Container */}
      <View className="flex-row justify-between items-center bg-blue-600 border-b-2 px-4 py-4">
        {/* App Logo and Name */}
        <View className="flex-row items-center">
          <Image
            source={require("../../assets/SIJM.webp")}
            className="h-12 w-12 mr-2 rounded-full border-black/25 bg-slate-100 border-2"
            resizeMode="contain"
          />
          <Text className="text-white text-lg font-bold">SIJM</Text>
        </View>

        {/* Profile Button */}
        <TouchableOpacity 
          onPress={toggleDialog}
          className="active:opacity-80"
        >
          {renderProfileButton()}
        </TouchableOpacity>
      </View>

      {/* Dialog with proper z-index handling */}
      {isDialogVisible && (
        <>
          {/* Backdrop to close dialog when clicking outside */}
          <Pressable
            className="absolute top-0 left-0 right-0 bottom-0"
            style={{ zIndex: 48 }}
            onPress={toggleDialog}
          />
          
          {/* Dialog Content */}
          <View
            className="absolute top-16 right-4 bg-white shadow-lg rounded-lg overflow-hidden"
            style={{ zIndex: 49, width: 250 }}
          >
            {/* User Info Section */}
            <View className="p-4 border-b border-gray-200">
              <View className="items-center">
                {user && (
                  <Image
                    source={user.image ? { uri: user.image } : require("../../assets/pp.jpg")}
                    className="h-16 w-16 rounded-full mb-3"
                    resizeMode="cover"
                  />
                )}
                <Text className="text-lg font-semibold text-gray-800">
                  {user ? user.fullName : "Welcome!"}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="p-4">
              {user ? (
                <TouchableOpacity
                  onPress={() => {
                    logout();
                    toggleDialog();
                  }}
                  className="bg-red-500 py-2 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    Logout
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    router.push("/screens/login");
                    toggleDialog();
                  }}
                  className="bg-blue-500 py-2 rounded-lg"
                >
                  <Text className="text-white text-center font-semibold">
                    Login
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
}