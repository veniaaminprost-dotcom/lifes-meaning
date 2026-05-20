import { supabase } from "@/shared/api/supabaseClient";
import type { Course } from "@/shared/types";

const mapCourse = (data: any): Course => ({
  id: data.id,
  title: data.title,
  description: data.description,
  cover: data.cover,
  createdBy: data.created_by,
  createdAt: data.created_at,
  archivedAt: data.archived_at
});

export const fetchMyCourses = async () => {
  const { data, error } = await supabase.rpc("get_my_courses");

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapCourse);
};

export const createCourse = async (payload: { title: string; description: string; cover?: string | null }) => {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: payload.title,
      description: payload.description,
      cover: payload.cover ?? null
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapCourse(data);
};

export const updateCourse = async (
  courseId: string,
  payload: { title?: string; description?: string; cover?: string | null; archivedAt?: string | null }
) => {
  const { data, error } = await supabase
    .from("courses")
    .update({
      title: payload.title,
      description: payload.description,
      cover: payload.cover,
      archived_at: payload.archivedAt
    })
    .eq("id", courseId)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapCourse(data);
};

export const assignTeacher = async (courseId: string, teacherId: string) => {
  const { error } = await supabase.from("course_teachers").upsert({
    course_id: courseId,
    teacher_id: teacherId
  });

  if (error) {
    throw error;
  }
};
