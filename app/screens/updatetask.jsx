import React, { useState, useEffect, useContext } from "react";
import {
  View, Text, TextInput, TouchableOpacity, 
  ScrollView, Image, Alert, Platform, KeyboardAvoidingView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { Chip } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { AuthContext } from "../../src/contexts/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";

const UpdateTaskScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { user } = useContext(AuthContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTag, setNewTag] = useState("");

  const [formData, setFormData] = useState({
    userId: user?.id || "678d0df97b577e594b05550b",
    creatorId: user?.id || "678d0df97b577e594b05550b",
    username: user?.username || "ABC",
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
    watchers: []
  });

  const priorityOptions = [
    { label: "High", color: "red" },
    { label: "Medium", color: "orange" },
    { label: "Low", color: "green" }
  ];

  const statusOptions = [
    { label: "Pending", color: "gray" },
    { label: "In Progress", color: "blue" },
    { label: "Completed", color: "green" }
  ];

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://192.168.100.21:3000/api/New/GetTask/${taskId}`);
      
      const taskData = response.data.data;
      setFormData({
        ...taskData,
        dueDate: new Date(taskData.dueDate),
        groundFloorImages: taskData.groundFloorImages || [],
        lastFloorImages: taskData.lastFloorImages || [],
        attachments: taskData.attachments || []
      });
    } catch (error) {
      console.error("Fetch Task Error:", error);
      Alert.alert("Error", "Failed to fetch task details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const requestMediaPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
    return true;
  };

  const convertToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Base64 conversion error:", error);
      return null;
    }
  };

  // Image and attachment picking functions remain the same as in CreateTaskScreen
  // (pickGroundFloorImages, pickLastFloorImage, pickAttachments)
  // You can copy these functions directly from the previous implementation
