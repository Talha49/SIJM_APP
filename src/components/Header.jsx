import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";

export default function Header() {
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const toggleDialog = () => {
    setIsDialogVisible(!isDialogVisible);
  };

  return (
    <View className="flex-row justify-between items-center bg-blue-600 border-b-2 px-4 py-4">
      {/* App Logo and Name */}
      <View className="flex-row items-center">
        <Image
          source={require("../../assets/SIJM.webp")} // Replace with your logo path
          className="h-12 w-12 mr-2 rounded-full border-black/25   bg-slate-100 border-2"
          resizeMode="contain"
        />
        <Text className="text-white text-lg font-bold">SIJM</Text>
      </View>

      {/* Profile Button */}
      <TouchableOpacity onPress={toggleDialog}>
        <Ionicons name="person-circle-outline" size={28} color="white" />
      </TouchableOpacity>

      {/* Dialog */}
      {isDialogVisible && (
        <View
          className="absolute top-16 right-4 bg-white shadow-lg rounded-lg p-4 w-48"
          style={{ zIndex: 10 }}
        >
          <Text className="text-lg font-semibold text-center mb-4">
            Welcome!
          </Text>
          {/* Button to navigate to login screen */}
          <Button
            title="Login"
            onPress={() => {
              router.push("/screens/login");
              toggleDialog();
            }}
          />
          <TouchableOpacity onPress={toggleDialog} className="mt-4">
            <Text className="text-center text-gray-500">Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
