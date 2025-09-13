import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator"; // Import for compression
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { Chip } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext } from "../../src/contexts/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useToast } from "../../src/components/customtoast";
import { API_URL } from "../../src/redux/Slices/Fields";

const CreateTaskScreen = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    userId: user?.id,
    creatorId: user?.id,
    username: user?.fullName || "No Name",
    description: "",
    priority: "",
    room: "",
    floor: "",
    status: "",
    tags: [],
    assignees: [],
    dueDate: new Date(),
    groundFloorImages: [],
    lastFloorImages: [],
    attachments: [],
    emailAlerts: [],
    watchers: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageType, setImageType] = useState("");

  const navigation = useNavigation();
  const { showToast } = useToast();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    requestPermissions();
  }, []);

  const priorityOptions = [
    { label: "High", color: "red" },
    { label: "Medium", color: "blue" },
    { label: "Low", color: "yellow" },
  ];

  const statusOptions = [
    { label: "Pending", color: "yellow" },
    { label: "In Progress", color: "blue" },
    { label: "Completed", color: "green" },
  ];

  const requestPermissions = async () => {
    const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!cameraPerm.granted || !mediaPerm.granted) {
      Alert.alert("Permission Required", "Camera and gallery access are needed.");
    }
  };

  const compressImage = async (uri) => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], // Resize to max width of 1024px (height scales proportionally)
        { compress: 0.8, format: "jpeg", base64: true } // 80% quality, output as JPEG
      );
      return manipulatedImage;
    } catch (error) {
      console.error("Image compression error:", error);
      Alert.alert("Error", "Failed to compress image");
      return { uri }; // Fallback to original if compression fails
    }
  };

  const convertToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      if (!response.ok) throw new Error("Failed to fetch file");
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Base64 conversion error:", error);
      Alert.alert("Error", "Failed to process image");
      return null;
    }
  };

  const showImageSourceOptions = (type) => {
    setImageType(type);
    Alert.alert(
      "Select Image Source",
      "Choose how to add the image:",
      [
        { text: "Camera", onPress: () => captureImage(type) },
        { text: "Gallery", onPress: () => pickImageFromGallery(type) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const captureImage = async (type) => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        const processedImages = await Promise.all(
          result.assets.map(async (asset) => {
            const compressedImage = await compressImage(asset.uri);
            const base64 = compressedImage.base64
              ? `data:image/jpeg;base64,${compressedImage.base64}`
              : await convertToBase64(compressedImage.uri);
            return {
              uri: compressedImage.uri,
              name: `${type}_${Date.now()}.jpg`,
              base64: base64,
            };
          })
        );

        updateImageState(type, processedImages);
      }
    } catch (error) {
      console.error(`Camera Error (${type}):`, error);
      Alert.alert("Error", "Failed to capture image");
    }
  };

  const pickImageFromGallery = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: type === "groundFloorImages",
        quality: 1,
      });

      if (!result.canceled) {
        const processedImages = await Promise.all(
          result.assets.map(async (asset) => {
            const compressedImage = await compressImage(asset.uri);
            const base64 = compressedImage.base64
              ? `data:image/jpeg;base64,${compressedImage.base64}`
              : await convertToBase64(compressedImage.uri);
            return {
              uri: compressedImage.uri,
              name: asset.fileName || `${type}_${Date.now()}.jpg`,
              base64: base64,
            };
          })
        );

        updateImageState(type, processedImages);
      }
    } catch (error) {
      console.error(`Gallery Error (${type}):`, error);
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  const updateImageState = (type, newImages) => {
    setFormData((prev) => ({
      ...prev,
      [type]:
        type === "groundFloorImages"
          ? [...prev.groundFloorImages, ...newImages]
          : newImages,
    }));
  };

  const pickAttachments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });

      if (result.type !== "cancel") {
        const processedAttachments = await Promise.all(
          (result.assets || [result]).map(async (file) => {
            const fileUri = file.uri || file.path;
            const fileName =
              file.name || file.fileName || `attachment_${Date.now()}`;
            const base64 = await convertToBase64(fileUri);
            return {
              uri: fileUri,
              name: fileName,
              base64: base64,
            };
          })
        );

        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, ...processedAttachments],
        }));
      }
    } catch (error) {
      console.error("Attachment Error:", error);
      Alert.alert("Error", "Failed to pick attachments");
    }
  };

  const removeFile = (type, index) => {
    setFormData((prev) => {
      const updatedFiles = [...prev[type]];
      updatedFiles.splice(index, 1);
      return { ...prev, [type]: updatedFiles };
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.description ||
      !formData.priority ||
      !formData.status ||
      !formData.dueDate ||
      !formData.room ||
      !formData.floor ||
      formData.tags.length === 0 ||
      formData.groundFloorImages.length === 0 ||
      formData.lastFloorImages.length === 0
    ) {
      showToast("Please fill all required fields", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("Request data size:", JSON.stringify(formData).length);
      const response = await axios.post(
        "https://smartinspectionjobmonitoringsijm.vercel.app/api/New/CreateTask",
        formData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 60000,
        }
      );

      console.log("Response:", response.status, response.data);
      showToast("Task created successfully", "success");
      resetForm();
    } catch (error) {
      console.error("Upload Error:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      showToast(
        error.response?.data?.error || "Network Error - Failed to upload task",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      userId: user?.id,
      creatorId: user?.id,
      username: user?.fullName || "No Name",
      description: "",
      priority: "",
      room: "",
      floor: "",
      status: "",
      tags: [],
      assignees: [],
      dueDate: new Date(),
      groundFloorImages: [],
      lastFloorImages: [],
      attachments: [],
      emailAlerts: [],
      watchers: [],
    });
  };

  const renderFilePickerWindow = (type, title) => {
    return (
      <TouchableOpacity
        onPress={() => showImageSourceOptions(type)}
        className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mb-4"
      >
        <MaterialIcons name="photo-camera" size={50} color="gray" />
        <Text className="text-gray-500 mt-2 text-center">{title}</Text>
      </TouchableOpacity>
    );
  };

  const renderFilePreview = (type) => {
    return (
      <ScrollView horizontal className="mt-2 mb-4">
        {formData[type].map((file, index) => (
          <View key={index} className="relative mr-2">
            <Image
              source={{ uri: file.uri }}
              className="w-32 h-32 rounded-lg"
            />
            <TouchableOpacity
              onPress={() => removeFile(type, index)}
              className="absolute top-0 right-0 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
            >
              <Text className="text-white text-xs">X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    );
  };

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      className="flex-1 bg-gray-100"
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView 
        className="p-4" 
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-gray-800">Create Task</Text>
        </View>

        <TextInput
          className="bg-white p-4 rounded-lg mb-4 h-24 text-base"
          placeholder="Task Description"
          value={formData.description}
          onChangeText={(text) => handleChange("description", text)}
          multiline
        />

        {/* Priority Buttons */}
        <View className="flex-row justify-between mb-4">
          {priorityOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => handleChange("priority", option.label)}
              className={`px-6 py-3 rounded-full ${
                formData.priority === option.label
                  ? `bg-${option.color}-500`
                  : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  formData.priority === option.label
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Buttons */}
        <View className="flex-row justify-between mb-4">
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              onPress={() => handleChange("status", option.label)}
              className={`px-6 py-3 rounded-full ${
                formData.status === option.label
                  ? `bg-${option.color}-500`
                  : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  formData.status === option.label
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Room and Floor */}
        <View className="flex-row space-x-4 mb-4">
          <TextInput
            className="flex-1 bg-white p-4 rounded-lg"
            placeholder="Room"
            value={formData.room}
            onChangeText={(text) => handleChange("room", text)}
          />
          <TextInput
            className="flex-1 bg-white p-4 rounded-lg"
            placeholder="Floor"
            value={formData.floor}
            onChangeText={(text) => handleChange("floor", text)}
          />
        </View>

        {/* Tags Section */}
        <View className="mb-4">
          <View className="flex-row mb-2">
            <TextInput
              className="flex-1 bg-white p-3 rounded-l-lg"
              placeholder="Add Tags"
              value={newTag}
              onChangeText={setNewTag}
            />
            <TouchableOpacity
              onPress={addTag}
              className="bg-blue-500 p-3 rounded-r-lg"
            >
              <Text className="text-white">Add</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap">
            {formData.tags.map((tag) => (
              <Chip
                key={tag}
                onClose={() => removeTag(tag)}
                className="mr-2 mb-2"
              >
                {tag}
              </Chip>
            ))}
          </View>
        </View>

        {/* Due Date */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-white p-4 rounded-lg mb-4 flex-row items-center"
        >
          <MaterialIcons name="date-range" size={24} className="mr-2" />
          <Text>{formData.dueDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dueDate || new Date()}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) handleChange("dueDate", selectedDate);
            }}
          />
        )}

        {/* Ground Floor Images Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">
            Ground Floor Images
          </Text>
          {formData.groundFloorImages.length === 0
            ? renderFilePickerWindow(
                "groundFloorImages",
                "Select Ground Floor Images"
              )
            : renderFilePreview("groundFloorImages")}
          {formData.groundFloorImages.length > 0 && (
            <TouchableOpacity
              onPress={() => showImageSourceOptions("groundFloorImages")}
              className="bg-blue-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">Add More Images</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Last Floor Images Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Last Floor Image</Text>
          {formData.lastFloorImages.length === 0
            ? renderFilePickerWindow(
                "lastFloorImages",
                "Select Last Floor Image"
              )
            : renderFilePreview("lastFloorImages")}
          {formData.lastFloorImages.length > 0 && (
            <TouchableOpacity
              onPress={() => showImageSourceOptions("lastFloorImages")}
              className="bg-blue-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">Change Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Attachments Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Attachments</Text>
          {formData.attachments.length === 0 ? (
            <TouchableOpacity
              onPress={pickAttachments}
              className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mb-4"
            >
              <MaterialIcons name="attach-file" size={50} color="gray" />
              <Text className="text-gray-500 mt-2 text-center">
                Select Attachments (PDF, TXT, JPG, etc.)
              </Text>
            </TouchableOpacity>
          ) : (
            renderFilePreview("attachments")
          )}
          {formData.attachments.length > 0 && (
            <TouchableOpacity
              onPress={pickAttachments}
              className="bg-green-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">
                Add More Attachments
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={
            loading ||
            !formData.description ||
            !formData.priority ||
            !formData.status ||
            formData.tags.length === 0 ||
            formData.groundFloorImages.length === 0 ||
            formData.lastFloorImages.length === 0
          }
          className={`bg-blue-500 p-4 rounded-lg flex-row items-center justify-center mb-16 ${
            loading ||
            !formData.description ||
            !formData.priority ||
            !formData.status ||
            formData.tags.length === 0 ||
            formData.groundFloorImages.length === 0 ||
            formData.lastFloorImages.length === 0
              ? "opacity-50"
              : ""
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" className="mr-2" />
          ) : null}
          <Text className="text-white font-semibold text-lg">Create</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateTaskScreen;