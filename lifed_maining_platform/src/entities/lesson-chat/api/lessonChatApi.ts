import { supabase } from "@/shared/api/supabaseClient";
import type { LessonChatMessage } from "@/shared/types";

const mapMessage = (row: any, profileMap: Map<string, string>): LessonChatMessage => ({
  id: row.id,
  lessonId: row.lesson_id,
  courseId: row.course_id,
  studentId: row.student_id,
  mentorId: row.mentor_id,
  authorId: row.author_id,
  authorName: profileMap.get(row.author_id) ?? "Участник",
  messageText: row.message_text,
  createdAt: row.created_at
});

export const fetchLessonChatMessages = async (payload: {
  lessonId: string;
  studentId?: string | null;
}): Promise<LessonChatMessage[]> => {
  let query = supabase
    .from("lesson_chat_messages")
    .select("*")
    .eq("lesson_id", payload.lessonId)
    .order("created_at", { ascending: true });

  if (payload.studentId) {
    query = query.eq("student_id", payload.studentId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const authorIds = Array.from(new Set(rows.map((row) => row.author_id as string)));
  const { data: profiles, error: profilesError } = authorIds.length
    ? await supabase.from("profiles").select("user_id,display_name").in("user_id", authorIds)
    : { data: [], error: null };

  if (profilesError) {
    throw profilesError;
  }

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id as string, profile.display_name as string]));
  return rows.map((row) => mapMessage(row, profileMap));
};

export const sendLessonChatMessage = async (payload: {
  lessonId: string;
  courseId: string;
  studentId: string;
  mentorId: string;
  messageText: string;
}): Promise<LessonChatMessage> => {
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
    .from("lesson_chat_messages")
    .insert({
      lesson_id: payload.lessonId,
      course_id: payload.courseId,
      student_id: payload.studentId,
      mentor_id: payload.mentorId,
      author_id: user.id,
      message_text: payload.messageText.trim()
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapMessage(data, new Map([[user.id, "Вы"]]));
};
