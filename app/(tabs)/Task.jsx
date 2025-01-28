import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Dimensions
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import TaskDialog from '../../src/components/TaskDialog';

const { width } = Dimensions.get('window');

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        'http://192.168.72.62:3000/api/New/GetTask/678d0df97b577e594b05550b'
      );
      setTasks(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTasks().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <FontAwesome5 name="exclamation-circle" size={50} color="#ef4444" />
        <Text className="mt-4 text-red-500 text-lg font-medium">{error}</Text>
        <TouchableOpacity 
          onPress={onRefresh}
          className="mt-4 bg-cyan-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (


    <>  
      <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <View className="bg-white px-4 py-6 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Task Management</Text>
        <View className="flex-row mt-4 justify-between">
          <View className="flex-row items-center">
            <FontAwesome5 name="tasks" size={16} color="#0891b2" />
            <Text className="ml-2 text-gray-600 font-medium">
              {tasks.length} Active Tasks
            </Text>
          </View>
          <TouchableOpacity className="bg-cyan-600 px-4 py-2 rounded-lg flex-row items-center">
            <FontAwesome5 name="plus" size={12} color="white" />
            <Text className="text-white font-medium ml-2">New Task</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-4">
        {tasks.map((task) => (
          <TouchableOpacity
            key={task._id}
            onPress={() => {
                setSelectedTask(task);
                setDialogVisible(true);
              }}
            className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
          >
            {/* Task Header */}
            <View className="p-4 border-b border-gray-100">
              <View className="flex-row justify-between items-center mb-2">
                <View className="flex-1">
                  <Text className="text-xl font-bold text-gray-800" numberOfLines={1}>
                    {task.username}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ml-2 ${getStatusColor(task.status)}`}>
                  <Text className="font-medium">{task.status}</Text>
                </View>
              </View>
              <Text className="text-gray-600" numberOfLines={2}>
                {task.description}
              </Text>
            </View>

            {/* Task Details */}
            <View className="p-4">
              {/* Priority and Location Row */}
              <View className="flex-row justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <FontAwesome5 name="flag" size={14} color="#0891b2" />
                  <View className={`ml-2 px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    <Text className="font-medium">{task.priority}</Text>
                  </View>
                </View>
                <View className="flex-row items-center flex-1">
                  <FontAwesome5 name="building" size={14} color="#0891b2" />
                  <Text className="ml-2 text-gray-700">
                    Floor {task.floor}, Room {task.room}
                  </Text>
                </View>
              </View>

              {/* Assignees and Date Row */}
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <FontAwesome5 name="users" size={14} color="#0891b2" />
                  <View className="flex-row ml-2">
                    {task.assignees.map((assignee, index) => (
                      <View 
                        key={assignee._id}
                        className="w-6 h-6 bg-cyan-100 rounded-full justify-center items-center"
                        style={index > 0 ? { marginLeft: -4 } : {}}
                      >
                        <Text className="text-xs text-cyan-700 font-medium">
                          {assignee.name.charAt(0)}
                        </Text>
                      </View>
                    ))}
                    <Text className="ml-2 text-gray-600">
                      {task.assignees.length} assignees
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <FontAwesome5 name="calendar-alt" size={14} color="#0891b2" />
                  <Text className="ml-2 text-gray-600">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Images Preview */}
              {(task.groundFloorImages.length > 0 || task.lastFloorImages.length > 0) && (
                <View className="mt-4">
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                  >
                    {[...task.groundFloorImages, ...task.lastFloorImages].map((image, index) => (
                      <Image
                        key={image._id}
                        source={{ uri: image.url }}
                        className="w-16 h-16 rounded-lg mr-2"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Tags */}
              {task.tags.length > 0 && (
                <View className="flex-row mt-4 flex-wrap">
                  {task.tags.map((tag, index) => (
                    <View 
                      key={index}
                      className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
                    >
                      <Text className="text-gray-700 text-sm">{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>

    <TaskDialog
        visible={dialogVisible}
        task={selectedTask}
        onClose={() => {
          setDialogVisible(false);
          setSelectedTask(null);
        }}
      />
    </>
  );
};

export default TaskList;