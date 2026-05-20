import { supabase } from "@/shared/api/supabaseClient";
import type { Enrollment } from "@/shared/types";

export const fetchMyEnrollments = async (): Promise<Enrollment[]> => {
  const { data, error } = await supabase.from("enrollments").select("*");

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    userId: row.user_id,
    courseId: row.course_id,
    joinedAt: row.joined_at
  }));
};

export const enrollInCourse = async (courseId: string): Promise<Enrollment> => {
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
    .from("enrollments")
    .insert({
      user_id: user.id,
      course_id: courseId
    })
    .select("*")
    .single();

  if (!error && data) {
    return {
      userId: data.user_id,
      courseId: data.course_id,
      joinedAt: data.joined_at
    };
  }

  // Already enrolled: unique conflict. Read existing row.
  if (error && (error as { code?: string }).code === "23505") {
    const { data: existing, error: existingError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single();

    if (existingError) {
      throw existingError;
    }

    return {
      userId: existing.user_id,
      courseId: existing.course_id,
      joinedAt: existing.joined_at
    };
  }

  throw error;
};
