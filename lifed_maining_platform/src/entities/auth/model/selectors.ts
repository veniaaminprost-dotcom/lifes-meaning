import type { RootState } from "@/app/providers/store";

export const selectSession = (state: RootState) => state.session.session;
export const selectRole = (state: RootState) => state.session.role;
export const selectIsInitialized = (state: RootState) => state.session.initialized;
export const selectUserId = (state: RootState) => state.session.session?.user.id ?? null;
