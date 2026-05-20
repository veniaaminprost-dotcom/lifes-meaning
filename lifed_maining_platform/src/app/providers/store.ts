import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { sessionReducer } from "@/entities/auth/model/sessionSlice";
import { coursesReducer } from "@/entities/course/model/coursesSlice";
import { lessonsReducer } from "@/entities/lesson/model/lessonsSlice";
import { invitationsReducer } from "@/entities/invitation/model/invitationsSlice";
import { enrollmentsReducer } from "@/entities/enrollment/model/enrollmentsSlice";
import { submissionsReducer } from "@/entities/submission/model/submissionsSlice";
import { baseApi } from "@/shared/api/baseApi";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    courses: coursesReducer,
    lessons: lessonsReducer,
    invitations: invitationsReducer,
    enrollments: enrollmentsReducer,
    submissions: submissionsReducer,
    [baseApi.reducerPath]: baseApi.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware)
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
