import type { RootState } from "@/app/providers/store";

export const selectCourses = (state: RootState) => state.courses.items;
