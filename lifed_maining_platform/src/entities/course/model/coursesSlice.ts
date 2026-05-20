import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Course } from "@/shared/types";

interface CoursesState {
  items: Course[];
}

const initialState: CoursesState = {
  items: []
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourses(state, action: PayloadAction<Course[]>) {
      state.items = action.payload;
    }
  }
});

export const { setCourses } = coursesSlice.actions;
export const coursesReducer = coursesSlice.reducer;
