import { Button, FormControlLabel, Paper, Stack, Switch, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "sonner";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { CourseList } from "@/widgets/course-list/CourseList";
import { PageShell } from "@/shared/ui/PageShell";
import { useAnswerMentorQuestionMutation, useMentorQuestionsQuery, useMyAssignedStudentsQuery, useMyCoursesQuery, useQuizResultsQuery } from "@/shared/api/baseApi";
import { QuizResultsTable } from "@/widgets/quiz-results/QuizResultsTable";
import { StudentReligionGroups } from "@/widgets/student-groups/StudentReligionGroups";

export const TeacherDashboardPage = () => {
  const { data = [] } = useMyCoursesQuery();
  const { data: students = [] } = useMyAssignedStudentsQuery();
  const { data: questions = [] } = useMentorQuestionsQuery();
  const { data: quizResults = [] } = useQuizResultsQuery();
  const [onlyWeakResults, setOnlyWeakResults] = useState(false);
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>({});
  const [answerQuestion, { isLoading: answering }] = useAnswerMentorQuestionMutation();
  const filteredQuizResults = onlyWeakResults ? quizResults.filter((item) => item.percent < 50) : quizResults;

  const onAnswer = async (id: string) => {
    const answerText = draftAnswers[id]?.trim();
    if (!answerText) {
      toast.error("Введите ответ студенту");
      return;
    }
    try {
      await answerQuestion({ id, answerText }).unwrap();
      toast.success("Ответ отправлен");
      setDraftAnswers((prev) => ({ ...prev, [id]: "" }));
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка отправки ответа";
      toast.error(message);
    }
  };

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={2.5}>
          <Typography variant="h4">Курсы преподавателя</Typography>
          <CourseList courses={data} role="teacher" />
          <StudentReligionGroups students={students} title="Закреплённые студенты" />
          <Paper sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="h6">Вопросы студентов</Typography>
              {!questions.length && <Typography color="text.secondary">Новых вопросов нет.</Typography>}
              {questions.map((question) => (
                <Stack key={question.id} spacing={0.75} sx={{ borderBottom: "1px solid #eee", pb: 1.25 }}>
                  <Typography>{question.questionText}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Статус: {question.status === "new" ? "Новый" : "Отвечен"}
                  </Typography>
                  {question.answerText ? (
                    <Typography variant="body2" color="text.secondary">
                      Ответ: {question.answerText}
                    </Typography>
                  ) : (
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Введите ответ студенту"
                        value={draftAnswers[question.id] ?? ""}
                        onChange={(event) =>
                          setDraftAnswers((prev) => ({ ...prev, [question.id]: event.target.value }))
                        }
                      />
                      <Button variant="outlined" onClick={() => onAnswer(question.id)} disabled={answering}>
                        Ответить
                      </Button>
                    </Stack>
                  )}
                </Stack>
              ))}
            </Stack>
          </Paper>
          <Stack spacing={1.25}>
            <Typography variant="h6">Результаты тестов студентов</Typography>
            <FormControlLabel
              control={<Switch checked={onlyWeakResults} onChange={(_, checked) => setOnlyWeakResults(checked)} />}
              label="Только слабые результаты (ниже 50%)"
            />
            <QuizResultsTable items={filteredQuizResults} />
          </Stack>
        </Stack>
      </PageShell>
    </>
  );
};
