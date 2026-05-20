import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { LoginPage } from "@/pages/public/LoginPage";
import { RegisterPage } from "@/pages/public/RegisterPage";
import { ForgotPasswordPage } from "@/pages/public/ForgotPasswordPage";
import { ResetPasswordPage } from "@/pages/public/ResetPasswordPage";
import { InviteAcceptPage } from "@/pages/public/InviteAcceptPage";
import { CourseShowcasePage } from "@/pages/public/CourseShowcasePage";
import { CourseShowcaseDetailsPage } from "@/pages/public/CourseShowcaseDetailsPage";
import { NotFoundPage } from "@/pages/public/NotFoundPage";
import { StudentDashboardPage } from "@/pages/student/StudentDashboardPage";
import { StudentCoursePage } from "@/pages/student/StudentCoursePage";
import { StudentLessonPage } from "@/pages/student/StudentLessonPage";
import { TeacherDashboardPage } from "@/pages/teacher/TeacherDashboardPage";
import { TeacherCoursePage } from "@/pages/teacher/TeacherCoursePage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminCoursePage } from "@/pages/admin/AdminCoursePage";
import { EditorDashboardPage } from "@/pages/editor/EditorDashboardPage";
import { EditorCoursePage } from "@/pages/editor/EditorCoursePage";
import { DirectorDashboardPage } from "@/pages/director/DirectorDashboardPage";
import { DirectorCoursePage } from "@/pages/director/DirectorCoursePage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/student/login", element: <LoginPage /> },
  { path: "/teacher/login", element: <LoginPage /> },
  { path: "/editor/login", element: <LoginPage /> },
  { path: "/director/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/invite/:token", element: <InviteAcceptPage /> },
  { path: "/vitrina", element: <CourseShowcasePage /> },
  { path: "/vitrina/:slug", element: <CourseShowcaseDetailsPage /> },
  {
    element: <ProtectedRoute allowedRoles={["student"]} />,
    children: [
      { path: "/student", element: <StudentDashboardPage /> },
      { path: "/student/course/:id", element: <StudentCoursePage /> },
      { path: "/student/course/:id/lesson/:lessonId", element: <StudentLessonPage /> }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={["teacher"]} />,
    children: [
      { path: "/teacher", element: <TeacherDashboardPage /> },
      { path: "/teacher/course/:id", element: <TeacherCoursePage /> }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={["admin", "director"]} />,
    children: [
      { path: "/admin", element: <AdminDashboardPage /> },
      { path: "/admin/course/:id", element: <AdminCoursePage /> }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={["director", "admin"]} />,
    children: [
      { path: "/director", element: <DirectorDashboardPage /> },
      { path: "/director/course/:id", element: <DirectorCoursePage /> }
    ]
  },
  {
    element: <ProtectedRoute allowedRoles={["editor"]} />,
    children: [
      { path: "/editor", element: <EditorDashboardPage /> },
      { path: "/editor/course/:id", element: <EditorCoursePage /> }
    ]
  },
  { path: "*", element: <NotFoundPage /> }
]);
