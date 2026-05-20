import type { RootState } from "@/app/providers/store";

export const selectLessons = (state: RootState) => state.lessons.items;
