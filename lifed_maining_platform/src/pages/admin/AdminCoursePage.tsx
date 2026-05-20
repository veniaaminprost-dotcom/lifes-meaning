import { Button, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { PageShell } from "@/shared/ui/PageShell";
import { LessonEditor } from "@/widgets/lesson-editor/LessonEditor";
import {
  useAssignTeacherMutation,
  useCreateInvitationMutation,
  useCreateLessonMutation,
  useInvitationsByCourseQuery,
  useLessonsByCourseQuery,
  useSubmissionsByCourseQuery,
  useUpdateLessonMutation
} from "@/shared/api/baseApi";
import type { LessonFormValues } from "@/features/lesson-edit/ui/LessonForm";
import { uploadCourseVideo } from "@/shared/api/storageApi";
import { LessonQuizEditor } from "@/widgets/quiz-editor/LessonQuizEditor";
import { LessonChat } from "@/widgets/lesson-chat/LessonChat";

export const AdminCoursePage = () => {
  const { id = "" } = useParams();
  const { data: lessons = [] } = useLessonsByCourseQuery(id, { skip: !id });
  const { data: submissions = [] } = useSubmissionsByCourseQuery(id, { skip: !id });
  const { data: invitations = [] } = useInvitationsByCourseQuery(id, { skip: !id });
  const [createLesson, { isLoading: lessonLoading }] = useCreateLessonMutation();
  const [updateLesson, { isLoading: lessonUpdating }] = useUpdateLessonMutation();
  const [createInvitation, { isLoading: invitationLoading }] = useCreateInvitationMutation();
  const [assignTeacher, { isLoading: assignTeacherLoading }] = useAssignTeacherMutation();
  const [maxUses, setMaxUses] = useState("1");
  const [teacherId, setTeacherId] = useState("");

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
    toast.success("Видео загружено в облачное хранилище");
    return storageUrl;
  };

  const onCreateInvitation = async () => {
    try {
      await createInvitation({
        courseId: id,
        maxUses: Number(maxUses) || null
      }).unwrap();
      toast.success("Инвайт создан");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка создания инвайта";
      toast.error(message);
    }
  };

  const onAssignTeacher = async () => {
    try {
      if (!teacherId.trim()) {
        toast.error("Введите user_id преподавателя");
        return;
      }

      await assignTeacher({ courseId: id, teacherId: teacherId.trim() }).unwrap();
      toast.success("Преподаватель назначен");
      setTeacherId("");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка назначения преподавателя";
      toast.error(message);
    }
  };

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={3}>
          <Typography variant="h4">Управление курсом</Typography>
          <LessonEditor
            lessons={lessons}
            onCreate={onCreateLesson}
            onUpdate={onUpdateLesson}
            loading={lessonLoading || lessonUpdating}
            onUploadVideo={onUploadVideo}
          />
          <LessonQuizEditor lessons={lessons} />
          {submissions.length > 0 && (
            <Stack spacing={2}>
              <Typography variant="h6">Чаты студентов с преподавателями</Typography>
              <Typography color="text.secondary">
                Директор видит переписку по каждому уроку. Администратор использует этот блок для технического контроля.
              </Typography>
              {submissions.map((submission) => (
                <LessonChat
                  key={submission.id}
                  lessonId={submission.lessonId}
                  courseId={submission.courseId}
                  studentId={submission.studentId}
                  mentorId={null}
                  canWrite={false}
                />
              ))}
            </Stack>
          )}
          <Stack spacing={1.5}>
            <Typography variant="h6">Назначение преподавателя</Typography>
            <Stack direction="row" spacing={1.5}>
              <TextField
                size="small"
                value={teacherId}
                onChange={(event) => setTeacherId(event.target.value)}
                label="Teacher user_id"
                fullWidth
              />
              <Button variant="outlined" onClick={onAssignTeacher} disabled={assignTeacherLoading}>
                Назначить
              </Button>
            </Stack>
          </Stack>
          <Stack spacing={1.5}>
            <Typography variant="h6">Приглашения</Typography>
            <Stack direction="row" spacing={1.5}>
              <TextField size="small" value={maxUses} onChange={(event) => setMaxUses(event.target.value)} label="Max uses" />
              <Button variant="contained" onClick={onCreateInvitation} disabled={invitationLoading}>
                Создать invite
              </Button>
            </Stack>
            {invitations.map((invitation) => (
              <Typography key={invitation.id} color="text.secondary" fontSize={14}>
                /invite/{invitation.token} • использовано {invitation.usedCount}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </PageShell>
    </>
  );
};
