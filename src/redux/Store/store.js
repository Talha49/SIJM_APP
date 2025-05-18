import { configureStore } from "@reduxjs/toolkit";
import fieldReducer from "../Slices/Fields";
import vTourReducer from "../Slices/VtourSlice"

const store = configureStore({
  reducer: {
    field: fieldReducer,
    VTour: vTourReducer
  },
});

export default store;
