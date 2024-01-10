import { configureStore } from "@reduxjs/toolkit";
import budgetSlice from "./budget/budgetSlice";

export const store = configureStore({
  reducer: budgetSlice,
});
