import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

export const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    user: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { user } = budgetSlice.actions;

export const getUser = (state) => state.user;

export default budgetSlice.reducer;
