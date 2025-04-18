import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Image, Pressable } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import { AuthContext } from "../contexts/AuthContext";
import { resetFieldState } from "../redux/Slices/Fields";
import { useDispatch } from "react-redux";

export default function Header() {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const dispatch = useDispatch();

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
          className="h-12 w-12 rounded-full"
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
    <View style={{ zIndex: 50 }}>
      {/* Header Container */}
      <View className="flex-row justify-between items-center bg-blue-600 px-4 py-4">
        {/* App Logo and Name */}
        <View className="flex-row items-center gap-4">
          <Image
            source={require("../../assets/SIJM.webp")}
            className="h-12 w-12 rounded-full bg-slate-100"
            resizeMode="contain"
          />
          <Text className="text-white text-2xl font-semibold">SIJM</Text>
        </View>

        {/* Profile Button */}
        <TouchableOpacity onPress={toggleDialog} className="active:opacity-80">
          {/* {renderProfileButton()} */}
          <View className="h-8 w-8 rounded-full items-center justify-center">
            <FontAwesome name="ellipsis-v" color="white" size={20} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Dialog with proper z-index handling */}
      {isDialogVisible && (
        <>
          {/* Backdrop to close dialog when clicking outside */}
          <Pressable
            className="absolute top-0 left-0 right-0"
            style={{ zIndex: 48 }}
            onPress={toggleDialog}
          />

          {/* Dialog Content */}
          <View
            className="absolute top-20 right-4 bg-white shadow-lg rounded-lg overflow-hidden"
            style={{ zIndex: 49, width: 250 }}
          >
            {/* User Info Section */}
            <View className="p-4 border-b border-gray-200">
              <View className="items-center">
                {user && (
                  <Image
                    source={
                      user.image
                        ? { uri: user.image }
                        : require("../../assets/pp.jpg")
                    }
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
                <View className="flex-row gap-4">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      router.push("/screens/profile"); // Navigate to Profile screen
                      toggleDialog();
                    }}
                    className="bg-blue-500 flex-1 py-2 rounded-lg"
                  >
                    <Text className="text-white text-center font-semibold">
                      Profile
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      logout();
                      dispatch(resetFieldState());
                      toggleDialog();
                    }}
                    className="bg-red-500 flex-1 py-2 rounded-lg"
                  >
                    <Text className="text-white text-center font-semibold">
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
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
