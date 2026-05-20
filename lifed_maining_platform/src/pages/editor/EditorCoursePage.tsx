import { Button, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { PageShell } from "@/shared/ui/PageShell";
import { LessonEditor } from "@/widgets/lesson-editor/LessonEditor";
import { useCreateLessonMutation, useLessonsByCourseQuery, useMyCoursesQuery, useUpdateCourseMutation, useUpdateLessonMutation } from "@/shared/api/baseApi";
import type { LessonFormValues } from "@/features/lesson-edit/ui/LessonForm";
import { uploadCourseVideo } from "@/shared/api/storageApi";
import { LessonQuizEditor } from "@/widgets/quiz-editor/LessonQuizEditor";

export const EditorCoursePage = () => {
  const { id = "" } = useParams();
  const { data: lessons = [] } = useLessonsByCourseQuery(id, { skip: !id });
  const { data: courses = [] } = useMyCoursesQuery();
  const course = useMemo(() => courses.find((item) => item.id === id) ?? null, [courses, id]);
  const [createLesson, { isLoading: lessonLoading }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: lessonUpdating }] = useUpdateLessonMutation();
  const [updateCourse, { isLoading: courseLoading }] = useUpdateCourseMutation();
  const [cover, setCover] = useState("");

  const onCreateLesson = async (values: LessonFormValues) => {
    try {
      await createLesson({
        courseId: id,
        title: values.title,
        contentType: values.contentType,
        textContent: values.textContent,
        videoUrl: values.videoUrl || null,
        orderIndex: lessons.length + 1,
        published: true
      }).unwrap();
      toast.success("Урок добавлен");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка создания урока";
      toast.error(message);
    }
  };

  const onUpdateLesson = async (lessonId: string, values: LessonFormValues, published: boolean) => {
    try {
      await updateLesson({
        id: lessonId,
        title: values.title,
        contentType: values.contentType,
        textContent: values.textContent ?? null,
        videoUrl: values.videoUrl || null,
        published
      }).unwrap();
      toast.success("Урок обновлён");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка обновления урока";
      toast.error(message);
    }
  };

  const onUploadVideo = async (file: File, onProgress?: (percent: number) => void) => {
    const storageUrl = await uploadCourseVideo(id, file, onProgress);
    toast.success("Видео загружено");
    return storageUrl;
  };

  const onUpdateCover = async () => {
    try {
      await updateCourse({ id, cover: cover.trim() || null }).unwrap();
      toast.success("Обложка обновлена");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка обновления обложки";
      toast.error(message);
    }
  };

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={3}>
          <Typography variant="h4">Редактор курса</Typography>
          <Typography color="text.secondary">
            {course?.title ?? "Курс"}
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems={{ md: "center" }}>
            <TextField
              fullWidth
              label="URL обложки курса"
              value={cover}
              onChange={(event) => setCover(event.target.value)}
              placeholder={course?.cover ?? "https://..."}
            />
            <Button variant="outlined" onClick={onUpdateCover} disabled={courseLoading}>
              Обновить обложку
            </Button>
          </Stack>
          <LessonEditor
            lessons={lessons}
            onCreate={onCreateLesson}
            onUpdate={onUpdateLesson}
            loading={lessonLoading || lessonUpdating}
            onUploadVideo={onUploadVideo}
          />
          <LessonQuizEditor lessons={lessons} />
        </Stack>
      </PageShell>
    </>
  );
};
