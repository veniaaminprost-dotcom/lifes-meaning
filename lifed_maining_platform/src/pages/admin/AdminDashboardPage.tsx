import { Alert, Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "sonner";
import { CreateCourseDialog } from "@/features/create-course/ui/CreateCourseDialog";
import { useCreateCourseMutation, useCreateLessonMutation, useMyCoursesQuery, useStudentProfilesQuery } from "@/shared/api/baseApi";
import { PageShell } from "@/shared/ui/PageShell";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { CourseList } from "@/widgets/course-list/CourseList";
import { DEFAULT_VIDEO_URL, LANDING_COURSES } from "@/shared/config/landingCatalog";
import { StudentReligionGroups } from "@/widgets/student-groups/StudentReligionGroups";

export const AdminDashboardPage = () => {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const { data: courses = [] } = useMyCoursesQuery();
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useStudentProfilesQuery();
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const [createLesson] = useCreateLessonMutation();

  const handleCreateCourse = async (values: { title: string; description: string }) => {
    try {
      await createCourse(values).unwrap();
      toast.success("Курс создан");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка создания курса";
      toast.error(message);
    }
  };

  const handleImportLandingCourses = async () => {
    try {
      setImporting(true);
      const existingTitles = new Set(courses.map((course) => course.title.trim().toLowerCase()));
      let createdCourses = 0;
      let createdLessons = 0;

      for (const seedCourse of LANDING_COURSES) {
        if (existingTitles.has(seedCourse.title.trim().toLowerCase())) {
          continue;
        }

        const createdCourse = await createCourse({
          title: seedCourse.title,
          description: seedCourse.description
        }).unwrap();
        createdCourses += 1;

        for (let index = 0; index < seedCourse.lessons.length; index += 1) {
          const lessonTitle = seedCourse.lessons[index];
          await createLesson({
            courseId: createdCourse.id,
            title: lessonTitle,
            contentType: "video",
            textContent: `Видео-урок курса «${seedCourse.title}».`,
            videoUrl: DEFAULT_VIDEO_URL,
            orderIndex: index + 1,
            published: true
          }).unwrap();
          createdLessons += 1;
        }
      }

      if (!createdCourses) {
        toast.info("Курсы из лендинга уже добавлены");
        return;
      }

      toast.success(`Импорт завершён: ${createdCourses} курсов и ${createdLessons} уроков`);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка импорта курсов";
      toast.error(message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Панель администратора</Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" onClick={handleImportLandingCourses} disabled={importing || isLoading}>
                Импортировать курсы с лендинга
              </Button>
              <Button variant="contained" onClick={() => setOpen(true)}>
                Новый курс
              </Button>
            </Stack>
          </Stack>
          <CourseList courses={courses} role="admin" />
          {studentsError && <Alert severity="error">Не удалось загрузить группы студентов.</Alert>}
          {studentsLoading ? (
            <Typography color="text.secondary">Загрузка сегментации студентов...</Typography>
          ) : (
            <StudentReligionGroups students={students} />
          )}
          <CreateCourseDialog open={open} onClose={() => setOpen(false)} onCreate={handleCreateCourse} loading={isLoading} />
        </Stack>
      </PageShell>
    </>
  );
};
