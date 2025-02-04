import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Dimensions,
  Modal
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import TaskDialog from '../../src/components/TaskDialog';
import { AuthContext } from '../../src/contexts/AuthContext';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, fetchTasks } from '../../src/redux/Slices/Fields';
import { useRouter } from 'expo-router';
import CreateTaskScreen from '../screens/createtask';


const TaskList = () => {
  
  const router = useRouter()
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  
  // Local state management
  const [localTasks, setLocalTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Redux state
  const { tasks, loading, error } = useSelector((state) => state.field);

  // Authentication check
  const checkAuthentication = () => {
    if (!user?.id) {
      setErrorMessage('Please log in to view tasks');
      return false;
    }
    return true;
  };

  // Fetch tasks with error handling
const handleFetchTasks = async () => {
    if (!checkAuthentication()) return;

    try {
      setIsLoading(true);
      setErrorMessage('');
      const result = await dispatch(fetchTasks(user.id)).unwrap();
      setLocalTasks(result);
    } catch (err) {
      setErrorMessage('Failed to fetch tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete task with error handling
  const handleDeleteTask = async (taskId) => {
    try {
      setIsLoading(true);
      await dispatch(deleteTask(taskId)).unwrap();
      setLocalTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (err) {
      setErrorMessage('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await handleFetchTasks();
    setRefreshing(false);
  };


  const handleEditTask = (task) => {
    console.log("Editing Task:", task); // Debug log
    setSelectedTask(task);
    setEditModalVisible(true);
  };

  useEffect(() => {
    handleFetchTasks();
  }, [user?.id]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (tasks) {
      setLocalTasks(tasks);
    }
  }, [tasks]);

  // Style utility functions
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Authentication error view
  if (!user?.id) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <FontAwesome5 name="user-lock" size={50} color="#ef4444" />
        <Text className="mt-4 text-gray-800 text-lg font-medium text-center">
          Please log in to view tasks
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/screens/login')}
          className="mt-4 bg-cyan-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading view
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#0891b2" />
      </View>
    );
  }

  // Error view
  if (errorMessage) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-gray-50">
        <FontAwesome5 name="exclamation-circle" size={50} color="#ef4444" />
        <Text className="mt-4 text-red-500 text-lg font-medium text-center">
          {errorMessage}
        </Text>
        <TouchableOpacity 
          onPress={onRefresh}
          className="mt-4 bg-cyan-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty state view
  if (localTasks.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Image 
          source={require('../../assets/svg.jpg')}
          className="w-64 h-64"
          resizeMode="contain"
        />
        <Text className="mt-4 text-gray-800 text-lg font-medium text-center">
          No tasks available
        </Text>
        <TouchableOpacity 
          onPress={onRefresh}
          className="mt-4 bg-cyan-600 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-medium">Refresh</Text>
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
          <Text className="text-2xl font-bold text-gray-800">Field Notes</Text>
          <View className="flex-row mt-4 justify-between">
            <View className="flex-row items-center">
              <FontAwesome5 name="tasks" size={16} color="#0891b2" />
              <Text className="ml-2 text-gray-600 font-medium">
                {localTasks.length} Active Fields
              </Text>
            </View>
            <TouchableOpacity className="bg-blue-600 px-2 py-2 rounded-lg flex-row items-center">
              <FontAwesome5 name="plus" size={12} color="white" />
              <Text onPress={() => router.push('/screens/createtask')} className="text-white text-sm font-medium ml-2">New Inspection</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Task List */}
        <View className="p-4">
          {localTasks.map((task) => (
            <TouchableOpacity
              key={task._id}
              onPress={() => {
                setSelectedTask(task);
                setDialogVisible(true);
              }}
              className="bg-white rounded-xl shadow-2xl mb-4 overflow-hidden"
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
                  <View className="flex-row">
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEditTask(task);
                      }}
                      className="p-2 mr-2"
                    >
                      <FontAwesome5 name="edit" size={16} color="#0891b2" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task._id);
                      }}
                      className="p-2"
                    >
                      <FontAwesome5 name="trash-alt" size={16} color="#ef4444" />
                    </TouchableOpacity>
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
                {(task.groundFloorImages?.length > 0 || task.lastFloorImages?.length > 0) && (
                  <View className="mt-4">
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      className="flex-row"
                    >
                      {task.groundFloorImages?.length > 0 && (
                        <View className="relative">
                          <Image
                            source={{ uri: task.groundFloorImages[0].url }}
                            className="w-16 h-16 rounded-lg mr-2"
                          />
                          {task.groundFloorImages.length > 1 && (
                            <View className="absolute right-2 bottom-0 bg-black/50 px-2 py-1 rounded-full">
                              <Text className="text-white text-xs">+{task.groundFloorImages.length - 1}</Text>
                            </View>
                          )}
                        </View>
                      )}
                      {task.lastFloorImages?.length > 0 && (
                        <Image
                          source={{ uri: task.lastFloorImages[0].url }}
                          className="w-16 h-16 rounded-lg mr-2"
                        />
                      )}
                    </ScrollView>
                  </View>
                )}

                {/* Tags */}
                {task.tags?.length > 0 && (
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

      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          setEditModalVisible(false);
          setSelectedTask(null);
        }}
      >
        {selectedTask && (
          <CreateTaskScreen 
            initialTask={selectedTask} 
            onClose={() => {
              setEditModalVisible(false);
              setSelectedTask(null);
              handleFetchTasks(); // Refresh tasks after update
            }}
            isEditMode={true}
          />
        )}
      </Modal>

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