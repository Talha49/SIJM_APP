import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useRouter } from 'expo-router';

const metrics = [
  { title: 'Total Tasks', count: 48, icon: 'tasks' },
  { title: 'Completed', count: 32, icon: 'check-circle' },
  { title: 'Pending', count: 16, icon: 'clock-o' },
  { title: 'Locations', count: 8, icon: 'map-marker' }
];

const tasks = [
  { title: 'Site Inspection - Block A', status: 'In Progress', progress: 75 },
  { title: 'Safety Audit - Zone 2', status: 'Completed', progress: 100 },
  { title: 'Equipment Check', status: 'Overdue', progress: 30 }
];

const QuickActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity 
    className="flex-1 bg-blue-500 p-4 rounded-lg mx-2 flex items-center justify-center"
    onPress={onPress} // Add onPress prop
  >
    <FontAwesome name={icon} size={24} color="white" />
    <Text className="text-white mt-2 font-medium">{label}</Text>
  </TouchableOpacity>
);

const Home = () => {
  const navigation = useNavigation(); // Initialize navigation
  const router = useRouter();
  const handleNewTaskPress = () => {
    // Navigate to the "Task" tab
    // navigation.navigate('Task');
    router.push('/screens/createtask');
  };

  return (
    <ScrollView className="bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 p-6 rounded-b-3xl">
        <Text className="text-white text-2xl font-bold">Dashboard</Text>
        <Text className="text-blue-100 mt-2">Welcome back, Site Manager</Text>
      </View>

      {/* Metrics Overview */}
      <View className="flex-row flex-wrap p-4 -mt-8">
        {metrics.map((metric, index) => (
          <View key={index} className="w-1/2 p-2">
            <View className="bg-white p-4 rounded-xl shadow">
              <FontAwesome name={metric.icon} size={24} color="#3B82F6" />
              <Text className="text-2xl font-bold mt-2">{metric.count}</Text>
              <Text className="text-gray-600">{metric.title}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Live Monitoring */}
      <View className="mx-4 mt-4 bg-white rounded-xl shadow p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold">Live Monitoring</Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            <Text className="text-green-500">Live</Text>
          </View>
        </View>
        <View className="bg-gray-100 h-40 rounded-lg items-center justify-center">
          <FontAwesome name="video-camera" size={40} color="#94A3B8" />
          <TouchableOpacity className="mt-4 bg-blue-500 px-6 py-2 rounded-full">
            <Text className="text-white font-medium">View Live Feed</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tasks Preview */}
      <View className="mx-4 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold">Recent Tasks</Text>
          <TouchableOpacity>
            <Text className="text-blue-500">View All</Text>
          </TouchableOpacity>
        </View>
        {tasks.map((task, index) => (
          <View key={index} className="bg-white p-4 rounded-xl shadow mb-3">
            <View className="flex-row justify-between items-center">
              <Text className="font-medium">{task.title}</Text>
              <Text className={
                task.status === 'Completed' ? 'text-green-500' :
                task.status === 'Overdue' ? 'text-red-500' :
                'text-yellow-500'
              }>{task.status}</Text>
            </View>
            <View className="h-2 bg-gray-200 rounded-full mt-3">
              <View 
                className={`h-full rounded-full ${
                  task.status === 'Completed' ? 'bg-green-500' :
                  task.status === 'Overdue' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`}
                style={{ width: `${task.progress}%` }}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View className="mx-4 mt-6 mb-4">
        <Text className="text-lg font-bold mb-4">Quick Actions</Text>
        <View className="flex-row">
          <QuickActionButton 
            icon="plus" 
            label="New Isnpection" 
            onPress={handleNewTaskPress} // Pass the navigation function
          />
         
          <QuickActionButton icon="cog" label="Settings" />
        </View>
      </View>

      {/* Footer */}
      <View className="bg-gray-100 p-6 mt-6">
        <View className="flex-row justify-around">
          <TouchableOpacity>
            <Text className="text-gray-600">About</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-gray-600">Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-gray-600">Privacy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;