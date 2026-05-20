import { Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { LessonEditor } from "@/widgets/lesson-editor/LessonEditor";
import { SubmissionsTable } from "@/widgets/submissions-table/SubmissionsTable";
import { PageShell } from "@/shared/ui/PageShell";
import { useCreateLessonMutation, useLessonsByCourseQuery, useReviewSubmissionMutation, useSubmissionsByCourseQuery } from "@/shared/api/baseApi";
import type { LessonFormValues } from "@/features/lesson-edit/ui/LessonForm";
import type { SubmissionStatus } from "@/shared/types";
import { uploadCourseVideo } from "@/shared/api/storageApi";
import { LessonChat } from "@/widgets/lesson-chat/LessonChat";
import { useAppSelector } from "@/shared/lib/hooks";
import { selectUserId } from "@/entities/auth/model/selectors";

export const TeacherCoursePage = () => {
  const { id = "" } = useParams();
  const currentUserId = useAppSelector(selectUserId);
  const { data: lessons = [] } = useLessonsByCourseQuery(id, { skip: !id });
  const { data: submissions = [] } = useSubmissionsByCourseQuery(id, { skip: !id });
  const [createLesson, { isLoading: lessonLoading }] = useCreateLessonMutation();
  const [reviewSubmission, { isLoading: reviewLoading }] = useReviewSubmissionMutation();

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

  const onUploadVideo = async (file: File, onProgress?: (percent: number) => void) => {
    const storageUrl = await uploadCourseVideo(id, file, onProgress);
    toast.success("Видео загружено в облачное хранилище");
    return storageUrl;
  };

  const onReview = async (submissionId: string, status: SubmissionStatus, comment: string | null) => {
    try {
      await reviewSubmission({ id: submissionId, status, teacherComment: comment }).unwrap();
      toast.success("Статус обновлён");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка обновления статуса";
      toast.error(message);
    }
  };

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={4}>
          <Typography variant="h4">Управление курсом</Typography>
          <LessonEditor lessons={lessons} onCreate={onCreateLesson} loading={lessonLoading} onUploadVideo={onUploadVideo} />
          <Stack spacing={2}>
            <Typography variant="h6">Домашние задания</Typography>
            <SubmissionsTable items={submissions} onReview={onReview} loading={reviewLoading} />
          </Stack>
          {currentUserId && submissions.length > 0 && (
            <Stack spacing={2}>
              <Typography variant="h6">Чаты по урокам</Typography>
              {submissions.map((submission) => (
                <LessonChat
                  key={submission.id}
                  lessonId={submission.lessonId}
                  courseId={submission.courseId}
                  studentId={submission.studentId}
                  mentorId={currentUserId}
                  canWrite
                />
              ))}
            </Stack>
          )}
        </Stack>
      </PageShell>
    </>
  );
};
