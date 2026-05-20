import type { RootState } from "@/app/providers/store";

export const selectSubmissions = (state: RootState) => state.submissions.items;
