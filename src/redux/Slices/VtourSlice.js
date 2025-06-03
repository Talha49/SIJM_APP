import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const basePath = "http://192.168.201.142:3000/api";

export const createInspection = createAsyncThunk(
  "/api/inspection/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(`${basePath}/inspection/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create inspection");
      }
      const resData = await response.json();
      return resData.newInspection;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchInspections = createAsyncThunk(
  "/api/inspection/get",
  async () => {
    try {
      const response = await fetch(`${basePath}/inspection/get`);
      if (!response.ok) {
        throw new Error("Failed to fetch inspections");
      }
      const resData = await response.json();
      return resData.inspections;
    } catch (error) {
      throw new Error(error.message);
    }
  }
);

export const fetchVirtualTours = createAsyncThunk(
  "/api/v-tour/get/[id]",
  async (id, { rejectWithValue }) => {
    try {
      const virtualTours = await fetch(`${basePath}/v-tour/get/${id}`, {
        method: "GET",
      });
      if (!virtualTours.ok) {
        throw new Error("Failed to fetch virtual tours");
      }
      const resData = await virtualTours.json();
      console.log(resData);
      return resData.virtualTours;
    } catch (error) {
      rejectWithValue(error.message);
    }
  }
);

const vTourSlice = createSlice({
  name: "VTourSlice",
  initialState: {
    inspections: [],
    virtualTours: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createInspection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInspection.fulfilled, (state, action) => {
        state.loading = false;
        state.inspections.push(action.payload);
      })
      .addCase(createInspection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInspections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInspections.fulfilled, (state, action) => {
        state.loading = false;
        state.inspections = action.payload;
      })
      .addCase(fetchInspections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVirtualTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVirtualTours.fulfilled, (state, action) => {
        state.loading = false;
        state.virtualTours = action.payload;
      })
      .addCase(fetchVirtualTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default vTourSlice.reducer;
