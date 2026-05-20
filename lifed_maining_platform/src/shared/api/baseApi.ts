import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import * as courseApi from "@/entities/course/api/courseApi";
import * as showcaseCourseApi from "@/entities/course/api/showcaseCourseApi";
import * as lessonApi from "@/entities/lesson/api/lessonApi";
import * as invitationApi from "@/entities/invitation/api/invitationApi";
import * as enrollmentApi from "@/entities/enrollment/api/enrollmentApi";
import * as submissionApi from "@/entities/submission/api/submissionApi";
import * as profileApi from "@/entities/profile/api/profileApi";
import * as mentorApi from "@/entities/mentor/api/mentorApi";
import * as quizApi from "@/entities/quiz/api/quizApi";
import * as lessonChatApi from "@/entities/lesson-chat/api/lessonChatApi";
import type { Course, Enrollment, Invitation, Lesson, LessonChatMessage, LessonQuiz, LessonQuizResult, LessonQuizSubmission, Profile, Submission, SubmissionStatus } from "@/shared/types";
import type { ShowcaseCourse } from "@/entities/course/api/showcaseCourseApi";
import type { MentorAssignment, MentorQuestion } from "@/shared/types";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fakeBaseQuery<Error>(),
  tagTypes: ["Profile", "Course", "Lesson", "Invitation", "Enrollment", "Submission", "MentorAssignment", "MentorQuestion", "LessonQuiz", "LessonChat"],
  endpoints: (builder) => ({
    myProfile: builder.query<Profile | null, void>({
      queryFn: async () => {
        try {
          return { data: await profileApi.getMyProfile() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["Profile"]
    }),
    myCourses: builder.query<Course[], void>({
      queryFn: async () => {
        try {
          return { data: await courseApi.fetchMyCourses() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["Course"]
    }),
    studentProfiles: builder.query<Profile[], void>({
      queryFn: async () => {
        try {
          return { data: await profileApi.fetchStudentProfiles() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["Profile"]
    }),
    teacherProfiles: builder.query<Profile[], void>({
      queryFn: async () => {
        try {
          return { data: await profileApi.fetchTeacherProfiles() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["Profile"]
    }),
    showcaseCourses: builder.query<ShowcaseCourse[], void>({
      queryFn: async () => {
        try {
          return { data: await showcaseCourseApi.fetchShowcaseCourses() };
        } catch (error) {
          return { error: error as Error };
        }
      }
    }),
    showcaseCourseBySlug: builder.query<ShowcaseCourse | null, string>({
      queryFn: async (slug) => {
        try {
          return { data: await showcaseCourseApi.fetchShowcaseCourseBySlug(slug) };
        } catch (error) {
          return { error: error as Error };
        }
      }
    }),
    createCourse: builder.mutation<Course, { title: string; description: string; cover?: string | null }>({
      queryFn: async (payload) => {
        try {
          return { data: await courseApi.createCourse(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Course"]
    }),
    updateCourse: builder.mutation<Course, { id: string; title?: string; description?: string; cover?: string | null; archivedAt?: string | null }>({
      queryFn: async ({ id, ...payload }) => {
        try {
          return { data: await courseApi.updateCourse(id, payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Course"]
    }),
    assignTeacher: builder.mutation<void, { courseId: string; teacherId: string }>({
      queryFn: async ({ courseId, teacherId }) => {
        try {
          await courseApi.assignTeacher(courseId, teacherId);
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      }
    }),
    lessonsByCourse: builder.query<Lesson[], string>({
      queryFn: async (courseId) => {
        try {
          return { data: await lessonApi.fetchLessonsByCourse(courseId) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["Lesson"]
    }),
    createLesson: builder.mutation<Lesson, Parameters<typeof lessonApi.createLesson>[0]>({
      queryFn: async (payload) => {
        try {
          return { data: await lessonApi.createLesson(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Lesson"]
    }),
    updateLesson: builder.mutation<
      Lesson,
      {
        id: string;
        title?: string;
        contentType?: Lesson["contentType"];
        textContent?: string | null;
        videoUrl?: string | null;
        published?: boolean;
      }
    >({
      queryFn: async ({ id, ...payload }) => {
        try {
          return { data: await lessonApi.updateLesson(id, payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Lesson"]
    }),
    lessonQuiz: builder.query<LessonQuiz | null, string>({
      queryFn: async (lessonId) => {
        try {
          return { data: await quizApi.fetchLessonQuiz(lessonId) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["LessonQuiz"]
    }),
    saveLessonQuiz: builder.mutation<LessonQuiz, { lessonId: string; items: LessonQuiz["items"] }>({
      queryFn: async ({ lessonId, items }) => {
        try {
          return { data: await quizApi.saveLessonQuiz(lessonId, items) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["LessonQuiz"]
    }),
    myLessonQuizSubmission: builder.query<LessonQuizSubmission | null, string>({
      queryFn: async (lessonId) => {
        try {
          return { data: await quizApi.fetchMyLessonQuizSubmission(lessonId) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["LessonQuiz"]
    }),
    submitLessonQuiz: builder.mutation<LessonQuizSubmission, { lessonId: string; answers: Record<string, string>; score: number; total: number }>({
      queryFn: async (payload) => {
        try {
          return { data: await quizApi.submitLessonQuiz(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["LessonQuiz"]
    }),
    quizResults: builder.query<LessonQuizResult[], string | void>({
      queryFn: async (courseId) => {
        try {
          return { data: await quizApi.fetchLessonQuizResults(courseId || undefined) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["LessonQuiz"]
    }),
    invitationsByCourse: builder.query<Invitation[], string>({
      queryFn: async (courseId) => {
        try {
          return { data: await invitationApi.fetchInvitationsByCourse(courseId) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["Invitation"]
    }),
    createInvitation: builder.mutation<Invitation, { courseId: string; expiresAt?: string | null; maxUses?: number | null }>({
      queryFn: async (payload) => {
        try {
          return { data: await invitationApi.createInvitation(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Invitation"]
    }),
    acceptInvitation: builder.mutation<unknown, string>({
      queryFn: async (token) => {
        try {
          return { data: await invitationApi.acceptInvitation(token) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Course", "Enrollment"]
    }),
    myEnrollments: builder.query<Enrollment[], void>({
      queryFn: async () => {
        try {
          return { data: await enrollmentApi.fetchMyEnrollments() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["Enrollment"]
    }),
    enrollInCourse: builder.mutation<Enrollment, string>({
      queryFn: async (courseId) => {
        try {
          return { data: await enrollmentApi.enrollInCourse(courseId) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Course", "Enrollment"]
    }),
    submissionsByCourse: builder.query<Submission[], string>({
      queryFn: async (courseId) => {
        try {
          return { data: await submissionApi.fetchSubmissionsByCourse(courseId) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["Submission"]
    }),
    createSubmission: builder.mutation<Submission, Parameters<typeof submissionApi.createSubmission>[0]>({
      queryFn: async (payload) => {
        try {
          return { data: await submissionApi.createSubmission(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Submission"]
    }),
    reviewSubmission: builder.mutation<Submission, { id: string; status: SubmissionStatus; teacherComment: string | null }>({
      queryFn: async (payload) => {
        try {
          return { data: await submissionApi.reviewSubmission(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["Submission"]
    }),
    myMentorAssignment: builder.query<MentorAssignment | null, void>({
      queryFn: async () => {
        try {
          return { data: await mentorApi.getMyMentorAssignment() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["MentorAssignment"]
    }),
    myMentorProfile: builder.query<Profile | null, void>({
      queryFn: async () => {
        try {
          return { data: await mentorApi.getMentorProfileByStudent() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["MentorAssignment", "Profile"]
    }),
    myAssignedStudents: builder.query<Profile[], void>({
      queryFn: async () => {
        try {
          return { data: await mentorApi.fetchMyAssignedStudents() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["MentorAssignment", "Profile"]
    }),
    mentorAssignments: builder.query<MentorAssignment[], void>({
      queryFn: async () => {
        try {
          return { data: await mentorApi.fetchMentorAssignments() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["MentorAssignment"]
    }),
    upsertMentorAssignment: builder.mutation<MentorAssignment, { studentId: string; mentorId: string; assignmentMode?: "manual" | "auto" }>({
      queryFn: async (payload) => {
        try {
          return { data: await mentorApi.upsertMentorAssignment(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["MentorAssignment"]
    }),
    mentorDistributionSettings: builder.query<{ enabled: boolean; preferGender: boolean }, void>({
      queryFn: async () => {
        try {
          return { data: await mentorApi.getMentorDistributionSettings() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["MentorAssignment"]
    }),
    updateMentorDistributionSettings: builder.mutation<void, { enabled: boolean; preferGender: boolean }>({
      queryFn: async (payload) => {
        try {
          await mentorApi.updateMentorDistributionSettings(payload);
          return { data: undefined };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["MentorAssignment"]
    }),
    myMentorQuestions: builder.query<MentorQuestion[], void>({
      queryFn: async () => {
        try {
          return { data: await mentorApi.fetchMyMentorQuestions() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["MentorQuestion"]
    }),
    mentorQuestions: builder.query<MentorQuestion[], void>({
      queryFn: async () => {
        try {
          return { data: await mentorApi.fetchMentorQuestions() };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["MentorQuestion"]
    }),
    createMentorQuestion: builder.mutation<MentorQuestion, { courseId?: string | null; lessonId?: string | null; questionText: string }>({
      queryFn: async (payload) => {
        try {
          return { data: await mentorApi.createMentorQuestion(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["MentorQuestion"]
    }),
    answerMentorQuestion: builder.mutation<MentorQuestion, { id: string; answerText: string }>({
      queryFn: async ({ id, answerText }) => {
        try {
          return { data: await mentorApi.answerMentorQuestion(id, answerText) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["MentorQuestion"]
    }),
    lessonChatMessages: builder.query<LessonChatMessage[], { lessonId: string; studentId?: string | null }>({
      queryFn: async (payload) => {
        try {
          return { data: await lessonChatApi.fetchLessonChatMessages(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      providesTags: ["LessonChat"]
    }),
    sendLessonChatMessage: builder.mutation<
      LessonChatMessage,
      { lessonId: string; courseId: string; studentId: string; mentorId: string; messageText: string }
    >({
      queryFn: async (payload) => {
        try {
          return { data: await lessonChatApi.sendLessonChatMessage(payload) };
        } catch (error) {
          return { error: error as Error };
        }
      },
      invalidatesTags: ["LessonChat"]
    })
  })
});

export const {
  useMyProfileQuery,
  useMyCoursesQuery,
  useStudentProfilesQuery,
  useTeacherProfilesQuery,
  useShowcaseCoursesQuery,
  useShowcaseCourseBySlugQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useAssignTeacherMutation,
  useLessonsByCourseQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useLessonQuizQuery,
  useSaveLessonQuizMutation,
  useMyLessonQuizSubmissionQuery,
  useSubmitLessonQuizMutation,
  useQuizResultsQuery,
  useInvitationsByCourseQuery,
  useCreateInvitationMutation,
  useAcceptInvitationMutation,
  useMyEnrollmentsQuery,
  useEnrollInCourseMutation,
  useSubmissionsByCourseQuery,
  useCreateSubmissionMutation,
  useReviewSubmissionMutation,
  useMyMentorAssignmentQuery,
  useMyMentorProfileQuery,
  useMyAssignedStudentsQuery,
  useMentorAssignmentsQuery,
  useUpsertMentorAssignmentMutation,
  useMentorDistributionSettingsQuery,
  useUpdateMentorDistributionSettingsMutation,
  useMyMentorQuestionsQuery,
  useMentorQuestionsQuery,
  useCreateMentorQuestionMutation,
  useAnswerMentorQuestionMutation,
  useLessonChatMessagesQuery,
  useSendLessonChatMessageMutation
} = baseApi;
