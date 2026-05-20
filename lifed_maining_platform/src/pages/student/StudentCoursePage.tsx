import { Button, List, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { PageShell } from "@/shared/ui/PageShell";
import { useLessonsByCourseQuery } from "@/shared/api/baseApi";
import { VideoPlayer } from "@/shared/ui/VideoPlayer";

export const StudentCoursePage = () => {
  const { id = "" } = useParams();
  const { data: lessons = [], isLoading } = useLessonsByCourseQuery(id, { skip: !id });
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  useEffect(() => {
    if (!lessons.length) {
      setSelectedLessonId(null);
      return;
    }
    setSelectedLessonId((prev) => prev ?? lessons[0].id);
  }, [lessons]);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId]
  );

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={2}>
          <Typography variant="h4">Уроки курса</Typography>
          {isLoading && <Typography color="text.secondary">Загружаю уроки...</Typography>}
          {!isLoading && !lessons.length && <Typography color="text.secondary">В этом курсе пока нет доступных уроков.</Typography>}
          {selectedLesson && (
            <Stack spacing={1}>
              <Typography variant="h6">{selectedLesson.title}</Typography>
              {selectedLesson.textContent && <Typography color="text.secondary">{selectedLesson.textContent}</Typography>}
              {selectedLesson.videoUrl ? (
                <VideoPlayer videoUrl={selectedLesson.videoUrl} />
              ) : (
                <Typography color="text.secondary">Урок доступен без видео. Откройте его, чтобы посмотреть материалы и задание.</Typography>
              )}
              <Button component={Link} to={`/student/course/${id}/lesson/${selectedLesson.id}`} variant="contained">
                Открыть урок и задание
              </Button>
            </Stack>
          )}
          <List>
            {lessons.map((lesson) => (
              <ListItemButton key={lesson.id} selected={selectedLessonId === lesson.id} onClick={() => setSelectedLessonId(lesson.id)}>
                <ListItemText primary={lesson.title} secondary={lesson.published ? "Опубликован" : "Черновик"} />
              </ListItemButton>
            ))}
          </List>
          <Button component={Link} to="/student" variant="outlined">
            Назад
          </Button>
        </Stack>
      </PageShell>
    </>
  );
};