const pickGroundFloorImages = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera roll permissions required.");
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const processedImages = await Promise.all(
          result.assets.map(async (asset) => {
            const base64 = await convertToBase64(asset.uri);
            return {
              uri: asset.uri,
              name: asset.fileName || `ground_floor_${Date.now()}.jpg`,
              base64: base64
            };
          })
        );

        setFormData(prev => ({
          ...prev,
          groundFloorImages: [...prev.groundFloorImages, ...processedImages]
        }));
      }
    } catch (error) {
      console.error("Ground Floor Images Error:", error);
      Alert.alert("Error", "Failed to pick ground floor images");
    }
  };

  const pickLastFloorImage = async () => {
    const hasPermission = await requestMediaPermission();
    if (!hasPermission) {
      Alert.alert("Permission Denied", "Camera roll permissions required.");
      return;
    }

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (!result.canceled) {
        const processedImage = await Promise.all(
          result.assets.map(async (asset) => {
            const base64 = await convertToBase64(asset.uri);
            return {
              uri: asset.uri,
              name: asset.fileName || `last_floor_${Date.now()}.jpg`,
              base64: base64
            };
          })
        );

        setFormData(prev => ({
          ...prev,
          lastFloorImages: processedImage
        }));
      }
    } catch (error) {
      console.error("Last Floor Images Error:", error);
      Alert.alert("Error", "Failed to pick last floor image");
    }
  };

  const pickAttachments = async () => {
    try {
      let result = await DocumentPicker.getDocumentAsync({ 
        type: "*/*", 
        multiple: true 
      });
  
      if (result.type !== "cancel") {
        const processedAttachments = await Promise.all(
          (result.assets || [result]).map(async (file) => {
            // Normalize file object properties
            const fileUri = file.uri || file.path;
            const fileName = file.name || file.fileName || `attachment_${Date.now()}`;
            const fileType = file.type || '';
  
            // Try to get base64 for images, leave as null for other file types
            const base64 = fileType.startsWith('image/') 
              ? await convertToBase64(fileUri)
              : null;
  
            return {
              uri: fileUri,
              name: fileName,
              type: fileType,
              base64: base64
            };
          })
        );
  
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...processedAttachments]
        }));
      }
    } catch (error) {
      console.error("Attachment Pick Error:", error);
      console.error("Error Details:", JSON.stringify(error, null, 2));
      Alert.alert("Error", "Failed to pick attachments");
    }
  };

   
  const removeFile = (type, index) => {
    setFormData(prev => {
      const updatedFiles = [...prev[type]];
      updatedFiles.splice(index, 1);
      return { ...prev, [type]: updatedFiles };
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev, 
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUpdate = async () => {
    if (!formData.description || !formData.priority) {
      Alert.alert("Error", "Please fill description and priority");
      return;
    }

    try {
      const response = await axios.put(
        `http://192.168.100.21:3000/api/New/UpdateTask/${taskId}`, 
        formData,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000
        }
      );
      
      Alert.alert("Success", "Task updated successfully");
      navigation.goBack(); // Optional: go back to previous screen
    } catch (error) {
      console.error("Update Error:", error.response?.data || error);
      Alert.alert(
        "Update Error", 
        error.response?.data?.error || "Failed to update task"
      );
    }
  };

  // Render functions (renderFilePickerWindow, renderFilePreview) 
  // remain the same as in CreateTaskScreen
 const renderFilePickerWindow = (type, onPress, title) => {
     return (
       <TouchableOpacity 
         onPress={onPress} 
         className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center mb-4"
       >
         <MaterialIcons 
           name={type === 'attachments' ? "attach-file" : "photo-camera"} 
           size={50} 
           color="gray" 
         />
         <Text className="text-gray-500 mt-2 text-center">{title}</Text>
       </TouchableOpacity>
     );
   };
 
   const renderFilePreview = (type) => {
     return (
       <ScrollView horizontal className="mt-2 mb-4">
         {formData[type].map((file, index) => (
           <View key={index} className="relative mr-2">
             {file.type?.startsWith('image/') || type.includes('Images') ? (
               <Image 
                 source={{ uri: file.uri }} 
                 className="w-32 h-32 rounded-lg" 
               />
             ) : (
               <View className="w-32 h-32 bg-gray-200 rounded-lg items-center justify-center p-2">
                 <MaterialIcons name="insert-drive-file" size={40} color="gray" />
                 <Text className="text-xs text-center mt-2" numberOfLines={2}>
                   {file.name}
                 </Text>
               </View>
             )}
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
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading Task Details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-100"
    >
      <ScrollView className="p-4">
        <Text className="text-2xl font-bold text-gray-800 mb-6">Update Task</Text>

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
              <Text className={`
                text-base font-semibold 
                ${formData.priority === option.label ? "text-white" : "text-gray-700"}
              `}>
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
              <Text className={`
                text-base font-semibold 
                ${formData.status === option.label ? "text-white" : "text-gray-700"}
              `}>
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

        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Ground Floor Images</Text>
          {formData.groundFloorImages.length === 0 
            ? renderFilePickerWindow(
                'groundFloorImages', 
                pickGroundFloorImages, 
                "Select Ground Floor Images"
              )
            : renderFilePreview('groundFloorImages')
          }
          {formData.groundFloorImages.length > 0 && (
            <TouchableOpacity 
              onPress={pickGroundFloorImages} 
              className="bg-blue-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">Add More Images</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Last Floor Images Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Last Floor Images</Text>
          {formData.lastFloorImages.length === 0 
            ? renderFilePickerWindow(
                'lastFloorImages', 
                pickLastFloorImage, 
                "Select Last Floor Image"
              )
            : renderFilePreview('lastFloorImages')
          }
          {formData.lastFloorImages.length > 0 && (
            <TouchableOpacity 
              onPress={pickLastFloorImage} 
              className="bg-blue-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">Change Image</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Attachments Section */}
        <View className="mb-4">
          <Text className="text-lg font-semibold mb-2">Attachments</Text>
          {formData.attachments.length === 0 
            ? renderFilePickerWindow(
                'attachments', 
                pickAttachments, 
                "Select Attachments (PDF, TXT, JPG, etc.)"
              )
            : renderFilePreview('attachments')
          }
          {formData.attachments.length > 0 && (
            <TouchableOpacity 
              onPress={pickAttachments} 
              className="bg-green-500 p-3 rounded-lg"
            >
              <Text className="text-white text-center">Add More Attachments</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Update Button */}
        <TouchableOpacity 
          onPress={handleUpdate} 
          className="bg-blue-600 p-4 rounded-lg mt-4"
        >
          <Text className="text-white text-center font-bold text-lg">
            Update Task
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default UpdateTaskScreen;