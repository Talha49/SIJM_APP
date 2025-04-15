import React, { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { format, differenceInDays } from "date-fns";

import { AuthContext } from "../contexts/AuthContext";
import {
  fetchAssignedTasks,
  fetchTasks,
  resetFieldState,
} from "../redux/Slices/Fields";
import TaskDialog from "./TaskDialog";

const Home = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch();
  const { tasks } = useSelector((state) => state.field);
  const { assignedTasks } = useSelector((state) => state.field);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTasks(user.id));
      dispatch(fetchAssignedTasks());
    } else {
      dispatch(resetFieldState());
    }
  }, [user, dispatch]);

  const assignedTasksLength = useMemo(
    () =>
      assignedTasks.filter((task) =>
        task.assignees?.some((assignee) => assignee.name === user?.fullName)
      ),
    [assignedTasks, user]
  );

  const taskMetrics = useMemo(() => {
    const now = new Date();
    const completedTasks = tasks.filter((task) => task.status === "Completed");
    const pendingTasks = tasks.filter((task) => task.status === "Pending");
    const farDeadlineTasks = tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return differenceInDays(dueDate, now) >= 7;
    });

    return [
      { title: "Total Tasks", count: tasks.length, icon: "tasks" },
      {
        title: "Completed",
        count: completedTasks.length,
        icon: "check-circle",
      },
      {
        title: "Assigned",
        count: assignedTasksLength.length,
        icon: "briefcase",
      },
      { title: "Pending", count: pendingTasks.length, icon: "clock-o" },
      // { title: 'Future Tasks', count: farDeadlineTasks.length, icon: 'calendar' }
    ];
  }, [tasks, assignedTasksLength]);

  const displayTasks = useMemo(() => {
    const getHighPriorityTask = (status) => {
      return tasks
        .filter((task) => task.status === status)
        .sort((a, b) => {
          if (a.priority === "High" && b.priority !== "High") return -1;
          if (a.priority !== "High" && b.priority === "High") return 1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        })[0];
    };

    const priorityTasks = [
      getHighPriorityTask("Completed"),
      getHighPriorityTask("In Progress"),
      getHighPriorityTask("Pending"),
    ].filter(Boolean);

    return priorityTasks.slice(0, 3);
  }, [tasks]);

  const TaskPreview = ({ task }) => {
    const handleTaskPress = () => {
      setSelectedTask(task);
      setDialogVisible(true);
    };

    const getStatusColor = (status) => {
      switch (status) {
        case "Completed":
          return "text-green-500";
        case "Pending":
          return "text-yellow-500";
        case "In Progress":
          return "text-blue-500";
        default:
          return "text-gray-500";
      }
    };

    const calculateProgress = () => {
      return task.status === "Completed"
        ? 100
        : task.status === "Pending"
        ? 10
        : task.status === "In Progress"
        ? 50
        : 0;
    };

    return (
      <TouchableOpacity
        onPress={handleTaskPress}
        className="bg-white p-4 rounded-xl shadow mb-3"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-1 pr-4">
            <Text className="font-bold text-base">
              {task.description.substring(0, 30)}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-xs text-gray-500">
                Room: {task.room || "N/A"} • Floor: {task.floor || "N/A"}
              </Text>
              {task.priority === "High" && (
                <View className="ml-2 px-2 py-0.5 bg-red-100 rounded">
                  <Text className="text-xs text-red-600">High Priority</Text>
                </View>
              )}
            </View>
          </View>
          <Text className={`${getStatusColor(task.status)} font-medium`}>
            {task.status}
          </Text>
        </View>

        <View className="h-2 bg-gray-200 rounded-full mt-3">
          <View
            className={`h-full rounded-full ${
              task.status === "Completed"
                ? "bg-green-500"
                : task.status === "Pending"
                ? "bg-yellow-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${calculateProgress()}%` }}
          />
        </View>

        <View className="flex-row justify-between mt-2">
          <Text className="text-xs text-gray-500">
            Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
          </Text>
          {task.tags?.length > 0 && (
            <View className="flex-row">
              {task.tags.filter(Boolean).map((tag, index) => (
                <Text key={index} className="text-xs text-blue-500 ml-2">
                  #{tag}
                </Text>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const QuickActionButton = ({ icon, label, onPress }) => (
    <TouchableOpacity
      className="flex-1 bg-blue-500 p-4 rounded-lg mx-2 flex items-center justify-center"
      onPress={onPress}
    >
      <FontAwesome name={icon} size={24} color="white" />
      <Text className="text-white mt-2 font-medium">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="">
      <View className="bg-blue-600 px-6 pb-16 pt-0 rounded-b-3xl">
        <Text className="text-white text-2xl font-bold">Dashboard</Text>
        <Text className="text-blue-100 mt-2">
          Welcome back, {user?.fullName || "User"}!
        </Text>
      </View>

      <View className="flex-row flex-wrap p-4 -mt-16">
        {taskMetrics.map((metric, index) => (
          <View key={index} className="w-1/2 p-2">
            <View className="bg-white p-4 rounded-xl shadow">
              <FontAwesome name={metric.icon} size={24} color="#3B82F6" />
              <Text className="text-2xl font-bold mt-2">{metric.count}</Text>
              <Text className="text-gray-600">{metric.title}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* <View className="mx-4 mt-4 bg-white rounded-xl shadow p-4">
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
      </View> */}

      <View className="mx-4 mt-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold">Tasks List</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/Fields")}>
            <Text className="text-blue-500">View All</Text>
          </TouchableOpacity>
        </View>

        {user ? (
          displayTasks.length > 0 ? (
            displayTasks.map((task, index) => (
              <TaskPreview key={index} task={task} />
            ))
          ) : (
            <View className="flex-1 justify-center items-center bg-gray-50 p-4">
              <FontAwesome5 name="inbox" size={30} color="#ef4444" />
              <Text className="mt-4 text-gray-800 text-sm font-medium text-center">
                No tasks present
              </Text>
            </View>
          )
        ) : (
          <View className="flex-1 justify-center items-center bg-gray-50 p-4">
            <FontAwesome5 name="user-lock" size={30} color="#ef4444" />
            <Text className="mt-4 text-gray-800 text-sm font-medium text-center">
              You must be logged in to view tasks
            </Text>
          </View>
        )}
      </View>

      <View className="mx-4 mt-6 mb-4">
        <Text className="text-lg font-bold mb-4">Quick Actions</Text>
        <View className="flex-row">
          <QuickActionButton
            icon="plus"
            label="New Inspection"
            onPress={() => router.push("/screens/createtask")}
          />
          <QuickActionButton
            icon="briefcase" // Changed icon
            label="Assigned Tasks"
            onPress={() => router.push("/screens/assigned")}
          />
        </View>
      </View>

      <TaskDialog
        visible={dialogVisible}
        task={selectedTask}
        onClose={() => {
          setDialogVisible(false);
          setSelectedTask(null);
        }}
      />
    </ScrollView>
  );
};

export default Home;
