import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session } from "@supabase/supabase-js";
import type { UserRole } from "@/shared/types";

interface SessionState {
  session: Session | null;
  role: UserRole | null;
  initialized: boolean;
}

const initialState: SessionState = {
  session: null,
  role: null,
  initialized: false
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Session | null>) {
      state.session = action.payload;
      state.initialized = true;
    },
    setRole(state, action: PayloadAction<UserRole | null>) {
      state.role = action.payload;
    },
    signOutState(state) {
      state.session = null;
      state.role = null;
      state.initialized = true;
    }
  }
});

export const { setSession, setRole, signOutState } = sessionSlice.actions;
export const sessionReducer = sessionSlice.reducer;
