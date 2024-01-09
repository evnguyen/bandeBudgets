import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoading: 0,
};

export const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    isLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { isLoading } = budgetSlice.actions;

export default budgetSlice.reducer;
