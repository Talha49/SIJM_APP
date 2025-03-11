import React, { useState, useRef } from "react";
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView, 
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
  Pressable
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { uploadImage } from "../contexts/api";
import { useToast } from "./customtoast";

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get("window");

// Sample reference images for each detection type
const REFERENCE_IMAGES = {
  pipes: require("../../assets/pipe.jpg"),
  rebar: require("../../assets/Rebar.jpg"),
  brick: require("../../assets/Brick.jpg"),
  beams: require("../../assets/All Beams.jpg"),
};

// Features for each detection type
const FEATURES = {
  pipes: ["PVC Pipes Detection", "Pipe Counting"],
  rebar: ["Iron Rod Detection", "Rebar Counting"],
  brick: ["Cement Block Detection", "Brick Detection"],
  beams: ["O Beam Detection", "Square Beam Detection", "T Beam Detection", "I Beam Detection", "Square Bar Detection"],
};

const DetectionComponent = ({ detectionType, title }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [detectedImage, setDetectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const scrollViewRef = useRef(null);
  const { showToast } = useToast();

  // Features for this specific detection type
  const features = FEATURES[detectionType] || [];
  
  // Reference image for this specific detection type
  const referenceImage = REFERENCE_IMAGES[detectionType];

  // Function to pick image from gallery
  const pickImage = async () => {
    try{
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showToast("Permission to access media library is required!", "error");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setImage(result.assets[0].uri);
        setResult(null);
        setDetectedImage(null);
      }
    }
    catch(error){
      showToast(`Failed to pick image: ${error.message}`, "error");

    }
   
  };
  // Function to capture image using camera
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showToast("Permission to access camera is required!", "error");
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      
      if (!result.canceled) {
        resetDetection(result.assets[0].uri);
        scrollViewRef.current?.scrollTo({ y: height * 0.25, animated: true });
      }
    } catch (error) {
      showToast(`Failed to take photo: ${error.message}`, "error");
    }
  };

  // Reset states and set new image
  const resetDetection = (imageUri) => {
    setImage(imageUri);
    setResult(null);
    setDetectedImage(null);
    setErrorMessage(null);
  };

  // Function to upload the image for detection
  const handleUpload = async () => {
    if (!image) {
      showToast("Please select an image first", "info");
      return;
    }
    
    setLoading(true);
    
    try {
      const data = await uploadImage(detectionType, image);
      
      if (data && data.error) {
        throw new Error(data.error);
      }
      
      if (data) {
        setResult(data);
        setDetectedImage(data.image_url);
        scrollViewRef.current?.scrollTo({ y: height * 0.6, animated: true });
        showToast(`Successfully detected ${data.total} objects`, "success");
      } else {
        throw new Error("Failed to process image. Please try again.");
      }
    } catch (error) {
      setErrorMessage(error.message);
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle the reference image modal
  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  // Get confidence color based on value
  const getConfidenceColor = (confidence) => {
    if (confidence > 0.85) return "#22c55e";
    if (confidence > 0.7) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with title and info button */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity onPress={toggleModal} style={styles.infoButton}>
          <FontAwesome5 name="info-circle" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features</Text>
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <FontAwesome5 name="check-circle" size={16} color="#22c55e" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Image Picker Buttons */}
      <View style={styles.buttonContainer}>
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.buttonGradient}
        >
          <TouchableOpacity onPress={takePhoto} style={styles.button}>
            <FontAwesome5 name="camera" size={20} color="#fff" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </LinearGradient>
        
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={styles.buttonGradient}
        >
          <TouchableOpacity onPress={pickImage} style={styles.button}>
            <FontAwesome5 name="images" size={20} color="#fff" />
            <Text style={styles.buttonText}>Choose Image</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Display Selected Image */}
      {image && (
        <View style={styles.imageContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
            style={styles.imageGradientBorder}
          >
            <Image source={{ uri: image }} style={styles.image} />
          </LinearGradient>
          
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.uploadButtonGradient}
          >
            <TouchableOpacity onPress={handleUpload} style={styles.uploadButton}>
              <FontAwesome5 name="cloud-upload-alt" size={18} color="#fff" style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>Process & Detect</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      )}

      {/* Display Detection Results */}
      {result && !loading && (
        <View style={styles.resultsContainer}>
          <LinearGradient
            colors={['#111111', '#1a1a1a']}
            style={styles.resultsGradient}
          >
            <View style={styles.resultsHeader}>
              <FontAwesome5 name="chart-bar" size={18} color="#3B82F6" />
              <Text style={styles.resultsTitle}>Detection Results</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total Detections:</Text>
              <View style={styles.resultValueContainer}>
                <Text style={styles.resultValue}>{result.total}</Text>
              </View>
            </View>
            
            {result.detections && result.detections.length > 0 && (
              <>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Best Match:</Text>
                  <View style={styles.resultValueContainer}>
                    <Text style={styles.resultValue}>
                      {result.detections.reduce((prev, curr) => 
                        (prev.confidence > curr.confidence ? prev : curr)).class}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Confidence:</Text>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill, 
                        { 
                          width: `${Math.max(...result.detections.map(d => d.confidence * 100))}%`,
                          backgroundColor: getConfidenceColor(Math.max(...result.detections.map(d => d.confidence)))
                        }
                      ]} 
                    />
                    <Text style={styles.confidenceText}>
                      {Math.max(...result.detections.map(d => d.confidence * 100)).toFixed(1)}%
                    </Text>
                  </View>
                </View>
                
                {result.average_confidence && (
                  <View style={styles.resultItem}>
                    <Text style={styles.resultLabel}>Avg. Confidence:</Text>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceFill, 
                          { 
                            width: `${result.average_confidence * 100}%`,
                            backgroundColor: getConfidenceColor(result.average_confidence)
                          }
                        ]} 
                      />
                      <Text style={styles.confidenceText}>
                        {(result.average_confidence * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </LinearGradient>
        </View>
      )}

      {/* Display Annotated Image */}
      {detectedImage && !loading && (
        <View style={styles.detectedImageContainer}>
          <Text style={styles.detectedImageTitle}>Detected Objects</Text>
          <LinearGradient
            colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
            style={styles.detectedImageGradient}
          >
            <Image 
              source={{ uri: detectedImage }} 
              style={styles.detectedImage}
              resizeMode="contain"
            />
          </LinearGradient>
        </View>
      )}

      {/* Reference Image Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={toggleModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Preferable Image for {title}
              </Text>
              <TouchableOpacity onPress={toggleModal}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {referenceImage ? (
              <Image source={referenceImage} style={styles.referenceImage} resizeMode="contain" />
            ) : (
              <Text style={styles.noReferenceText}>No reference image available</Text>
            )}
            
            <View style={styles.modalFeatures}>
              <Text style={styles.modalFeaturesTitle}>Detectable Objects:</Text>
              {features.map((feature, index) => (
                <View key={index} style={styles.modalFeatureItem}>
                  <FontAwesome5 name="dot-circle" size={12} color="#3B82F6" />
                  <Text style={styles.modalFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    flex: 1,
  },
  infoButton: {
    padding: 8,
  },
  featuresContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  featuresTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: "#e0e0e0",
    fontSize: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  button: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  imageGradientBorder: {
    padding: 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 14,
  },
  uploadButtonGradient: {
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
  },
  loadingText: {
    color: "#e0e0e0",
    marginTop: 12,
    fontSize: 16,
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 16,
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  resultsTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  resultItem: {
    marginBottom: 12,
  },
  resultLabel: {
    color: "#a0a0a0",
    fontSize: 15,
    marginBottom: 4,
  },
  resultValueContainer: {
    backgroundColor: "#2a2a2a",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  resultValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  confidenceBar: {
    height: 24,
    backgroundColor: "#2a2a2a",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  confidenceFill: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 12,
  },
  confidenceText: {
    position: "absolute",
    top: 0,
    right: 8,
    bottom: 0,
    color: "#fff",
    textAlignVertical: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  detectedImageContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  detectedImageTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  detectedImageGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 2,
  },
  detectedImage: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    width: "90%",
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  referenceImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  noReferenceText: {
    color: "#a0a0a0",
    textAlign: "center",
    marginVertical: 16,
  },
  modalFeatures: {
    marginTop: 8,
  },
  modalFeaturesTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 12,
  },
  modalFeatureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  modalFeatureText: {
    color: "#e0e0e0",
    fontSize: 14,
  },
});

export default DetectionComponent;