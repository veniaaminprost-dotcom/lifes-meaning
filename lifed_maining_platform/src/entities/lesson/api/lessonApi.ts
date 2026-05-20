import { supabase } from "@/shared/api/supabaseClient";
import type { Lesson } from "@/shared/types";

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

export const fetchLessonsByCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapLesson);
};

export const createLesson = async (payload: {
  courseId: string;
  title: string;
  contentType: Lesson["contentType"];
  textContent?: string | null;
  videoUrl?: string | null;
  orderIndex?: number;
  published?: boolean;
}) => {
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      course_id: payload.courseId,
      title: payload.title,
      content_type: payload.contentType,
      text_content: payload.textContent ?? null,
      video_url: payload.videoUrl ?? null,
      order_index: payload.orderIndex ?? 1,
      published: payload.published ?? false
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapLesson(data);
};

export const updateLesson = async (
  lessonId: string,
  payload: {
    title?: string;
    contentType?: Lesson["contentType"];
    textContent?: string | null;
    videoUrl?: string | null;
    published?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from("lessons")
    .update({
      title: payload.title,
      content_type: payload.contentType,
      text_content: payload.textContent,
      video_url: payload.videoUrl,
      published: payload.published
    })
    .eq("id", lessonId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapLesson(data);
};

export const updateLessonOrder = async (lessonId: string, orderIndex: number) => {
  const { error } = await supabase.from("lessons").update({ order_index: orderIndex }).eq("id", lessonId);

  if (error) {
    throw error;
  }
};
