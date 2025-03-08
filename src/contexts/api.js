import axios from "axios";

const API_URL = "http://192.168.18.146:8000"; // Replace with your actual server IP

export const uploadImage = async (imageUri) => {
  try {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "image.jpg",
      type: "image/jpeg",
    });

    const response = await axios.post(`${API_URL}/detect_pipes/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; // Contains detection results
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};




