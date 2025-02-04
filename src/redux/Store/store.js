import { configureStore } from "@reduxjs/toolkit";
import fieldReducer from "../Slices/Fields";

const store = configureStore({
  reducer: {
    field: fieldReducer,
  },
});

export default store;
