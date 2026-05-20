import { supabase } from "@/shared/api/supabaseClient";
import type { LessonQuiz, LessonQuizQuestion, LessonQuizResult, LessonQuizSubmission } from "@/shared/types";

const sanitizeItems = (items: unknown): LessonQuizQuestion[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const candidate = item as {
        id?: unknown;
        text?: unknown;
        options?: Array<{ id?: unknown; text?: unknown; isCorrect?: unknown }>;
      };
      if (typeof candidate.id !== "string" || typeof candidate.text !== "string" || !Array.isArray(candidate.options)) {
        return null;
      }
      const options = candidate.options
        .map((option) => {
          if (!option || typeof option !== "object") return null;
          if (typeof option.id !== "string" || typeof option.text !== "string" || typeof option.isCorrect !== "boolean") {
            return null;
          }
          return { id: option.id, text: option.text, isCorrect: option.isCorrect };
        })
        .filter((option): option is { id: string; text: string; isCorrect: boolean } => Boolean(option));
      return { id: candidate.id, text: candidate.text, options };
    })
    .filter((item): item is LessonQuizQuestion => Boolean(item));
};

export const fetchLessonQuiz = async (lessonId: string): Promise<LessonQuiz | null> => {
  const { data, error } = await supabase.from("lesson_quizzes").select("*").eq("lesson_id", lessonId).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    lessonId: data.lesson_id,
    items: sanitizeItems(data.items),
    updatedAt: data.updated_at
  };
};

export const saveLessonQuiz = async (lessonId: string, items: LessonQuizQuestion[]): Promise<LessonQuiz> => {
  const { data, error } = await supabase
    .from("lesson_quizzes")
    .upsert({ lesson_id: lessonId, items }, { onConflict: "lesson_id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    lessonId: data.lesson_id,
    items: sanitizeItems(data.items),
    updatedAt: data.updated_at
  };
};

export const submitLessonQuiz = async (payload: {
  lessonId: string;
  answers: Record<string, string>;
  score: number;
  total: number;
}): Promise<LessonQuizSubmission> => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("Нужна авторизация");
  }

  const { data, error } = await supabase
    .from("lesson_quiz_submissions")
    .upsert(
      {
        lesson_id: payload.lessonId,
        student_id: user.id,
        answers: payload.answers,
        score: payload.score,
        total: payload.total
      },
      { onConflict: "lesson_id,student_id" }
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    lessonId: data.lesson_id,
    studentId: data.student_id,
    answers: (data.answers as Record<string, string>) ?? {},
    score: data.score,
    total: data.total,
    updatedAt: data.updated_at
  };
};

export const fetchMyLessonQuizSubmission = async (lessonId: string): Promise<LessonQuizSubmission | null> => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("lesson_quiz_submissions")
    .select("*")
    .eq("lesson_id", lessonId)
    .eq("student_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    lessonId: data.lesson_id,
    studentId: data.student_id,
    answers: (data.answers as Record<string, string>) ?? {},
    score: data.score,
    total: data.total,
    updatedAt: data.updated_at
  };
};

export const fetchLessonQuizResults = async (courseId?: string): Promise<LessonQuizResult[]> => {
  let lessonIdsFilter: string[] | null = null;

  if (courseId) {
    const { data: lessonsForCourse, error: lessonsForCourseError } = await supabase
      .from("lessons")
      .select("id")
      .eq("course_id", courseId);

    if (lessonsForCourseError) {
      throw lessonsForCourseError;
    }

    lessonIdsFilter = (lessonsForCourse ?? []).map((lesson) => lesson.id as string);
    if (!lessonIdsFilter.length) {
      return [];
    }
  }

  let query = supabase.from("lesson_quiz_submissions").select("*").order("updated_at", { ascending: false });
  if (lessonIdsFilter) {
    query = query.in("lesson_id", lessonIdsFilter);
  }

  const { data: submissions, error: submissionsError } = await query;
  if (submissionsError) {
    throw submissionsError;
  }

  const rows = submissions ?? [];
  if (!rows.length) {
    return [];
  }

  const lessonIds = Array.from(new Set(rows.map((row) => row.lesson_id as string)));
  const studentIds = Array.from(new Set(rows.map((row) => row.student_id as string)));

  const [{ data: lessons, error: lessonsError }, { data: students, error: studentsError }] = await Promise.all([
    supabase.from("lessons").select("id,title,course_id").in("id", lessonIds),
    supabase.from("profiles").select("user_id,display_name").in("user_id", studentIds)
  ]);

  if (lessonsError) {
    throw lessonsError;
  }

  if (studentsError) {
    throw studentsError;
  }

  const lessonMap = new Map((lessons ?? []).map((lesson) => [lesson.id as string, lesson]));
  const studentMap = new Map((students ?? []).map((student) => [student.user_id as string, student]));

  return rows
    .map((row) => {
      const lesson = lessonMap.get(row.lesson_id as string);
      if (!lesson) {
        return null;
      }

      const student = studentMap.get(row.student_id as string);
      const score = Number(row.score ?? 0);
      const total = Number(row.total ?? 0);
      const percent = total > 0 ? Math.round((score / total) * 100) : 0;

      return {
        lessonId: row.lesson_id as string,
        lessonTitle: (lesson.title as string) ?? "Урок",
        courseId: lesson.course_id as string,
        studentId: row.student_id as string,
        studentName: (student?.display_name as string) ?? (row.student_id as string).slice(0, 8),
        score,
        total,
        percent,
        updatedAt: row.updated_at as string
      } as LessonQuizResult;
    })
    .filter((item): item is LessonQuizResult => Boolean(item));
};
