import { Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Lesson, LessonQuizQuestion } from "@/shared/types";
import { useLessonQuizQuery, useSaveLessonQuizMutation } from "@/shared/api/baseApi";

interface LessonQuizEditorProps {
  lessons: Lesson[];
}

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyQuestion = (): LessonQuizQuestion => ({
  id: `q-${makeId()}`,
  text: "",
  options: [
    { id: `o-${makeId()}`, text: "", isCorrect: true },
    { id: `o-${makeId()}`, text: "", isCorrect: false }
  ]
});

export const LessonQuizEditor = ({ lessons }: LessonQuizEditorProps) => {
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const { data: quiz } = useLessonQuizQuery(selectedLessonId, { skip: !selectedLessonId });
  const [items, setItems] = useState<LessonQuizQuestion[]>([]);
  const [saveQuiz, { isLoading: saving }] = useSaveLessonQuizMutation();

  useEffect(() => {
    if (!lessons.length) {
      setSelectedLessonId("");
      return;
    }
    setSelectedLessonId((prev) => prev || lessons[0].id);
  }, [lessons]);

  useEffect(() => {
    setItems(quiz?.items ?? []);
  }, [quiz]);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId]
  );

  const addQuestion = () => {
    setItems((prev) => [...prev, createEmptyQuestion()]);
  };

  const updateQuestionText = (questionId: string, text: string) => {
    setItems((prev) => prev.map((question) => (question.id === questionId ? { ...question, text } : question)));
  };

  const deleteQuestion = (questionId: string) => {
    setItems((prev) => prev.filter((question) => question.id !== questionId));
  };

  const addOption = (questionId: string) => {
    setItems((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, options: [...question.options, { id: `o-${makeId()}`, text: "", isCorrect: false }] }
          : question
      )
    );
  };

  const updateOption = (questionId: string, optionId: string, patch: { text?: string; isCorrect?: boolean }) => {
    setItems((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option) => (option.id === optionId ? { ...option, ...patch } : option))
            }
          : question
      )
    );
  };

  const deleteOption = (questionId: string, optionId: string) => {
    setItems((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, options: question.options.filter((option) => option.id !== optionId) }
          : question
      )
    );
  };

  const validateBeforeSave = () => {
    for (const question of items) {
      if (!question.text.trim()) {
        return "Заполните текст каждого вопроса.";
      }
      if (question.options.length < 2) {
        return "У каждого вопроса должно быть минимум 2 варианта.";
      }
      if (question.options.some((option) => !option.text.trim())) {
        return "Заполните текст всех вариантов ответа.";
      }
      if (!question.options.some((option) => option.isCorrect)) {
        return "У каждого вопроса должен быть отмечен хотя бы один правильный ответ.";
      }
    }
    return null;
  };

  const handleSave = async () => {
    if (!selectedLessonId) {
      toast.error("Выберите урок");
      return;
    }

    const validationError = validateBeforeSave();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      await saveQuiz({ lessonId: selectedLessonId, items }).unwrap();
      toast.success("Конструктор вопросов сохранён");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка сохранения конструктора";
      toast.error(message);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Конструктор вопросов</Typography>
          {!lessons.length && <Typography color="text.secondary">Сначала добавьте урок, затем создайте вопросы.</Typography>}
          {lessons.length > 0 && (
            <>
              <TextField
                select
                label="Урок для редактирования вопросов"
                value={selectedLessonId}
                onChange={(event) => setSelectedLessonId(event.target.value)}
              >
                {lessons.map((lesson) => (
                  <MenuItem key={lesson.id} value={lesson.id}>
                    {lesson.orderIndex}. {lesson.title}
                  </MenuItem>
                ))}
              </TextField>
              <Typography color="text.secondary">
                {selectedLesson ? `Редактируете вопросы к уроку: ${selectedLesson.title}` : "Урок не выбран"}
              </Typography>
              <Button variant="outlined" onClick={addQuestion}>
                Добавить вопрос
              </Button>
              {!items.length && <Typography color="text.secondary">Пока вопросов нет.</Typography>}
              {items.map((question, questionIndex) => (
                <Card key={question.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={1.25}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography fontWeight={600}>Вопрос {questionIndex + 1}</Typography>
                        <Button color="error" variant="text" onClick={() => deleteQuestion(question.id)}>
                          Удалить вопрос
                        </Button>
                      </Stack>
                      <TextField
                        label="Текст вопроса"
                        value={question.text}
                        onChange={(event) => updateQuestionText(question.id, event.target.value)}
                        fullWidth
                      />
                      {question.options.map((option, optionIndex) => (
                        <Stack key={option.id} direction={{ xs: "column", md: "row" }} spacing={1} alignItems={{ md: "center" }}>
                          <TextField
                            fullWidth
                            label={`Вариант ${optionIndex + 1}`}
                            value={option.text}
                            onChange={(event) => updateOption(question.id, option.id, { text: event.target.value })}
                          />
                          <TextField
                            select
                            label="Статус"
                            value={option.isCorrect ? "correct" : "wrong"}
                            onChange={(event) => updateOption(question.id, option.id, { isCorrect: event.target.value === "correct" })}
                            sx={{ minWidth: 180 }}
                          >
                            <MenuItem value="correct">Правильный</MenuItem>
                            <MenuItem value="wrong">Неправильный</MenuItem>
                          </TextField>
                          <Button color="error" variant="text" onClick={() => deleteOption(question.id, option.id)}>
                            Удалить вариант
                          </Button>
                        </Stack>
                      ))}
                      <Button variant="text" onClick={() => addOption(question.id)} sx={{ width: "fit-content" }}>
                        Добавить вариант
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
              <Button variant="contained" onClick={handleSave} disabled={saving}>
                Сохранить вопросы урока
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
