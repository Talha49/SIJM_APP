import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Plus } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { fetchVirtualTours } from "../../../src/redux/Slices/VtourSlice";
import { formatTimestamp } from "../../../vt";

export default function InspectionDetails() {
  const { id, inspetionName } = useLocalSearchParams();
  const { virtualTours, loading } = useSelector((state) => state.VTour);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(() => {
    return dispatch(fetchVirtualTours(id));
  }, [dispatch, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  };

  const renderHeader = () => (
    <View className="flex-row justify-between items-center gap-2 bg-blue-600 px-4 pb-6 shadow-lg">
      <View>
        <Text className="text-white text-2xl font-bold">{inspetionName}</Text>
        <Text className="text-blue-100 text-sm mt-1">
          {virtualTours?.length || 0} available virtual Tours
        </Text>
      </View>
      <TouchableOpacity activeOpacity={0.7} onPress={() => {}}>
        <View className="bg-white p-2 rounded-lg flex-row items-center gap-2">
          <Plus size={18} />
          <Text>Add New</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
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
            enabled={!loading}
          />
        }
      >
        {/* Loading indicator inside content, below header */}
        {loading && !refreshing && (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-blue-600 mt-4">Loading virtual tours...</Text>
          </View>
        )}

        {/* No data available */}
        {!loading && virtualTours?.length === 0 && (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 text-lg">
              No virtual tours available.
            </Text>
          </View>
        )}

        {/* Virtual tour list */}
        {!loading &&
          virtualTours?.map((tour) => (
            <TouchableOpacity
              key={tour._id}
              activeOpacity={0.7}
              className="mb-4 bg-white rounded-xl border border-gray-200 shadow"
              onPress={() => {}}
            >
              <View className="items-start">
                {/* Image */}
                <View className="relative w-full h-44 rounded-t-xl overflow-hidden">
                  <Image
                    source={{
                      uri: tour?.frames[0]?.url,
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <View className="w-full h-full rounded-t-xl bg-black/40 absolute top-0 flex p-4">
                    <Text className="text-neutral-100 text-lg">
                      {formatTimestamp(tour?.createdAt)}
                    </Text>
                  </View>
                </View>

                {/* Text content */}
                <View className="flex-1 p-4">
                  <Text className="text-lg font-semibold text-gray-900">
                    {tour.name || "Untitled Tour"}
                  </Text>
                  <Text
                    className="text-sm text-gray-600 mt-1"
                    numberOfLines={2}
                  >
                    {tour.description || "No description available."}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}
