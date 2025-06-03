import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { ArrowRight, Plus, SlidersHorizontal, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { fetchVirtualTours } from "../../../src/redux/Slices/VtourSlice";
import { formatTimestamp } from "../../../vt";

export default function InspectionDetails() {
  const { id, inspetionName } = useLocalSearchParams();
  const { virtualTours, loading } = useSelector((state) => state.VTour);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTours, setFilteredTours] = useState([]);
  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [isOpenFilterDialog, setIsOpenFilterDialog] = useState(false);

  const isDateInRange = (date) => {
    const tourDate = new Date(date);
    const today = new Date();

    if (isCustomDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        return tourDate >= start && tourDate <= end;
      }
      return true;
    }

    switch (dateRange) {
      case "today":
        return tourDate.toDateString() === today.toDateString();
      case "week":
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tourDate >= lastWeek;
      case "month":
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          today.getDate()
        );
        return tourDate >= lastMonth;
      case "year":
        const lastYear = new Date(
          today.getFullYear() - 1,
          today.getMonth(),
          today.getDate()
        );
        return tourDate >= lastYear;
      default:
        return true;
    }
  };

  const openApp = async () => {
    const packageName = "com.mycompany.myapp"; // ← Replace this with your actual package name
    const intentURL = `intent://#Intent;package=${packageName};end`;

    const canOpen = await Linking.canOpenURL(intentURL);
    if (canOpen) {
      Linking.openURL(intentURL);
    } else {
      alert("App is not installed.");
    }
  };

  const loadData = useCallback(() => {
    return dispatch(fetchVirtualTours(id));
  }, [dispatch, id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Filter tours based on search query and date range
    const filteredVTs = virtualTours.filter((tour) => {
      const matchesSearch = tour.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesDate = isDateInRange(tour.createdAt);
      return matchesSearch && matchesDate;
    });
    setFilteredTours(filteredVTs);
  }, [virtualTours, searchQuery, dateRange, startDate, endDate, isCustomDate]);

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
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsDialogOpen(true)}
      >
        {/* <View className="bg-white p-2 rounded-lg flex-row items-center gap-2">
          <Plus size={18} />
          <Text>Add New</Text>
        </View> */}
      </TouchableOpacity>
    </View>
  );

  const handleApplyFilters = () => {
    // Filters are automatically applied through the useEffect that watches filter states
    setIsOpenFilterDialog(false);
  };

  const handleResetFilters = () => {
    setDateRange("all");
    setIsCustomDate(false);
    setStartDate("");
    setEndDate("");
    setIsOpenFilterDialog(false);
  };

  const renderFilterOption = (label, value) => (
    <TouchableOpacity
      onPress={() => {
        setDateRange(value);
        setIsCustomDate(false);
      }}
      className={`py-3 px-4 rounded-lg mb-2 ${
        dateRange === value && !isCustomDate
          ? "bg-blue-100 border border-blue-400"
          : "bg-gray-100"
      }`}
    >
      <Text
        className={`${
          dateRange === value && !isCustomDate
            ? "text-blue-700"
            : "text-gray-800"
        } font-medium`}
      >
        {label}
      </Text>
    </TouchableOpacity>
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

        <View className="flex-row items-center gap-3 mb-6">
          {/* Search Input */}
          <TextInput
            placeholder="Search..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            className="flex-1 h-12 px-4 bg-white border border-neutral-300 rounded-xl text-base"
            placeholderTextColor="#999"
          />

          {/* Filter Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsOpenFilterDialog(true)}
            className="h-12 w-12 bg-blue-600 rounded-xl items-center justify-center"
          >
            <SlidersHorizontal size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Active filters indicator */}
        {(dateRange !== "all" || isCustomDate) && (
          <View className="mb-4 flex-row flex-wrap">
            <View className="bg-blue-100 px-3 py-2 rounded-lg flex-row items-center mr-2 mb-2">
              <Text className="text-blue-700 mr-2">
                {isCustomDate
                  ? `Custom: ${startDate} - ${endDate}`
                  : dateRange === "today"
                  ? "Today"
                  : dateRange === "week"
                  ? "Last 7 days"
                  : dateRange === "month"
                  ? "Last 30 days"
                  : "Last Year"}
              </Text>
              <TouchableOpacity onPress={handleResetFilters}>
                <X size={16} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!loading && filteredTours.length === 0 && (
          <Text className="text-gray-500 text-lg">No Virtual tour Found.</Text>
        )}

        {/* Virtual tour list */}
        {!loading &&
          filteredTours?.map((tour) => (
            <TouchableOpacity
              key={tour._id}
              activeOpacity={0.7}
              className="mb-4 bg-white rounded-xl border border-gray-200 shadow"
              onPress={() => {
                alert("Screen is too small. Explore it on web");
              }}
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
                  <View className="w-full h-full rounded-t-xl bg-black/40 absolute top-0 flex items-center justify-center">
                    <Text className="text-neutral-100 text-lg">
                      {formatTimestamp(tour?.createdAt)}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-1 bg-blue-600 p-2 rounded-lg">
                      <Text className="text-neutral-100">Explore</Text>
                      <ArrowRight size={18} color={"#ffffff"} />
                    </View>
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
      {/* Add Virtual Tour Modal */}
      {isDialogOpen && (
        <View className="flex-1 w-full h-full z-50 p-4 bg-black/50 justify-center items-center absolute top-0">
          {/* The key here is to make sure this View takes up appropriate space */}
          <View className="bg-white rounded-2xl overflow-hidden w-full min-h-32">
            {/* Header */}
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-center">
                Create Virtual Tour
              </Text>
            </View>

            {/* Form Content */}
            <View></View>

            {/* Buttons */}
            <View className="flex-row gap-3 mt-2 p-4">
              <TouchableOpacity
                onPress={() => setIsDialogOpen(false)}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="font-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                // onPress={createInspectionHandler}
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
      )}
      {/* Filters Modal */}
      {isOpenFilterDialog && (
        <View className="flex-1 w-full h-full z-50 p-4 bg-black/50 justify-center items-center absolute top-0">
          <View className="bg-white rounded-2xl overflow-hidden w-full max-h-96">
            {/* Header */}
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold">Filters</Text>
              <Text className="text-gray-500 text-sm mt-1">
                Filter virtual tours by date
              </Text>
            </View>

            {/* Filter Content */}
            <ScrollView className="max-h-64 p-4 mb-2">
              <Text className="font-medium text-gray-700 mb-2">Date Range</Text>

              {renderFilterOption("All Time", "all")}
              {renderFilterOption("Today", "today")}
              {renderFilterOption("Last 7 Days", "week")}
              {renderFilterOption("Last 30 Days", "month")}
              {renderFilterOption("Last Year", "year")}

              {/* Custom Date Range */}
              <TouchableOpacity
                onPress={() => {
                  setIsCustomDate(true);
                  setDateRange("custom");
                }}
                className={`py-3 px-4 rounded-lg mb-4 ${
                  isCustomDate
                    ? "bg-blue-100 border border-blue-400"
                    : "bg-gray-100"
                }`}
              >
                <Text
                  className={`${
                    isCustomDate ? "text-blue-700" : "text-gray-800"
                  } font-medium mb-1`}
                >
                  Custom Date Range
                </Text>

                {isCustomDate && (
                  <View className="mt-3 space-y-3">
                    <View>
                      <Text className="text-gray-600 mb-1">Start Date</Text>
                      <TextInput
                        value={startDate}
                        onChangeText={setStartDate}
                        placeholder="YYYY-MM-DD"
                        className="bg-white border border-gray-300 rounded-lg p-2"
                      />
                    </View>

                    <View>
                      <Text className="text-gray-600 mb-1">End Date</Text>
                      <TextInput
                        value={endDate}
                        onChangeText={setEndDate}
                        placeholder="YYYY-MM-DD"
                        className="bg-white border border-gray-300 rounded-lg p-2"
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>

            {/* Buttons */}
            <View className="flex-row gap-3 p-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={handleResetFilters}
                className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
              >
                <Text className="font-medium">Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApplyFilters}
                className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
              >
                <Text className="text-white font-medium">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
