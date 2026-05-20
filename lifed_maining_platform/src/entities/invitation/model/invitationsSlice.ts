import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Invitation } from "@/shared/types";

interface InvitationsState {
  items: Invitation[];
}

const initialState: InvitationsState = {
  items: []
};

const invitationsSlice = createSlice({
  name: "invitations",
  initialState,
  reducers: {
    setInvitations(state, action: PayloadAction<Invitation[]>) {
      state.items = action.payload;
    }
  }
});

export const { setInvitations } = invitationsSlice.actions;
export const invitationsReducer = invitationsSlice.reducer;
