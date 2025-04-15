import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { AuthContext } from "../../src/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

const ProfileScreen = () => {
  const { user } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.image || null);
  const [formData, setFormData] = useState({
    name: user?.fullName || "",
    email: user?.email || "",
    contact: user?.contact || "",
    city: user?.city || "",
    address: user?.address || "",
    image: null,
  });

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  


  useEffect(() => {

    fetchUserData();
  }, [navigation]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.21:3000/api/users/getusersmobile?email=${formData.email}`
      );
      if (response.status === 200) {
        const updatedUser = response.data.user;

        // Update local state with fresh data
        setProfileImage(updatedUser.image || null);
        setFormData({
          fullName: updatedUser.fullName || "",
          email: updatedUser.email || "",
          address: updatedUser.address || "",
          city: updatedUser.city || "",
          contact: updatedUser.contact || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      setProfileImage(selectedImage.uri);
      setFormData((prev) => ({
        ...prev,
        image: {
          uri: selectedImage.uri,
          type: "image/jpeg",
          name: "profile.jpg",
        },
      }));
    }
  };

  const convertToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result); // Full Base64 string
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Base64 Conversion Error:", error);
      return null;
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      let base64Image = null;

      // Convert selected image to Base64 if updated
      if (profileImage && profileImage !== user.image) {
        base64Image = await convertToBase64(profileImage);
      }

      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        contact: formData.contact,
        image: base64Image || user.image,
      };

      const response = await axios.post(
        "http://192.168.1.21:3000/api/updateProfile",
        updateData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Profile updated successfully");
        setIsEditing(false);

        // Fetch updated user data immediately
        fetchUserData();
      } else {
        Alert.alert("Error", "Failed to update profile");
      }
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#F0F4F8", "#FFFFFF"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={isEditing ? pickImage : null}
            disabled={!isEditing}
            style={styles.avatarContainer}
          >
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("../../assets/pp.jpg")
              }
              style={[styles.avatar, isEditing && styles.avatarEditing]}
            />
            {isEditing && (
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(!isEditing)}
          >
            <Ionicons
              name={isEditing ? "close" : "pencil"}
              size={24}
              color={isEditing ? "red" : "black"}
            />
          </TouchableOpacity>
        </View>

        {/* Profile Fields */}
        <View style={styles.formContainer}>
          {!isEditing ? (
            <>
              <ProfileField
                icon="person-outline"
                label="Full Name"
                value={formData.fullName}
              />
              <ProfileField
                icon="mail-outline"
                label="Email"
                value={formData.email}
              />
              <ProfileField
                icon="call-outline"
                label="Contact"
                value={formData.contact}
              />
              <ProfileField
                icon="location-outline"
                label="City"
                value={formData.city}
              />

              <ProfileField
                icon="home-outline"
                label="Address"
                value={formData.address}
              />
            </>
          ) : (
            <>
              <EditInput
                icon="person-outline"
                placeholder="Full Name"
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />

              <EditInput
                icon="call-outline"
                placeholder="Contact Number"
                value={formData.contact}
                onChangeText={(text) =>
                  setFormData({ ...formData, contact: text })
                }
                keyboardType="phone-pad"
              />
              <EditInput
                icon="location-outline"
                placeholder="City"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
                keyboardType="default"
              />

              <EditInput
                icon="home-outline"
                placeholder="Address"
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
                keyboardType="default"
              />
            </>
          )}
        </View>

        {/* Save Button */}
        {isEditing && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleUpdate}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? "Updating..." : "Save Changes"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const ProfileField = ({ icon, label, value }) => (
  <View style={styles.profileFieldContainer}>
    <Ionicons
      name={icon}
      size={24}
      color="#4A90E2"
      style={styles.profileFieldIcon}
    />
    <View style={styles.profileFieldTextContainer}>
      <Text style={styles.profileFieldLabel}>{label}</Text>
      <Text style={styles.profileFieldValue}>{value || "Not provided"}</Text>
    </View>
  </View>
);

const EditInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
}) => (
  <View style={styles.editInputContainer}>
    <Ionicons
      name={icon}
      size={24}
      color="#4A90E2"
      style={styles.editInputIcon}
    />
    <View style={styles.editInputWrapper}>
      <Text style={styles.editInputPlaceholder}>{placeholder}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        style={styles.editInputField}
        placeholderTextColor="#A0AEC0"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#4A90E2",
  },
  avatarEditing: {
    opacity: 0.7,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#4A90E2",
    borderRadius: 20,
    padding: 8,
  },
  editButton: {
    position: "absolute",
    top: -10,
    right: -10,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 15,
  },
  profileFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 10,
    padding: 15,
    gap: 15,
  },
  profileFieldIcon: {
    marginRight: 10,
  },
  profileFieldTextContainer: {
    flex: 1,
  },
  profileFieldLabel: {
    color: "#718096",
    fontSize: 12,
    marginBottom: 5,
  },
  profileFieldValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
  },
  editInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    gap: 15,
  },
  editInputIcon: {
    marginRight: 10,
  },
  editInputWrapper: {
    flex: 1,
  },
  editInputPlaceholder: {
    color: "#A0AEC0",
    fontSize: 12,
    marginBottom: 5,
  },
  editInputField: {
    fontSize: 16,
    color: "#2D3748",
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: "#4A90E2",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;
