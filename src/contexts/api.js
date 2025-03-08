import axios from "axios";

const API_URL = "http://192.168.18.146:8000"; // Replace with your actual server IP

export const uploadImage = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "image.jpg",
      type: "image/jpeg",
    });

    const response = await axios.post(`${API_URL}/detect_pipes/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // Contains detection results
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};




import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "../contexts/api";

const DetectionComponent = ({ detectionType, title }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [detectedImage, setDetectedImage] = useState(null);

  // Function to pick image from gallery
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
      setDetectedImage(null);
    }
  };

  // Function to capture image using camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access camera is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
      setDetectedImage(null);
    }
  };

  // Function to upload the image for detection
  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    const data = await uploadImage(detectionType, image);
    if (data) {
      setResult(data);
      setDetectedImage(data.image_url);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#111", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 24, textAlign: "center", marginBottom: 16 }}>
        {title}
      </Text>

      {/* Image Picker Buttons */}
      <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }}>
        <TouchableOpacity onPress={takePhoto} style={{ backgroundColor: "#6200EE", padding: 10, borderRadius: 5 }}>
          <Text style={{ color: "#fff" }}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage} style={{ backgroundColor: "#03DAC6", padding: 10, borderRadius: 5 }}>
          <Text style={{ color: "#000" }}>Choose Image</Text>
        </TouchableOpacity>
      </View>

      {/* Display Selected Image */}
      {image && (
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Image source={{ uri: image }} style={{ width: 250, height: 250, borderRadius: 10 }} />
          <TouchableOpacity onPress={handleUpload} style={{ backgroundColor: "#BB86FC", padding: 10, borderRadius: 5, marginTop: 10 }}>
            <Text style={{ color: "#fff" }}>Upload & Detect</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#fff" style={{ marginBottom: 16 }} />}

      {/* Display Detection Results */}
      {result && (
        <View style={{ backgroundColor: "#333", padding: 16, borderRadius: 10, marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>Detection Results:</Text>
          <Text style={{ color: "#fff" }}>Total Detections: {result.total}</Text>
          <Text style={{ color: "#fff" }}>
            Highest Confidence: {Math.max(...result.detections.map(d => d.confidence)).toFixed(2)}
          </Text>
          <Text style={{ color: "#fff" }}>
            Highest Class:{" "}
            {result.detections.reduce((prev, curr) => (prev.confidence > curr.confidence ? prev : curr)).class}
          </Text>
        </View>
      )}

      {/* Display Annotated Image */}
      {detectedImage && (
        <View style={{ alignItems: "center", marginBottom: 16 }}>
          <Text style={{ color: "#fff", fontSize: 18 }}>Detected Image:</Text>
          <Image source={{ uri: detectedImage }} style={{ width: 250, height: 250, borderRadius: 10, marginTop: 8 }} />
        </View>
      )}
    </ScrollView>
  );
};

export default DetectionComponent;




