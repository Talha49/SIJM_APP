import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the API base URL
const API_URL = "http://192.168.100.21:3000/api/New";

// Fetch tasks by user ID
export const fetchTasks = createAsyncThunk("field/fetchTasks", async (userId, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/GetTask/${userId}`);
    return response.data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
  }
});

// Delete task by task ID
export const deleteTask = createAsyncThunk("field/deleteTask", async (taskId, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/DeleteTask/${taskId}`);
    return taskId; // Return deleted task ID to update state
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete task");
  }
});

const fieldSlice = createSlice({
  name: "field",
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetFieldState: (state) => {
      state.tasks = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetFieldState } = fieldSlice.actions;
export default fieldSlice.reducer;
