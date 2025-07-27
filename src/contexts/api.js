// contexts/api.js
import axios from "axios";
import { manipulateAsync } from 'expo-image-manipulator';

const API_URL = "http://192.168.8.49:8000"; // Your server IP

/**
 * Uploads and processes an image for object detection
 * 
 * @param {string} detectionType - Type of detection (pipes, rebar, brick, beams)
 * @param {string} imageUri - Local URI of the image to upload
 * @returns {Promise<Object>} Detection results or error
 */
export const uploadImage = async (detectionType, imageUri) => {
  try {
    // Resize and compress the image to improve upload speed
    const manipulatedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }],
      { compress: 0.8, format: 'jpeg' }
    );
    
    // Create form data for the image upload
    const formData = new FormData();
    formData.append("file", {
      uri: manipulatedImage.uri,
      name: "image.jpg",
      type: "image/jpeg",
    });
    
    // Send the request to the API using axios
    const response = await axios.post(
      `${API_URL}/detect/${detectionType}/`, 
      formData, 
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000 // 30 second timeout
      }
    );
    
    return response.data; // Contains detection results
  } catch (error) {
    console.error("Error uploading image:", error);
    
    // Handle different types of errors
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      return { 
        error: error.response.data.error || `Server error: ${error.response.status}` 
      };
    } else if (error.request) {
      // The request was made but no response was received
      return { 
        error: "No response from server. Please check your connection." 
      };
    } else {
      // Something happened in setting up the request
      return { 
        error: error.message || "Failed to process the image. Please try again." 
      };
    }
  }
};