import { env } from "@/shared/config/env";
import { getCourseSlug } from "@/shared/lib/courseShowcase";
import type { Course, Lesson } from "@/shared/types";

export interface ShowcaseCourse extends Course {
  slug: string;
  lessons: Lesson[];
}

const mapCourse = (data: any): Course => ({
  id: data.id,
  title: data.title,
  description: data.description,
  cover: data.cover,
  createdBy: data.created_by,
  createdAt: data.created_at,
  archivedAt: data.archived_at
});

const mapLesson = (row: any): Lesson => ({
  id: row.id,
  courseId: row.course_id,
  title: row.title,
  contentType: row.content_type,
  textContent: row.text_content,
  videoUrl: row.video_url,
  orderIndex: row.order_index,
  published: row.published,
  createdAt: row.created_at
});

const REQUEST_TIMEOUT_MS = 10000;

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
};

const fetchWithTimeout = async (input: string, init: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Время ожидания ответа от Supabase истекло");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const getHeaders = () => ({
  apikey: env.supabaseAnonKey,
  Authorization: `Bearer ${env.supabaseAnonKey}`
});

const fetchCourses = async (): Promise<Course[]> => {
  const url = `${env.supabaseUrl}/rest/v1/courses?select=*&archived_at=is.null&order=created_at.asc`;
  const response = await fetchWithTimeout(url, { headers: getHeaders() });
  const rows = await parseResponse<any[]>(response);
  return rows.map(mapCourse);
};

const fetchPublishedLessons = async (): Promise<Lesson[]> => {
  const url = `${env.supabaseUrl}/rest/v1/lessons?select=*&published=eq.true&order=course_id.asc,order_index.asc`;
  const response = await fetchWithTimeout(url, { headers: getHeaders() });
  const rows = await parseResponse<any[]>(response);
  return rows.map(mapLesson);
};

export const fetchShowcaseCourses = async (): Promise<ShowcaseCourse[]> => {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Не заполнены VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY");
  }

  const [courses, lessons] = await Promise.all([fetchCourses(), fetchPublishedLessons()]);
  const lessonsMap = new Map<string, Lesson[]>();

  for (const lesson of lessons) {
    const current = lessonsMap.get(lesson.courseId) ?? [];
    current.push(lesson);
    lessonsMap.set(lesson.courseId, current);
  }

  return courses.map((course) => ({
    ...course,
    slug: getCourseSlug(course.title),
    lessons: lessonsMap.get(course.id) ?? []
  }));
};

export const fetchShowcaseCourseBySlug = async (slug: string): Promise<ShowcaseCourse | null> => {
  const courses = await fetchShowcaseCourses();
  return courses.find((course) => course.slug === slug) ?? null;
};
