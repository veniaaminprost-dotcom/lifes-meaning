import type { RootState } from "@/app/providers/store";

export const selectInvitations = (state: RootState) => state.invitations.items;
