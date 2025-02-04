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
import { useToast } from '../../src/components/customtoast';

const TaskList = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  
  // Local state management
  const [localTasks, setLocalTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  // Redux state
  const { tasks, loading, error } = useSelector((state) => state.field);
  const { showToast } = useToast();

  // Authentication check
  const checkAuthentication = () => {
    if (!user?.id) {
      setErrorMessage('Please log in to view tasks');
      return false;
    }
    return true;
  };

 
  // Fetch tasks with error handling and filtering
  const handleFetchTasks = async () => {
    if (!checkAuthentication()) return;

    try {
        setIsLoading(true);
        setErrorMessage('');
        const result = await dispatch(fetchTasks(user.id)).unwrap();

        // Filter tasks where user.fullName exists in task.assignees
        const filteredTasks = result.filter(task =>
            task.assignees.some(assignee => assignee.name === user.fullName)
        );

        setLocalTasks(filteredTasks);
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
      showToast("Task Deleted Successfully", "success");
    } catch (err) {
      setErrorMessage('Failed to delete task. Please try again.');
      console.error('Error deleting task:', err);
      showToast("Failed to delete task", "error");
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

  useEffect(() => {
    handleFetchTasks();
  }, [user?.id]);

  // Update local state when Redux state changes
  useEffect(() => {
    if (tasks) {
      const filteredTasks = tasks.filter(task => task.userId === user.id);
      setLocalTasks(filteredTasks);
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
          No assigned tasks available
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
        {/* Updated Header Section */}
        <View className="bg-white px-4 py-6 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-gray-800">My Tasks</Text>
              <View className="flex-row items-center mt-2">
                <FontAwesome5 name="clipboard-check" size={16} color="#0891b2" />
                <Text className="ml-2 text-gray-600">
                  {localTasks.length} Assigned {localTasks.length === 1 ? 'Task' : 'Tasks'}
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={onRefresh}
              className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
            >
              <FontAwesome5 name="sync-alt" size={16} color="#0891b2" />
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

      <TaskDialog
        visible={dialogVisible}
        task={selectedTask}
        onClose={() => {
          setDialogVisible(false);
          setSelectedTask(null);
        }}
        showEditButton={false}
      />
    </>
  );
};

export default TaskList;