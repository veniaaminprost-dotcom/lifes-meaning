import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Enrollment } from "@/shared/types";

interface EnrollmentsState {
  items: Enrollment[];
}

const initialState: EnrollmentsState = {
  items: []
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    setEnrollments(state, action: PayloadAction<Enrollment[]>) {
      state.items = action.payload;
    }
  }
});

export const { setEnrollments } = enrollmentsSlice.actions;
export const enrollmentsReducer = enrollmentsSlice.reducer;
