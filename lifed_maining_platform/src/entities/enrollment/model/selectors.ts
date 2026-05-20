import type { RootState } from "@/app/providers/store";

export const selectEnrollments = (state: RootState) => state.enrollments.items;
