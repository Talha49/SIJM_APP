import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../contexts/api";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

const PipeDetection = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [detectedImage, setDetectedImage] = useState(null);

  // 📸 Function to Pick Image from Gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
      setDetectedImage(null); // Clear previous results
    }
  };

  // 📷 Function to Capture Image using Camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access the camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
      setDetectedImage(null); // Clear previous results
    }
  };

  // 🚀 Function to Upload Image for Detection
  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    const data = await uploadImage(image);
    
    if (data) {
      setResult(data);
      setDetectedImage(data.image_url);
    }

    setLoading(false);
  };

  return (
    <GestureHandlerRootView>
      <ScrollView className="flex-1 bg-gray-900 p-4">
        <Text className="text-white text-xl font-bold text-center mb-4">Pipe Detection Dashboard</Text>

        {/* 📸 Take Photo Button */}
        <TouchableOpacity onPress={takePhoto} className="bg-purple-500 p-3 rounded-lg mb-4">
          <Text className="text-white text-center">Take Photo</Text>
        </TouchableOpacity>

        {/* 📂 Choose from Gallery Button */}
        <TouchableOpacity onPress={pickImage} className="bg-blue-500 p-3 rounded-lg mb-4">
          <Text className="text-white text-center">Choose Image</Text>
        </TouchableOpacity>

        {image && (
          <View className="items-center">
            <Image source={{ uri: image }} className="w-64 h-64 rounded-lg" />
            <TouchableOpacity onPress={handleUpload} className="bg-green-500 p-3 rounded-lg mt-4">
              <Text className="text-white text-center">Upload & Detect</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && <ActivityIndicator size="large" color="#fff" className="mt-4" />}

        {result && (
          <View className="bg-gray-800 p-4 rounded-lg mt-4">
            <Text className="text-white text-lg font-semibold">Detection Results:</Text>
            <Text className="text-gray-300">Total Detections: {result.total}</Text>
            <Text className="text-gray-300">
              Highest Confidence: {Math.max(...result.detections.map(d => d.confidence)).toFixed(2)}
            </Text>
            <Text className="text-gray-300">
              Highest Class: {result.detections.reduce((prev, curr) => prev.confidence > curr.confidence ? prev : curr).class}
            </Text>
          </View>
        )}

        {detectedImage && (
          <View className="items-center mt-4">
            <Text className="text-white text-lg font-semibold">Detected Image:</Text>
            <Image source={{ uri: detectedImage }} className="w-64 h-64 rounded-lg mt-2" />
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default PipeDetection;
