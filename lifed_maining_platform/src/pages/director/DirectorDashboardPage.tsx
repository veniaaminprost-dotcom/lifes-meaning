import { Alert, Button, FormControlLabel, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "sonner";
import { CreateCourseDialog } from "@/features/create-course/ui/CreateCourseDialog";
import {
  useCreateCourseMutation,
  useCreateLessonMutation,
  useMentorQuestionsQuery,
  useMentorAssignmentsQuery,
  useMentorDistributionSettingsQuery,
  useMyCoursesQuery,
  useQuizResultsQuery,
  useStudentProfilesQuery,
  useTeacherProfilesQuery
} from "@/shared/api/baseApi";
import { PageShell } from "@/shared/ui/PageShell";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { CourseList } from "@/widgets/course-list/CourseList";
import { DEFAULT_VIDEO_URL, LANDING_COURSES } from "@/shared/config/landingCatalog";
import { StudentReligionGroups } from "@/widgets/student-groups/StudentReligionGroups";
import { MentorAssignmentManager } from "@/widgets/mentor-assignment/MentorAssignmentManager";
import { QuizResultsTable } from "@/widgets/quiz-results/QuizResultsTable";

export const DirectorDashboardPage = () => {
  const [open, setOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [quizCourseFilter, setQuizCourseFilter] = useState("");
  const [onlyWeakResults, setOnlyWeakResults] = useState(false);
  const { data: courses = [] } = useMyCoursesQuery();
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useStudentProfilesQuery();
  const { data: teachers = [] } = useTeacherProfilesQuery();
  const { data: assignments = [] } = useMentorAssignmentsQuery();
  const { data: mentorQuestions = [] } = useMentorQuestionsQuery();
  const { data: quizResults = [] } = useQuizResultsQuery(quizCourseFilter || undefined);
  const filteredQuizResults = onlyWeakResults ? quizResults.filter((item) => item.percent < 50) : quizResults;
  const { data: mentorSettings } = useMentorDistributionSettingsQuery();
  const [createCourse, { isLoading }] = useCreateCourseMutation();
  const [createLesson] = useCreateLessonMutation();

  const handleCreateCourse = async (values: { title: string; description: string }) => {
    try {
      await createCourse(values).unwrap();
      toast.success("Курс создан");
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка создания курса";
      toast.error(message);
    }
  };

  const handleImportLandingCourses = async () => {
    try {
      setImporting(true);
      const existingTitles = new Set(courses.map((course) => course.title.trim().toLowerCase()));
      let createdCourses = 0;
      let createdLessons = 0;

      for (const seedCourse of LANDING_COURSES) {
        if (existingTitles.has(seedCourse.title.trim().toLowerCase())) {
          continue;
        }

        const createdCourse = await createCourse({
          title: seedCourse.title,
          description: seedCourse.description
        }).unwrap();
        createdCourses += 1;

        for (let index = 0; index < seedCourse.lessons.length; index += 1) {
          const lessonTitle = seedCourse.lessons[index];
          await createLesson({
            courseId: createdCourse.id,
            title: lessonTitle,
            contentType: "video",
            textContent: `Видео-урок курса «${seedCourse.title}».`,
            videoUrl: DEFAULT_VIDEO_URL,
            orderIndex: index + 1,
            published: true
          }).unwrap();
          createdLessons += 1;
        }
      }

      if (!createdCourses) {
        toast.info("Курсы из лендинга уже добавлены");
        return;
      }

      toast.success(`Импорт завершён: ${createdCourses} курсов и ${createdLessons} уроков`);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка импорта курсов";
      toast.error(message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={2.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Кабинет директора</Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" onClick={handleImportLandingCourses} disabled={importing || isLoading}>
                Импортировать курсы с лендинга
              </Button>
              <Button variant="contained" onClick={() => setOpen(true)}>
                Новый курс
              </Button>
            </Stack>
          </Stack>
          <CourseList courses={courses} role="director" />
          {studentsLoading ? (
            <Typography color="text.secondary">Загрузка сегментации студентов...</Typography>
          ) : (
            <StudentReligionGroups
              students={students}
              teachers={teachers}
              assignments={assignments}
              canAssignMentor
              title="Студенты и распределение по преподавателям"
            />
          )}
          {studentsError && <Alert severity="error">Не удалось загрузить студентов.</Alert>}
          <MentorAssignmentManager students={students} teachers={teachers} assignments={assignments} settings={mentorSettings} />
          <Stack spacing={1.25} sx={{ p: 2, border: "1px solid #e8e0d8", borderRadius: 1.5 }}>
            <Typography variant="h6">Результаты тестов студентов</Typography>
            <TextField
              select
              size="small"
              label="Фильтр по курсу"
              value={quizCourseFilter}
              onChange={(event) => setQuizCourseFilter(event.target.value)}
              sx={{ maxWidth: 360 }}
            >
              <MenuItem value="">Все курсы</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={course.id}>
                  {course.title}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={<Switch checked={onlyWeakResults} onChange={(_, checked) => setOnlyWeakResults(checked)} />}
              label="Только слабые результаты (ниже 50%)"
            />
            <QuizResultsTable items={filteredQuizResults} />
          </Stack>
          <Stack spacing={1.25} sx={{ p: 2, border: "1px solid #e8e0d8", borderRadius: 1.5 }}>
            <Typography variant="h6">Мониторинг общения наставников</Typography>
            {!mentorQuestions.length && (
              <Typography color="text.secondary">Вопросов от студентов пока нет.</Typography>
            )}
            {mentorQuestions.slice(0, 12).map((question) => (
              <Stack key={question.id} spacing={0.5} sx={{ borderBottom: "1px solid #eee", pb: 1 }}>
                <Typography>{question.questionText}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Статус: {question.status === "new" ? "Новый" : "Отвечен"}
                </Typography>
                {question.answerText && (
                  <Typography variant="body2" color="text.secondary">
                    Ответ: {question.answerText}
                  </Typography>
                )}
              </Stack>
            ))}
          </Stack>
          <CreateCourseDialog open={open} onClose={() => setOpen(false)} onCreate={handleCreateCourse} loading={isLoading} />
        </Stack>
      </PageShell>
    </>
  );
};
