import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createInspection,
  fetchInspections,
} from "../../src/redux/Slices/VtourSlice";
import { Plus } from "lucide-react-native";
import Modal from "react-native-modal";
import { TextInput } from "react-native";
import { useRouter } from "expo-router";

const VR = () => {
  const { inspections, loading, error } = useSelector((state) => state.VTour);
  const dispatch = useDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newInspectionData, setNewInspectionData] = useState({
    title: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const loadData = useCallback(() => {
    dispatch(fetchInspections());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchInspections()).finally(() => setRefreshing(false));
  };

  const validateForm = () => {
    let errors = {};
    if (!newInspectionData.title.trim()) errors.title = "Title is required.";
    if (!newInspectionData.description.trim())
      errors.description = "Description is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Function
  const createInspectionHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Stop submission if validation fails
    const res = await dispatch(createInspection(newInspectionData));
    if (res.payload._id) {
      alert("Inspection created successfully.");
      dispatch(fetchInspections()); // Refetch after creation
      setIsDialogOpen(false);
      setNewInspectionData({ title: "", description: "" });
    } else {
      alert("Failed to create inspection.");
    }
  };

  const renderHeader = () => (
    <View className="flex-row justify-between items-center gap-2 bg-blue-600 px-4 pt-0 pb-6 shadow-lg">
      <View>
        <Text className="text-white text-2xl font-bold">Site Inspections</Text>
        <Text className="text-blue-100 text-sm mt-1">
          {inspections?.length || 0} available inspections
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsDialogOpen(true)}
      >
        <View className="bg-white p-2 rounded-lg flex-row items-center gap-2">
          <Plus size={18} />
          <Text>Add New</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center p-8">
      <View className="bg-blue-50 rounded-full p-6">
        <Text className="text-blue-500 text-4xl">🏠</Text>
      </View>
      <Text className="text-gray-600 text-lg mt-4 text-center">
        No inspections available
      </Text>
      <Text className="text-gray-400 text-sm mt-2 text-center">
        Pull down to refresh
      </Text>
    </View>
  );

  const renderInspectionCard = (inspection, index) => (
    <TouchableOpacity
      key={inspection?.id || index}
      className="mb-6 bg-white border border-neutral-200 rounded-xl shadow overflow-hidden"
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: `/screens/InspectionDetails/${inspection._id}/?inspetionName=${inspection?.title}`,
        })
      }
    >
      <View className="p-4">
        <Text className="text-blue-600 text-xl font-bold">
          {inspection?.title || `Inspection ${index + 1}`}
        </Text>
        <Text>{inspection?.description || "No inspections"}</Text>

        <View className="flex-row mt-3 pt-3 justify-between border-t border-neutral-200">
          <View className="flex-row items-center">
            <View className="h-3 w-3 rounded-full bg-green-600 mr-2 animate-pulse" />
            <Text className="text-gray-600">Ready to view</Text>
          </View>

          <View className="bg-blue-600 px-4 py-1 rounded-full">
            <Text className="text-white font-medium">View Tour</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView className="flex-1 bg-white">
        {renderHeader()}

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            padding: 16,
            paddingTop: 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563eb"]}
              tintColor="#2563eb"
            />
          }
        >
          {loading ? (
            <View className="flex-1 justify-center items-center py-12">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-blue-600 mt-4">Loading inspections...</Text>
            </View>
          ) : inspections?.length > 0 ? (
            <View className="w-full">
              {inspections.map((inspection, i) =>
                renderInspectionCard(inspection, i)
              )}
            </View>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
        {isDialogOpen && (
          <View className="flex-1 w-full h-full z-50 p-4 bg-black/50 justify-center items-center absolute top-0">
            {/* The key here is to make sure this View takes up appropriate space */}
            <View className="bg-white rounded-2xl overflow-hidden w-full">
              {/* Header */}
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-bold text-center">
                  Create Inspection
                </Text>
              </View>

              {/* Form Content */}
              <View className="p-4">
                {/* Title Input */}
                <View className="mb-4">
                  <Text className="text-gray-700 font-medium mb-1">Title</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
                    placeholder="Enter inspection title"
                    value={newInspectionData.title}
                    onChangeText={(text) =>
                      setNewInspectionData({
                        ...newInspectionData,
                        title: text,
                      })
                    }
                  />
                  {formErrors.title && (
                    <Text className="text-red-500 text-sm mt-1">
                      {formErrors.title}
                    </Text>
                  )}
                </View>

                {/* Description Input */}
                <View className="mb-4">
                  <Text className="text-gray-700 font-medium mb-1">
                    Description
                  </Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-4 py-2 h-24 bg-white"
                    placeholder="Enter inspection details"
                    value={newInspectionData.description}
                    multiline
                    textAlignVertical="top"
                    onChangeText={(text) =>
                      setNewInspectionData({
                        ...newInspectionData,
                        description: text,
                      })
                    }
                  />
                  {formErrors.description && (
                    <Text className="text-red-500 text-sm mt-1">
                      {formErrors.description}
                    </Text>
                  )}
                </View>

                {/* Buttons */}
                <View className="flex-row gap-3 mt-2">
                  <TouchableOpacity
                    onPress={() => setIsDialogOpen(false)}
                    className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                  >
                    <Text className="font-medium">Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={createInspectionHandler}
                    className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <View>
                        <ActivityIndicator color={"#ffffff"} />
                      </View>
                    ) : (
                      <Text className="text-white font-medium">Create</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};

export default VR;
