import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Lesson } from "@/shared/types";

interface LessonsState {
  items: Lesson[];
}

const initialState: LessonsState = {
  items: []
};

const lessonsSlice = createSlice({
  name: "lessons",
  initialState,
  reducers: {
    setLessons(state, action: PayloadAction<Lesson[]>) {
      state.items = action.payload;
    }
  }
});

export const { setLessons } = lessonsSlice.actions;
export const lessonsReducer = lessonsSlice.reducer;
