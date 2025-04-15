import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const Shoot = () => {
  // Camera connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Camera settings
  const [currentMode, setCurrentMode] = useState("video");
  const [resolution, setResolution] = useState("4K");
  const [stabilization, setStabilization] = useState(true);

  // Available options
  const cameraModes = ["video", "photo"];
  const videoResolutions = ["4K", "1080p", "720p"];

  // Connect to camera
  const connectToCamera = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      Alert.alert("Connected", "Successfully connected to Insta360 camera");
    }, 1500);
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (currentMode === "photo") {
      Alert.alert("Photo Captured", "Photo saved to SD card");
    } else {
      setIsRecording(!isRecording);
      if (!isRecording) {
        Alert.alert(
          "Recording Started",
          `${currentMode} recording has started`
        );
      } else {
        Alert.alert("Recording Stopped", `${currentMode} has been saved`);
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      {/* <View className="bg-blue-500 p-4 items-center">
        <Text className="text-white text-xl font-bold">Insta360 Camera</Text>
      </View> */}

      {/* Camera preview area */}
      <View
        className="bg-gray-100 items-center justify-center relative mx-4 mt-4 rounded-lg overflow-hidden"
        style={{ height: Dimensions.get("window").width * 0.7 }}
      >
        {isConnected ? (
          <View className="w-full h-full items-center justify-center">
            <View className="absolute top-0 right-0 p-2">
              {isRecording && (
                <View className="flex-row items-center bg-red-500 px-2 py-1 rounded-full">
                  <MaterialCommunityIcons
                    name="record-circle"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text className="text-white ml-1 text-xs">REC</Text>
                </View>
              )}
            </View>
            <MaterialCommunityIcons name="camera" size={40} color="#CCCCCC" />
            <Text className="text-gray-400 mt-2">Live Preview</Text>
          </View>
        ) : (
          <View className="items-center">
            <MaterialCommunityIcons
              name="camera-off"
              size={40}
              color="#CCCCCC"
            />
            <Text className="text-gray-400 mt-2 mb-4">
              Camera Not Connected
            </Text>
            {isConnecting ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : (
              <TouchableOpacity
                className="bg-blue-500 py-2 px-4 rounded-full"
                onPress={connectToCamera}
              >
                <Text className="text-white font-medium">Connect Camera</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Camera controls - only show when connected */}
      {isConnected && (
        <View className="flex-1 mx-4 mt-6">
          {/* Mode selector */}
          <View className="flex-row justify-between bg-gray-100 p-2 rounded-lg">
            {cameraModes.map((mode) => (
              <TouchableOpacity
                key={mode}
                className={`px-4 py-2 rounded-lg flex-1 justify-center items-center ${
                  currentMode === mode ? "bg-blue-500" : ""
                }`}
                onPress={() => {
                  setCurrentMode(mode);
                  setIsRecording(false);
                }}
              >
                <Text
                  className={`${
                    currentMode === mode ? "text-white" : "text-gray-600"
                  } font-medium`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Resolution selector */}
          {currentMode === "video" && (
            <View className="mt-6">
              <Text className="text-gray-600 mb-2 font-medium">Resolution</Text>
              <View className="flex-row justify-start gap-2">
                {videoResolutions.map((res) => (
                  <TouchableOpacity
                    key={res}
                    className={`px-3 py-1 rounded-lg border ${
                      resolution === res
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300"
                    }`}
                    onPress={() => setResolution(res)}
                  >
                    <Text
                      className={`${
                        resolution === res ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {res}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Simple toggle settings */}
          <View className="mt-6 bg-gray-100 p-4 rounded-lg">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-medium">Stabilization</Text>
              <Switch
                value={stabilization}
                onValueChange={setStabilization}
                trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
                thumbColor={"#FFFFFF"}
              />
            </View>
          </View>

          {/* Capture button */}
          <View className="items-center mt-6">
            <TouchableOpacity
              className={`w-16 h-16 rounded-full justify-center items-center shadow ${
                isRecording ? "bg-red-600" : "bg-blue-500"
              }`}
              onPress={toggleRecording}
            >
              {currentMode === "photo" ? (
                <MaterialCommunityIcons
                  name="camera"
                  size={32}
                  color="#FFFFFF"
                />
              ) : currentMode === "video" ? (
                <MaterialCommunityIcons
                  name="video"
                  size={32}
                  color="#FFFFFF"
                />
              ) : currentMode === "timelapse" ? (
                <MaterialCommunityIcons
                  name="clock-time-four"
                  size={32}
                  color="#FFFFFF"
                />
              ) : (
                <View
                  className={`w-8 h-8 rounded-sm ${
                    isRecording ? "bg-white" : "bg-blue-500"
                  }`}
                >
                  {isRecording && (
                    <View className="w-6 h-6 rounded-full bg-red-600 m-1" />
                  )}
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default Shoot;
