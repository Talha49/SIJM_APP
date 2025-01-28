import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Dimensions,
  Pressable
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const TaskDialog = ({ visible, task, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState('ground');
  
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

  if (!task) return null;

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
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-800">Task Details</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={24} color="#374151" />
            </TouchableOpacity>
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
                  <View className="absolute bottom-0 w-full bg-black/50 p-4">
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
                    <Text className="text-blue-700 font-medium">{task.status}</Text>
                  </View>
                </View>
                <Text className="text-gray-600">{task.description}</Text>
              </View>

              {/* Priority & Location */}
              <View className="flex-row justify-between p-4 bg-gray-50 rounded-xl">
                <View>
                  <Text className="text-gray-500 mb-1">Priority</Text>
                  <View className="flex-row items-center">
                    <FontAwesome5 name="flag" size={14} color="#0891b2" />
                    <Text className="ml-2 font-medium text-gray-700">{task.priority}</Text>
                  </View>
                </View>
                <View>
                  <Text className="text-gray-500 mb-1">Location</Text>
                  <View className="flex-row items-center">
                    <FontAwesome5 name="building" size={14} color="#0891b2" />
                    <Text className="ml-2 font-medium text-gray-700">
                      Floor {task.floor}, Room {task.room}
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
              {task.tags.length > 0 && (
                <View>
                  <Text className="text-lg font-bold text-gray-800 mb-3">Tags</Text>
                  <View className="flex-row flex-wrap">
                    {task.tags.map((tag, index) => (
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
                      {new Date(task.dueDate).toLocaleDateString()}
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


export default TaskDialog;