import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Submission } from "@/shared/types";

interface SubmissionsState {
  items: Submission[];
}

const initialState: SubmissionsState = {
  items: []
};

const submissionsSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    setSubmissions(state, action: PayloadAction<Submission[]>) {
      state.items = action.payload;
    }
  }
});

export const { setSubmissions } = submissionsSlice.actions;
export const submissionsReducer = submissionsSlice.reducer;
