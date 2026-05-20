import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Chip, Link as MuiLink, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { PageShell } from "@/shared/ui/PageShell";
import {
  useCreateMentorQuestionMutation,
  useCreateSubmissionMutation,
  useLessonsByCourseQuery,
  useLessonQuizQuery,
  useMyMentorAssignmentQuery,
  useMyLessonQuizSubmissionQuery,
  useMyMentorProfileQuery,
  useSubmitLessonQuizMutation
} from "@/shared/api/baseApi";
import { VideoPlayer } from "@/shared/ui/VideoPlayer";
import { LessonChat } from "@/widgets/lesson-chat/LessonChat";
import { useAppSelector } from "@/shared/lib/hooks";
import { selectUserId } from "@/entities/auth/model/selectors";

const schema = z.object({
  textAnswer: z.string().min(10, "Напишите ответ минимум на 10 символов"),
  files: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export const StudentLessonPage = () => {
  const { id = "", lessonId = "" } = useParams();
  const currentUserId = useAppSelector(selectUserId);
  const { data: lessons = [], isLoading: lessonLoading } = useLessonsByCourseQuery(id, { skip: !id });
  const { data: mentor } = useMyMentorProfileQuery();
  const { data: mentorAssignment } = useMyMentorAssignmentQuery();
  const lesson = useMemo(() => lessons.find((item) => item.id === lessonId), [lessons, lessonId]);
  const { data: lessonQuiz } = useLessonQuizQuery(lessonId, { skip: !lessonId });
  const { data: myQuizSubmission } = useMyLessonQuizSubmissionQuery(lessonId, { skip: !lessonId });
  const [createSubmission, { isLoading: submissionLoading }] = useCreateSubmissionMutation();
  const [createMentorQuestion, { isLoading: mentorQuestionLoading }] = useCreateMentorQuestionMutation();
  const [submitLessonQuiz, { isLoading: quizSubmitting }] = useSubmitLessonQuizMutation();
  const [mentorQuestion, setMentorQuestion] = useState("");
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, string>>({});
  const [completedQuestionIds, setCompletedQuestionIds] = useState<string[]>([]);
  const [checkedQuestionIds, setCheckedQuestionIds] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedQuizAnswers(myQuizSubmission?.answers ?? {});
  }, [myQuizSubmission?.answers, lessonId]);

  useEffect(() => {
    if (!lessonQuiz?.items.length) {
      setCompletedQuestionIds([]);
      setCheckedQuestionIds([]);
      setCurrentQuestionIndex(0);
      return;
    }

    if (!myQuizSubmission?.answers) {
      setCompletedQuestionIds([]);
      setCheckedQuestionIds([]);
      setCurrentQuestionIndex(0);
      return;
    }

    const completed = lessonQuiz.items
      .filter((question) => {
        const answerOptionId = myQuizSubmission.answers[question.id];
        const answerOption = question.options.find((option) => option.id === answerOptionId);
        return Boolean(answerOption?.isCorrect);
      })
      .map((question) => question.id);

    setCompletedQuestionIds(completed);
    setCheckedQuestionIds(Object.keys(myQuizSubmission.answers));
    const firstIncompleteIndex = lessonQuiz.items.findIndex((question) => !completed.includes(question.id));
    setCurrentQuestionIndex(firstIncompleteIndex >= 0 ? firstIncompleteIndex : Math.max(lessonQuiz.items.length - 1, 0));
  }, [lessonQuiz?.items, myQuizSubmission?.answers, lessonId]);

  const quizTotal = lessonQuiz?.items.length ?? 0;
  const currentQuestion = lessonQuiz?.items[currentQuestionIndex] ?? null;
  const completedCount = completedQuestionIds.length;

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await createSubmission({
        courseId: id,
        lessonId,
        textAnswer: values.textAnswer,
        filePaths: values.files ? values.files.split(",").map((item) => item.trim()) : []
      }).unwrap();
      toast.success("Домашняя работа отправлена");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка отправки";
      toast.error(message);
    }
  };

  const onSubmitMentorQuestion = async () => {
    if (!mentorQuestion.trim()) {
      toast.error("Введите вопрос ментору");
      return;
    }
    try {
      await createMentorQuestion({
        courseId: id,
        lessonId,
        questionText: mentorQuestion
      }).unwrap();
      toast.success("Вопрос отправлен ментору");
      setMentorQuestion("");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Не удалось отправить вопрос";
      toast.error(message);
    }
  };

  const onSubmitQuiz = async () => {
    if (!lessonQuiz?.items.length) {
      return;
    }
    const unanswered = lessonQuiz.items.some((question) => !selectedQuizAnswers[question.id]);
    if (unanswered) {
      toast.error("Ответьте на все вопросы перед отправкой.");
      return;
    }

    const score = lessonQuiz.items.reduce((acc, question) => {
      const selectedOptionId = selectedQuizAnswers[question.id];
      const selectedOption = question.options.find((option) => option.id === selectedOptionId);
      return acc + (selectedOption?.isCorrect ? 1 : 0);
    }, 0);

    try {
      await submitLessonQuiz({
        lessonId,
        answers: selectedQuizAnswers,
        score,
        total: lessonQuiz.items.length
      }).unwrap();
      toast.success(`Тест отправлен: ${score}/${lessonQuiz.items.length}`);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка отправки теста";
      toast.error(message);
    }
  };

  const onCheckCurrentQuestion = () => {
    if (!currentQuestion) {
      return;
    }

    const selectedOptionId = selectedQuizAnswers[currentQuestion.id];
    if (!selectedOptionId) {
      toast.error("Выберите вариант ответа.");
      return;
    }

    const selectedOption = currentQuestion.options.find((option) => option.id === selectedOptionId);
    if (!selectedOption?.isCorrect) {
      setCelebrationMessage("Ответ неверный. Выберите другой вариант и проверьте ещё раз.");
      setCheckedQuestionIds((prev) => (prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]));
      return;
    }

    setCelebrationMessage("Ответ верный. Задание выполнено.");
    setCheckedQuestionIds((prev) => (prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]));
    setCompletedQuestionIds((prev) => (prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]));
  };

  const onNextQuestion = async () => {
    if (!currentQuestion || !lessonQuiz?.items.length) {
      return;
    }

    const isCurrentCompleted = completedQuestionIds.includes(currentQuestion.id);
    if (!isCurrentCompleted) {
      toast.error("Сначала правильно завершите текущее задание.");
      return;
    }

    const isLast = currentQuestionIndex >= lessonQuiz.items.length - 1;
    if (isLast) {
      await onSubmitQuiz();
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setCelebrationMessage(null);
  };

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={2.5}>
          {lessonLoading && <Typography color="text.secondary">Загружаю урок...</Typography>}
          {!lessonLoading && !lesson && (
            <Stack spacing={1.5}>
              <Typography variant="h4">Урок не найден</Typography>
              <Typography color="text.secondary">Проверьте, что урок опубликован и относится к выбранному курсу.</Typography>
              <Button component={RouterLink} to={`/student/course/${id}`} variant="outlined">
                Вернуться к списку уроков
              </Button>
            </Stack>
          )}
          {lesson && (
            <>
              <Typography variant="h4">{lesson.title}</Typography>
              {lesson.textContent && <Typography color="text.secondary">{lesson.textContent}</Typography>}
              {lesson.videoUrl ? (
                <VideoPlayer videoUrl={lesson.videoUrl} />
              ) : (
                <Typography color="text.secondary">Для этого урока видео не загружено. Материалы доступны в текстовом формате.</Typography>
              )}
              <Stack spacing={1.25} sx={{ p: 1.5, border: "1px solid #e8e0d8", borderRadius: 1.5 }}>
                <Typography variant="h6">Ментор</Typography>
                {mentor ? (
                  <>
                    <Typography color="text.secondary">
                      Закреплённый ментор: {mentor.displayName}
                    </Typography>
                    {mentor.messengerContact && (
                      <MuiLink
                        href={
                          mentor.messengerContact.startsWith("http")
                            ? mentor.messengerContact
                            : mentor.messengerType === "telegram"
                              ? `https://t.me/${mentor.messengerContact.replace("@", "")}`
                              : mentor.messengerType === "vk"
                                ? `https://vk.com/${mentor.messengerContact.replace("@", "")}`
                                : `https://max.ru/${mentor.messengerContact.replace("@", "")}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Связаться через {mentor.messengerType?.toUpperCase() ?? "мессенджер"}
                      </MuiLink>
                    )}
                  </>
                ) : (
                  <Typography color="text.secondary">
                    Ментор пока не назначен. Директор назначит ментора после распределения.
                  </Typography>
                )}
                <TextField
                  label="Вопрос ментору"
                  multiline
                  minRows={3}
                  value={mentorQuestion}
                  onChange={(event) => setMentorQuestion(event.target.value)}
                  placeholder="Напишите вопрос по уроку, заданию или личному сопровождению"
                />
                <Button variant="outlined" onClick={onSubmitMentorQuestion} disabled={mentorQuestionLoading || !mentor}>
                  Отправить вопрос ментору
                </Button>
              </Stack>
              {currentUserId && (
                <LessonChat
                  lessonId={lessonId}
                  courseId={id}
                  studentId={currentUserId}
                  mentorId={mentorAssignment?.mentorId ?? null}
                  canWrite={Boolean(mentorAssignment?.mentorId)}
                />
              )}
              <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  label="Ответ"
                  multiline
                  minRows={5}
                  {...register("textAnswer")}
                  error={Boolean(errors.textAnswer)}
                  helperText={errors.textAnswer?.message}
                />
                <TextField
                  label="Файлы (пути через запятую)"
                  {...register("files")}
                  error={Boolean(errors.files)}
                  helperText={errors.files?.message}
                />
                <Button type="submit" variant="contained" disabled={submissionLoading}>
                  Отправить домашку
                </Button>
              </Stack>
              <Stack spacing={1.25} sx={{ p: 1.5, border: "1px solid #e8e0d8", borderRadius: 1.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Вопросы к уроку</Typography>
                  {quizTotal > 0 && (
                    <Chip
                      size="small"
                      color="primary"
                      label={`Задание ${Math.min(currentQuestionIndex + 1, quizTotal)}/${quizTotal}`}
                    />
                  )}
                </Stack>
                {!lessonQuiz?.items.length && (
                  <Typography color="text.secondary">К этому уроку пока не добавлены вопросы.</Typography>
                )}
                {lessonQuiz?.items.length && currentQuestion && (
                  <Stack spacing={0.9}>
                    <Typography color="text.secondary">
                      Выполнено заданий: {completedCount}/{quizTotal}
                    </Typography>
                    <Typography fontWeight={600}>{currentQuestionIndex + 1}. {currentQuestion.text}</Typography>
                    {currentQuestion.options.map((option) => {
                          const selected = selectedQuizAnswers[currentQuestion.id] === option.id;
                          const checked = checkedQuestionIds.includes(currentQuestion.id);
                          const selectedOption = currentQuestion.options.find(
                            (currentOption) => currentOption.id === selectedQuizAnswers[currentQuestion.id]
                          );
                          const isSelectedAnswerCorrect = Boolean(selectedOption?.isCorrect);
                          return (
                            <Button
                              key={option.id}
                              variant={selected ? "contained" : "outlined"}
                              onClick={() => {
                                setSelectedQuizAnswers((prev) => ({ ...prev, [currentQuestion.id]: option.id }));
                                setCheckedQuestionIds((prev) => prev.filter((questionId) => questionId !== currentQuestion.id));
                                setCelebrationMessage(null);
                              }}
                              color={checked && selected ? (isSelectedAnswerCorrect ? "success" : "error") : "primary"}
                              sx={{ justifyContent: "flex-start" }}
                            >
                              {option.text}
                        </Button>
                      );
                    })}
                    {celebrationMessage && (
                      <Alert severity={celebrationMessage.includes("верный") ? "success" : "error"}>
                        {celebrationMessage}
                      </Alert>
                    )}
                    {!completedQuestionIds.includes(currentQuestion.id) ? (
                      <Button variant="outlined" onClick={onCheckCurrentQuestion}>
                        Проверить ответ
                      </Button>
                    ) : (
                      <Button variant="contained" onClick={onNextQuestion} disabled={quizSubmitting}>
                        {currentQuestionIndex >= quizTotal - 1 ? "Завершить тест" : "Следующее задание"}
                      </Button>
                    )}
                  </Stack>
                )}
                {myQuizSubmission && (
                  <Typography color="text.secondary">
                    Последний результат: {myQuizSubmission.score}/{myQuizSubmission.total}
                  </Typography>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </PageShell>
    </>
  );
};
