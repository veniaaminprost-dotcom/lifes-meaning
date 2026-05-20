import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, Container, Divider, List, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import { Link, Navigate, useParams } from "react-router-dom";
import { BrandLockup } from "@/shared/ui/BrandLockup";
import { fetchShowcaseCourseBySlug, type ShowcaseCourse } from "@/entities/course/api/showcaseCourseApi";
import { enrollInCourse } from "@/entities/enrollment/api/enrollmentApi";
import { selectSession } from "@/entities/auth/model/selectors";
import { getMyProfile } from "@/entities/profile/api/profileApi";
import { getCourseTheme, getDashboardLink } from "@/shared/lib/courseShowcase";
import { useAppSelector } from "@/shared/lib/hooks";
import { CourseGlyph } from "@/shared/ui/CourseGlyph";
import { VideoPlayer } from "@/shared/ui/VideoPlayer";
import { useLessonQuizQuery } from "@/shared/api/baseApi";

export const CourseShowcaseDetailsPage = () => {
  const { slug = "" } = useParams();
  const session = useAppSelector(selectSession);
  const [course, setCourse] = useState<ShowcaseCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [courseLoadFailed, setCourseLoadFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryLink, setEntryLink] = useState("/login");
  const [entryLabel, setEntryLabel] = useState("Войти");
  const [resolvingEntry, setResolvingEntry] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [accessAttempt, setAccessAttempt] = useState(0);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const previewLesson = course?.lessons.find((lesson) => lesson.id === selectedLessonId) ?? course?.lessons[0] ?? null;
  const { data: previewQuiz } = useLessonQuizQuery(previewLesson?.id ?? "", { skip: !session || !previewLesson?.id });

  useEffect(() => {
    let cancelled = false;

    const loadCourse = async () => {
      try {
        setIsLoading(true);
        setCourseLoadFailed(false);
        setError(null);
        const data = await fetchShowcaseCourseBySlug(slug);

        if (cancelled) {
          return;
        }

        if (!data) {
          setCourse(null);
          setCourseLoadFailed(true);
          return;
        }

        setCourse(data);
      } catch (unknownError) {
        if (!cancelled) {
          setCourse(null);
          setCourseLoadFailed(true);
          setError(unknownError instanceof Error ? unknownError.message : "Не удалось загрузить курс");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCourse();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    const resolveEntryLink = async () => {
      if (!course) {
        return;
      }

      if (!session) {
        if (!cancelled) {
          setEntryLink("/login");
          setEntryLabel("Войти, чтобы открыть курс");
          setResolvingEntry(false);
          setAccessError(null);
        }
        return;
      }

      if (!cancelled) {
        const firstLessonId = course.lessons[0]?.id;
        const studentEntryLink = firstLessonId ? `/student/course/${course.id}/lesson/${firstLessonId}` : `/student/course/${course.id}`;
        setEntryLink(studentEntryLink);
        setEntryLabel("Перейти к первому уроку");
        setResolvingEntry(true);
        setAccessError(null);
      }

      try {
        const profile = await getMyProfile();
        const role = profile?.role ?? "student";

        if (!cancelled) {
          const firstLessonId = course.lessons[0]?.id;
          const studentEntryLink = firstLessonId ? `/student/course/${course.id}/lesson/${firstLessonId}` : `/student/course/${course.id}`;
          setEntryLink(role === "student" ? studentEntryLink : getDashboardLink(role));
          setEntryLabel(role === "student" ? "Перейти к первому уроку" : "Открыть кабинет");
          setResolvingEntry(false);
        }

        if (role === "student") {
          try {
            await enrollInCourse(course.id);
            if (!cancelled) {
              setAccessError(null);
            }
          } catch (unknownError) {
            if (!cancelled) {
              const reason = unknownError instanceof Error ? unknownError.message : "Не удалось подготовить доступ к видео";
              setAccessError(`Автоподготовка доступа не завершилась: ${reason}`);
            }
          }
        }
      } catch {
        if (!cancelled) {
          setEntryLabel("Открыть курс");
          setAccessError("Не удалось загрузить профиль. Попробуйте «Повторить доступ».");
          setResolvingEntry(false);
        }
      }
    };

    resolveEntryLink();
    return () => {
      cancelled = true;
    };
  }, [course, session, accessAttempt]);

  useEffect(() => {
    if (!course?.lessons.length) {
      setSelectedLessonId(null);
      return;
    }

    setSelectedLessonId((prev) => prev ?? course.lessons[0].id);
  }, [course]);

  if (!isLoading && courseLoadFailed && !course) {
    return <Navigate to="/vitrina" replace />;
  }

  if (isLoading || !course) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#f8f5f1" }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Typography color={error ? "error" : "text.secondary"}>{error ?? "Загружаю курс..."}</Typography>
        </Container>
      </Box>
    );
  }

  const theme = getCourseTheme(course.title);
  const previewVideoUrl = previewLesson?.videoUrl ?? null;
  const canPreviewVideo = Boolean(session && previewVideoUrl);
  const selectedLessonIndex = previewLesson ? course.lessons.findIndex((lesson) => lesson.id === previewLesson.id) : -1;
  const hasPrevLesson = selectedLessonIndex > 0;
  const hasNextLesson = selectedLessonIndex >= 0 && selectedLessonIndex < course.lessons.length - 1;
  const quizQuestions = previewQuiz?.items ?? [];
  const firstLessonId = course.lessons[0]?.id;
  const studentEntryLink = firstLessonId ? `/student/course/${course.id}/lesson/${firstLessonId}` : `/student/course/${course.id}`;

  const goToPrevLesson = () => {
    if (!hasPrevLesson) {
      return;
    }
    const nextLesson = course.lessons[selectedLessonIndex - 1];
    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
    }
  };

  const goToNextLesson = () => {
    if (!hasNextLesson) {
      return;
    }
    const nextLesson = course.lessons[selectedLessonIndex + 1];
    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `url('/legacy-landing/Кресты.png') bottom right / min(400px, 80vw) no-repeat fixed,
          radial-gradient(circle at 75% 15%, ${theme.accent}44, transparent 33%), 
          #f8f5f1`
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack spacing={2.5} sx={{ mb: 3 }}>
          <BrandLockup size="sm" />
          <Button component={Link} to="/vitrina" variant="text" sx={{ width: "fit-content", px: 0 }}>
            ← Назад к витрине
          </Button>
          <Chip label={`Онлайн-школа «Жизни Смысл» • ${course.lessons.length} уроков`} sx={{ width: "fit-content", bgcolor: "#efe3d7" }} />
          <Stack direction="row" spacing={1.4} alignItems="center">
            <CourseGlyph iconKey={theme.iconKey} size={48} variant="ornate" />
            <Typography variant="h2">{course.title}</Typography>
          </Stack>
          <Typography color="text.secondary" maxWidth={860}>
            {course.description}
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2.5} alignItems="stretch">
          <Card sx={{ flex: 1.2, borderRadius: 3, bgcolor: "#fffaf5" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="h6" sx={{ mb: 1.25 }}>
                Превью урока
              </Typography>
              {canPreviewVideo && previewVideoUrl ? (
                <VideoPlayer key={previewLesson?.id ?? previewVideoUrl} videoUrl={previewVideoUrl} />
              ) : !session ? (
                <Typography color="text.secondary">Войдите в аккаунт, чтобы открыть видеоуроки этого курса.</Typography>
              ) : resolvingEntry ? (
                <Typography color="text.secondary">Готовлю доступ к видео...</Typography>
              ) : (
                <Typography color="text.secondary">Для этого курса пока не загружено превью-видео.</Typography>
              )}
              {previewLesson && (
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ mt: 1.5 }}>
                  <Button variant="outlined" onClick={goToPrevLesson} disabled={!hasPrevLesson}>
                    Предыдущий урок
                  </Button>
                  <Button variant="contained" onClick={goToNextLesson} disabled={!hasNextLesson}>
                    Следующий урок
                  </Button>
                </Stack>
              )}
              {accessError && (
                <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                  <Alert severity="warning">{accessError}</Alert>
                  <Button variant="outlined" onClick={() => setAccessAttempt((value) => value + 1)} sx={{ width: "fit-content" }}>
                    Повторить доступ
                  </Button>
                </Stack>
              )}
              {previewLesson && (
                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  <Typography variant="h6">Вопросы к уроку</Typography>
                  <Typography fontSize={13} color="text.secondary">
                    Вопросы настраиваются в кабинете редактора и доступны после входа в урок студента.
                  </Typography>
                  {!session && <Typography color="text.secondary">Войдите, чтобы увидеть вопросы урока.</Typography>}
                  {session && !quizQuestions.length && <Typography color="text.secondary">Для этого урока пока нет вопросов.</Typography>}
                  {quizQuestions.map((question, index) => (
                    <Card key={question.id} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Stack spacing={1}>
                          <Typography fontWeight={600}>
                            {index + 1}. {question.text}
                          </Typography>
                          {question.options.map((option) => {
                            const isSelected = selectedAnswers[question.id] === option.id;
                            return (
                              <Button
                                key={option.id}
                                variant={isSelected ? "contained" : "outlined"}
                                onClick={() => setSelectedAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                                sx={{ justifyContent: "flex-start" }}
                              >
                                {option.text}
                              </Button>
                            );
                          })}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          <Card sx={{ flex: 1, borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack spacing={1}>
                <Typography variant="h6">Программа курса</Typography>
                <Typography fontSize={14} color="text.secondary" sx={{ mb: 0.5 }}>
                  {course.lessons.length} уроков
                </Typography>
                {!course.lessons.length && <Typography color="text.secondary">Опубликованные уроки пока не добавлены.</Typography>}
                <List disablePadding>
                  {course.lessons.map((lesson, index) => (
                    <Stack key={lesson.id} spacing={0.8}>
                      <ListItemButton selected={lesson.id === selectedLessonId} onClick={() => setSelectedLessonId(lesson.id)} sx={{ px: 0 }}>
                        <ListItemText primary={`${index + 1}. ${lesson.title}`} />
                      </ListItemButton>
                      <Divider />
                    </Stack>
                  ))}
                </List>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 3 }}>
          <Button
            component={Link}
            to={entryLink}
            state={!session ? { from: { pathname: studentEntryLink } } : undefined}
            variant="contained"
            size="large"
            disabled={resolvingEntry}
          >
            {entryLabel}
          </Button>
          {!session && (
            <Button component={Link} to="/register" state={{ from: { pathname: studentEntryLink } }} variant="outlined" size="large">
              Создать аккаунт
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
};
