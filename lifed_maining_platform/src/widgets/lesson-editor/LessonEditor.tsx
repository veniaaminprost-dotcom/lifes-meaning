import { Button, Checkbox, Divider, FormControlLabel, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { LessonForm, type LessonFormValues } from "@/features/lesson-edit/ui/LessonForm";
import type { Lesson } from "@/shared/types";

interface LessonEditorProps {
  lessons: Lesson[];
  loading?: boolean;
  onCreate: (values: LessonFormValues) => Promise<void>;
  onUpdate?: (lessonId: string, values: LessonFormValues, published: boolean) => Promise<void>;
  onUploadVideo?: (file: File, onProgress?: (percent: number) => void) => Promise<string>;
}

export const LessonEditor = ({ lessons, loading, onCreate, onUpdate, onUploadVideo }: LessonEditorProps) => {
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const editingLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === editingLessonId) ?? null,
    [editingLessonId, lessons]
  );
  const [published, setPublished] = useState(true);

  useEffect(() => {
    setPublished(editingLesson?.published ?? true);
  }, [editingLesson]);

  return (
    <Stack spacing={2.5}>
      <Typography variant="h6">Уроки</Typography>
      <Stack spacing={1}>
        {lessons.map((lesson) => (
          <Stack key={lesson.id} spacing={0.5}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
              <Typography fontWeight={600}>{lesson.orderIndex}. {lesson.title}</Typography>
              {onUpdate && (
                <Button
                  variant={editingLessonId === lesson.id ? "contained" : "outlined"}
                  size="small"
                  onClick={() => setEditingLessonId((current) => current === lesson.id ? null : lesson.id)}
                >
                  {editingLessonId === lesson.id ? "Закрыть" : "Редактировать урок"}
                </Button>
              )}
            </Stack>
            <Typography color="text.secondary" fontSize={14}>
              {lesson.contentType} • {lesson.published ? "Опубликован" : "Черновик"}
            </Typography>
            <Divider />
          </Stack>
        ))}
      </Stack>
      {editingLesson && onUpdate && (
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={600}>
            Редактирование: {editingLesson.title}
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={published} onChange={(event) => setPublished(event.target.checked)} />}
            label={published ? "Урок опубликован" : "Урок в черновике"}
          />
          <LessonForm
            loading={loading}
            initialValues={{
              title: editingLesson.title,
              contentType: editingLesson.contentType,
              textContent: editingLesson.textContent ?? "",
              videoUrl: editingLesson.videoUrl ?? ""
            }}
            submitLabel="Сохранить изменения урока"
            onSubmit={(values) => onUpdate(editingLesson.id, values, published)}
            onUploadVideo={onUploadVideo}
          />
        </Stack>
      )}
      <Stack spacing={1}>
        <Typography variant="subtitle1" fontWeight={600}>Новый урок</Typography>
        <LessonForm loading={loading} onSubmit={onCreate} onUploadVideo={onUploadVideo} submitLabel="Добавить урок" />
      </Stack>
    </Stack>
  );
};
