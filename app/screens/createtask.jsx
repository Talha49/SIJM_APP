import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from 'expo-router';

const CreateTask = () => {
  
  const initialFormState = {
    username: '',
    description: '',
    priority: '',
    room: '',
    floor: '',
    status: '',
    tags: [],
    dueDate: new Date(),
    inspectionPhotos: [],
    floorPlan: null,
    attachments: []
  };

  const [formData, setFormData] = useState(initialFormState);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentTag, setCurrentTag] = useState('');
 
  const priorities = ['Low', 'Medium', 'High',];
  const statusOptions = ['Pending', 'In Progress', 'Completed'];
  
  const navigation = useNavigation();
  
    useEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, []);



  const resetForm = () => {
    setFormData(initialFormState);
    setErrors({});
    setCurrentTag('');
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.room.trim()) newErrors.room = 'Room is required';
    if (!formData.floor.trim()) newErrors.floor = 'Floor is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    if (formData.inspectionPhotos.length === 0) newErrors.inspectionPhotos = 'At least one inspection photo is required';
    if (!formData.floorPlan) newErrors.floorPlan = 'Floor plan is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Image & File Picking Functions
  const pickInspectionPhotos = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets.map(asset => ({
          url: asset.uri,
          width: asset.width,
          height: asset.height
        }));
        setFormData(prev => ({
          ...prev,
          inspectionPhotos: [...prev.inspectionPhotos, ...newPhotos]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick inspection photos');
      console.error('Error picking inspection photos:', error);
    }
  };

  const pickFloorPlan = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]) {
        setFormData(prev => ({
          ...prev,
          floorPlan: {
            url: result.assets[0].uri,
            width: result.assets[0].width,
            height: result.assets[0].height
          }
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick floor plan');
      console.error('Error picking floor plan:', error);
    }
  };

  const pickAttachments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true
      });

      if (result.type === 'success' || (Array.isArray(result.assets) && result.assets.length > 0)) {
        const files = Array.isArray(result.assets) ? result.assets : [result];
        const newAttachments = files.map(file => ({
          url: file.uri,
          name: file.name,
          size: file.size,
          type: file.mimeType
        }));

        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...newAttachments]
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick attachments');
      console.error('Error picking attachments:', error);
    }
  };

  // Tag Management
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Form Submission
  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted with data:', {
        ...formData,
        dueDate: formData.dueDate.toISOString(),
        inspectionPhotos: formData.inspectionPhotos.length,
        attachments: formData.attachments.length
      });
      
      Alert.alert(
        'Success',
        'Task created successfully!',
        [
          {
            text: 'OK',
            onPress: resetForm
          }
        ]
      );
    } else {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      console.log('Form validation errors:', errors);
    }
  };

  const FormField = ({ label, error, children }) => (
    <View className="mb-6">
      <Text className="text-gray-700 font-semibold mb-2">{label}</Text>
      {children}
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-800">Create New Task</Text>
          <Text className="text-gray-500 mt-2">Fill in the task details below</Text>
        </View>

        {/* Form Fields */}
        <FormField label="Username" error={errors.username}>
          <TextInput
            className={`bg-gray-50 rounded-xl px-4 py-3 border ${errors.username ? 'border-red-500' : 'border-gray-200'}`}
            value={formData.username}
            onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
            placeholder="Enter username"
          />
        </FormField>

        <FormField label="Description" error={errors.description}>
          <TextInput
            className={`bg-gray-50 rounded-xl px-4 py-3 border ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Enter task description"
            multiline
            numberOfLines={4}
          />
        </FormField>

        {/* Priority Selection */}
        <FormField label="Priority" error={errors.priority}>
          <View className="flex-row flex-wrap gap-2">
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority}
                onPress={() => setFormData(prev => ({ ...prev, priority }))}
                className={`px-4 py-2 rounded-full ${
                  formData.priority === priority ? 'bg-blue-500' : 'bg-gray-100'
                }`}
              >
                <Text className={formData.priority === priority ? 'text-white' : 'text-gray-700'}>
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormField>

        {/* Room and Floor */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1">
            <FormField label="Room" error={errors.room}>
              <TextInput
                className={`bg-gray-50 rounded-xl px-4 py-3 border ${errors.room ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.room}
                onChangeText={(text) => setFormData(prev => ({ ...prev, room: text }))}
                placeholder="Room number"
              />
            </FormField>
          </View>
          <View className="flex-1">
            <FormField label="Floor" error={errors.floor}>
              <TextInput
                className={`bg-gray-50 rounded-xl px-4 py-3 border ${errors.floor ? 'border-red-500' : 'border-gray-200'}`}
                value={formData.floor}
                onChangeText={(text) => setFormData(prev => ({ ...prev, floor: text }))}
                placeholder="Floor number"
              />
            </FormField>
          </View>
        </View>

        {/* Status Selection */}
        <FormField label="Status" error={errors.status}>
          <View className="flex-row flex-wrap gap-2">
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setFormData(prev => ({ ...prev, status }))}
                className={`px-4 py-2 rounded-full ${
                  formData.status === status ? 'bg-green-500' : 'bg-gray-100'
                }`}
              >
                <Text className={formData.status === status ? 'text-white' : 'text-gray-700'}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </FormField>

        {/* Due Date */}
        <FormField label="Due Date" error={errors.dueDate}>
          <TouchableOpacity 
            className={`bg-gray-50 rounded-xl px-4 py-3 border ${errors.dueDate ? 'border-red-500' : 'border-gray-200'}`}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>{formData.dueDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={formData.dueDate}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setFormData(prev => ({ ...prev, dueDate: selectedDate }));
                }
              }}
              minimumDate={new Date()}
            />
          )}
        </FormField>

        {/* Tags Input */}
        <FormField label="Tags">
          <View className="flex-row items-center mb-2">
            <TextInput
              className="flex-1 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200"
              value={currentTag}
              onChangeText={setCurrentTag}
              placeholder="Add a tag"
              onSubmitEditing={addTag}
            />
            <TouchableOpacity
              onPress={addTag}
              className="ml-2 bg-blue-500 p-3 rounded-xl"
            >
              <FontAwesome name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <View key={index} className="bg-blue-100 rounded-full px-3 py-1 flex-row items-center">
                <Text className="text-blue-800">{tag}</Text>
                <TouchableOpacity
                  onPress={() => removeTag(tag)}
                  className="ml-2"
                >
                  <FontAwesome name="times" size={16} color="#1D4ED8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </FormField>

        {/* Inspection Photos */}
        <FormField label="Inspection Photos" error={errors.inspectionPhotos}>
          <TouchableOpacity 
            onPress={pickInspectionPhotos}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center"
          >
            <FontAwesome name="camera" size={32} color="#6B7280" />
            <Text className="text-gray-500 mt-2">Upload inspection photos</Text>
          </TouchableOpacity>
          
          <View className="flex-row flex-wrap mt-4 gap-2">
            {formData.inspectionPhotos.map((photo, index) => (
              <View key={index} className="relative">
                <Image 
                  source={{ uri: photo.url }} 
                  className="w-20 h-20 rounded-lg"
                />
                <TouchableOpacity
                  onPress={() => {
                    const newPhotos = [...formData.inspectionPhotos];
                    newPhotos.splice(index, 1);
                    setFormData(prev => ({ ...prev, inspectionPhotos: newPhotos }));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <FontAwesome name="times" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </FormField>

        {/* Floor Plan */}
        <FormField label="Floor Plan" error={errors.floorPlan}>
          <TouchableOpacity 
            onPress={pickFloorPlan}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center"
          >
            <FontAwesome name="file-image-o" size={32} color="#6B7280" />
            <Text className="text-gray-500 mt-2">Upload floor plan (single image)</Text>
          </TouchableOpacity>
          
          {formData.floorPlan && (
            <View className="relative mt-4">
              <Image 
                source={{ uri: formData.floorPlan.url }} 
                className="w-full h-40 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, floorPlan: null }))}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
              >
                <FontAwesome name="times" size={12} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </FormField>

        {/* Attachments */}
        <FormField label="Attachments">
          <TouchableOpacity 
            onPress={pickAttachments}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center"
          >
            <FontAwesome name="paperclip" size={32} color="#6B7280" />
            <Text className="text-gray-500 mt-2">Add attachments</Text>
          </TouchableOpacity>
          
          <View className="mt-4">
            {formData.attachments.map((attachment, index) => (
              <View key={index} className="flex-row items-center justify-between bg-gray-100 rounded-lg p-3 mb-2">
                <View className="flex-row items-center flex-1">
                  <FontAwesome name="file" size={20} color="#6B7280" />
                  <Text className="ml-2 flex-1" numberOfLines={1}>{attachment.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    const newAttachments = [...formData.attachments];
                    newAttachments.splice(index, 1);
                    setFormData(prev => ({ ...prev, attachments: newAttachments }));
                  }}
                  className="bg-red-500 rounded-full p-1 ml-2"
                >
                  <FontAwesome name="times" size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </FormField>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-blue-600 rounded-xl py-4 mt-6 mb-8"
        >
          <Text className="text-white text-center font-bold text-lg">
            Create Task
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateTask;