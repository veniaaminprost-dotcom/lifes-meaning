import { supabase } from "@/shared/api/supabaseClient";
import type { Submission, SubmissionStatus } from "@/shared/types";

const mapSubmission = (row: any): Submission => ({
  id: row.id,
  lessonId: row.lesson_id,
  courseId: row.course_id,
  studentId: row.student_id,
  textAnswer: row.text_answer,
  filePaths: row.file_paths ?? [],
  status: row.status,
  teacherComment: row.teacher_comment,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const fetchSubmissionsByCourse = async (courseId: string) => {
  const { data, error } = await supabase.from("submissions").select("*").eq("course_id", courseId);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapSubmission);
};

export const createSubmission = async (payload: {
  lessonId: string;
  courseId: string;
  textAnswer: string;
  filePaths?: string[];
}) => {
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      lesson_id: payload.lessonId,
      course_id: payload.courseId,
      text_answer: payload.textAnswer,
      file_paths: payload.filePaths ?? []
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapSubmission(data);
};

export const reviewSubmission = async (payload: { id: string; status: SubmissionStatus; teacherComment: string | null }) => {
  const { data, error } = await supabase
    .from("submissions")
    .update({ status: payload.status, teacher_comment: payload.teacherComment })
    .eq("id", payload.id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapSubmission(data);
};
