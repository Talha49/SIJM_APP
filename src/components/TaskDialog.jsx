import React, { useState } from 'react';
import {   View, 
   
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  ActivityIndicator,
  Dimensions,
  Pressable,
  Linking, } from 'react-native';
import { TextInput, Text, Chip, Button, IconButton, Surface } from 'react-native-paper';
import { FontAwesome5 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useToast } from './customtoast';
import { useNavigation } from 'expo-router';

const { width, height } = Dimensions.get('window');

const TaskDialog = ({ visible, task, onClose, showEditButton=true}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState('ground');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  

    const navigation = useNavigation();
    
  
    React.useEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
    }, []);
  // Initialize edited task data when task prop changes
  React.useEffect(() => {
    if (task) {
      setEditedTask({
        description: task.description,
        tags: [...task.tags],
        status: task.status,
        dueDate: new Date(task.dueDate),
        room: task.room,
        floor: task.floor,
        priority: task.priority
      });
    }
  }, [task]);

  const allImages = [
    ...(task?.groundFloorImages || []).map(img => ({ ...img, type: 'Ground Floor' })),
    ...(task?.lastFloorImages || []).map(img => ({ ...img, type: 'Last Floor' }))
  ];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleDownload = async (url) => {

    
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening attachment:', error);
    }
  };
  const handleSave = async () => {
    try {
      setLoading(true)
      const response = await axios.put(
        `http://192.168.100.174:3000/api/New/UpdateTask/${task._id}`,
        {
          ...task,
          ...editedTask,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      showToast("Task Updated successfully", "success");
  
      if (response.data.success) {
        setIsEditMode(false);
        // You might want to trigger a refresh of the parent component here
      } else {
        console.error("Failed to update task:", response.data.error);
        showToast("Fail to updated task", "error");
      }
    } catch (error) {
      console.error("Error updating task:", error.response?.data || error.message);
      showToast("Fail to updated task", "error");

    }
    finally{
      setLoading(false)
    }
  };

  const statusOptions = ['Pending', 'In Progress', 'Completed'];
  const priorityOptions = ['Low', 'Medium', 'High'];

  if (!task || !editedTask) return null;

  const renderEditableField = () => {
   
    
    if (!isEditMode) return null;
  
    const addTag = () => {
      if (newTag.trim()) {
        setEditedTask(prev => ({
          ...prev,
          tags: [...prev.tags, newTag.trim()]
        }));
        setNewTag('');
      }
    };
  
    const removeTag = (indexToRemove) => {
      setEditedTask(prev => ({
        ...prev,
        tags: prev.tags.filter((_, index) => index !== indexToRemove)
      }));
    };
  
    return (
      <Surface className="p-6 m-4 rounded-xl">
        {/* Description */}
        <TextInput
          mode="outlined"
          label="Description"
          value={editedTask.description}
          onChangeText={(text) => setEditedTask(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
          className="mb-6"
        />
  
        {/* Status Selection */}
        <Text className="text-base font-medium mb-2">Status</Text>
        <View className="flex-row flex-wrap mb-6">
          {statusOptions.map((status) => (
            <Chip
              key={status}
              selected={editedTask.status === status}
              onPress={() => setEditedTask(prev => ({ ...prev, status }))}
              className="mr-2 mb-2"
              mode="outlined"
            >
              {status}
            </Chip>
          ))}
        </View>
  
        {/* Priority Selection */}
        <Text className="text-base font-medium mb-2">Priority</Text>
        <View className="flex-row flex-wrap mb-6">
          {priorityOptions.map((priority) => (
            <Chip
              key={priority}
              selected={editedTask.priority === priority}
              onPress={() => setEditedTask(prev => ({ ...prev, priority }))}
              className="mr-2 mb-2"
              mode="outlined"
            >
              {priority}
            </Chip>
          ))}
        </View>
  
        {/* Location Fields */}
        <View className="flex-row space-x-4 mb-6">
          <View className="flex-1">
            <TextInput
              mode="outlined"
              label="Floor"
              value={String(editedTask.floor)}
              onChangeText={(text) => setEditedTask(prev => ({ ...prev, floor: text }))}
             
            />
          </View>
          <View className="flex-1">
            <TextInput
              mode="outlined"
              label="Room"
              value={String(editedTask.room)}
              onChangeText={(text) => setEditedTask(prev => ({ ...prev, room: text }))}
            />
          </View>
        </View>
  
        {/* Due Date */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="mb-6"
        >
          <TextInput
            mode="outlined"
            label="Due Date"
            value={editedTask.dueDate.toLocaleDateString()}
            editable={false}
            right={<TextInput.Icon icon="calendar" />}
          />
        </TouchableOpacity>
  
        {/* Tags Input */}
        <Text className="text-base font-medium mb-2">Tags</Text>
        <View className="flex-row items-center mb-3 gap-4">
          <TextInput
            mode="outlined"
            value={newTag}
            onChangeText={setNewTag}
            placeholder="Enter a tag"
            className="flex-1 mr-2"
            onSubmitEditing={addTag}
          />
          <Button 
            mode="contained" 
            onPress={addTag}
            disabled={!newTag.trim()}
          >
            Add
          </Button>
        </View>
        
        {/* Tags Display */}
        <View className="flex-row flex-wrap">
          {editedTask.tags.map((tag, index) => (
            <Chip
              key={index}
              onClose={() => removeTag(index)}
              className="mr-2 mb-2"
              mode="outlined"
            >
              {tag}
            </Chip>
          ))}
        </View>
      </Surface>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 mt-8 bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b-4  border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Task Details</Text>
            <View className="flex-row gap-4"> 
              {
                showEditButton && (
                  <TouchableOpacity onPress={() => setIsEditMode(!isEditMode)}>
                <FontAwesome5 name={isEditMode ? "save" : "edit"} size={24} color="#374151" />
              </TouchableOpacity>
                )
              }
              
              <TouchableOpacity onPress={onClose}>
                <FontAwesome5 name="times" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1">
            {/* Image Carousel */}
            <View className="bg-gray-900 w-full aspect-square relative">
              {allImages.length > 0 && (
                <>
                  <Image
                    source={{ uri: allImages[activeImageIndex].url }}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                  <View className="absolute bottom-0 w-full bg-yellow-100 p-4">
                    <Text className="text-white font-medium text-center">
                      {allImages[activeImageIndex].type} - Image {activeImageIndex + 1} of {allImages.length}
                    </Text>
                  </View>
                  {allImages.length > 1 && (
                    <>
                      <TouchableOpacity 
                        onPress={prevImage}
                        className="absolute left-4 top-1/2 -mt-8 bg-black/50 w-10 h-16 rounded-lg justify-center items-center"
                      >
                        <FontAwesome5 name="chevron-left" size={20} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={nextImage}
                        className="absolute right-4 top-1/2 -mt-8 bg-black/50 w-10 h-16 rounded-lg justify-center items-center"
                      >
                        <FontAwesome5 name="chevron-right" size={20} color="white" />
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>

            {/* Thumbnail Navigation */}
            {allImages.length > 1 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                className="bg-gray-900 py-2 px-4"
              >
                {allImages.map((image, index) => (
                  <TouchableOpacity
                    key={image._id}
                    onPress={() => setActiveImageIndex(index)}
                    className={`mr-2 ${activeImageIndex === index ? 'border-2 border-white' : ''}`}
                  >
                    <Image
                      source={{ uri: image.url }}
                      className="w-16 h-16 rounded"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Task Information */}
            <View className="p-4 space-y-6">
              {/* Basic Info */}
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-2xl font-bold text-gray-800">{task.username}</Text>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 font-medium">{editedTask.status}</Text>
                  </View>
                </View>
                {isEditMode ? (
                  renderEditableField()
                ) : (
                  <Text className="text-gray-600">{editedTask.description}</Text>
                )}
              </View>

              {/* Priority & Location */}
              <View className="flex-row justify-between p-4 bg-gray-50 rounded-xl">
                <View>
                  <Text className="text-gray-500 mb-1">Priority</Text>
                  <View className="flex-row items-center">
                    <FontAwesome5 name="flag" size={14} color="#0891b2" />
                    <Text className="ml-2 font-medium text-gray-700">{editedTask.priority}</Text>
                  </View>
                </View>
                <View>
                  <Text className="text-gray-500 mb-1">Location</Text>
                  <View className="flex-row items-center">
                    <FontAwesome5 name="building" size={14} color="#0891b2" />
                    <Text className="ml-2 font-medium text-gray-700">
                      Floor {editedTask.floor}, Room {editedTask.room}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Assignees */}
              <View>
                <Text className="text-lg font-bold text-gray-800 mb-3">Assignees</Text>
                <View className="space-y-2">
                  {task.assignees.map((assignee) => (
                    <View 
                      key={assignee._id}
                      className="flex-row items-center bg-gray-50 p-3 rounded-xl"
                    >
                      <View className="w-10 h-10 bg-cyan-100 rounded-full justify-center items-center">
                        <Text className="text-lg text-cyan-700 font-medium">
                          {assignee.name.charAt(0)}
                        </Text>
                      </View>
                      <View className="ml-3">
                        <Text className="font-medium text-gray-800">{assignee.name}</Text>
                        <Text className="text-gray-500 text-sm">Assignee</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Tags */}
              {editedTask.tags.length > 0 && (
                <View>
                  <Text className="text-lg font-bold text-gray-800 mb-3">Tags</Text>
                  <View className="flex-row flex-wrap">
                    {editedTask.tags.map((tag, index) => (
                      <View 
                        key={index}
                        className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
                      >
                        <Text className="text-gray-700">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Dates */}
              <View className="bg-gray-50 p-4 rounded-xl">
                <View className="flex-row justify-between mb-3">
                  <View>
                    <Text className="text-gray-500 mb-1">Due Date</Text>
                    <Text className="font-medium text-gray-700">
                      {editedTask.dueDate.toLocaleDateString()}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-500 mb-1">Created</Text>
                    <Text className="font-medium text-gray-700">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text className="text-gray-500 mb-1">Last Updated</Text>
                  <Text className="font-medium text-gray-700">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Attachments Section */}
            {task.attachments && task.attachments.length > 0 && (
              <View className="p-4 mt-4">
              <Text className="text-lg font-bold text-gray-800 mb-3">Attachments</Text>
                <View className="space-y-2">
                  {task.attachments.map((attachment, index) => {
                    const fileName = attachment.url.split('/').pop().split('?')[0];
                    const fileExt = fileName.split('.').pop().toUpperCase();
                    
                    return (
                      <TouchableOpacity
                        key={attachment._id}
                        onPress={() => handleDownload(attachment.url)}
                        className="flex-row items-center bg-gray-50 p-4 rounded-xl"
                      >
                        <View className="w-10 h-10 bg-blue-100 rounded-lg justify-center items-center">
                          <FontAwesome5 
                            name={fileExt === 'PDF' ? 'file-pdf' : 'file'}
                            size={20}
                            color="#2563eb"
                          />
                        </View>
                        <View className="flex-1 ml-3">
                          <Text className="font-medium text-gray-800" numberOfLines={1}>
                            {decodeURIComponent(fileName)}
                          </Text>
                          <Text className="text-gray-500 text-sm">
                            {fileExt} Document
                          </Text>
                        </View>
                        <TouchableOpacity 
                          onPress={() => handleDownload(attachment.url)}
                          className="ml-2 p-2"
                        >
                          <FontAwesome5 
                            name="download" 
                            size={16} 
                            color="#2563eb"
                          />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Save Button in Edit Mode */}
          {isEditMode && (
            <View className="p-4 border-t border-gray-200">
  <TouchableOpacity
    onPress={handleSave}
    className="bg-blue-500 p-4 rounded-xl flex-row items-center justify-center  "
   
  >
    {loading ? (
      <ActivityIndicator size="small" color="#fff" className="mr-2" />
    ) : null}
    <Text className="text-white font-bold text-center">
      {loading ? 'Saving...' : 'Save Changes'}
    </Text>
  </TouchableOpacity>
</View>

          )}

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={editedTask.dueDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setEditedTask(prev => ({ ...prev, dueDate: selectedDate }));
                }
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default TaskDialog;