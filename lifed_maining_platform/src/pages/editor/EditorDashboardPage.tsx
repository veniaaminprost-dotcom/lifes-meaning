import { Button, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "sonner";
import { CreateCourseDialog } from "@/features/create-course/ui/CreateCourseDialog";
import { useCreateCourseMutation, useMyCoursesQuery } from "@/shared/api/baseApi";
import { PageShell } from "@/shared/ui/PageShell";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { CourseList } from "@/widgets/course-list/CourseList";

export const EditorDashboardPage = () => {
  const [open, setOpen] = useState(false);
  const { data: courses = [] } = useMyCoursesQuery();
  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const handleCreateCourse = async (values: { title: string; description: string }) => {
    try {
      await createCourse(values).unwrap();
      toast.success("Курс создан");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка создания курса";
      toast.error(message);
    }
  };

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Кабинет редактора</Typography>
            <Button variant="contained" onClick={() => setOpen(true)}>
              Новый курс
            </Button>
          </Stack>
          <Typography color="text.secondary">
            Редактор управляет контентом: курсы, видео, тексты уроков и обложки.
          </Typography>
          <CourseList courses={courses} role="editor" />
          <CreateCourseDialog open={open} onClose={() => setOpen(false)} onCreate={handleCreateCourse} loading={isLoading} />
        </Stack>
      </PageShell>
    </>
  );
};
