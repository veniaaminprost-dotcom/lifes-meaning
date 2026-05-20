import { supabase } from "@/shared/api/supabaseClient";
import type { MentorAssignment, MentorQuestion, Profile } from "@/shared/types";

const mapAssignment = (row: any): MentorAssignment => ({
  studentId: row.student_id,
  mentorId: row.mentor_id,
  assignedBy: row.assigned_by,
  assignmentMode: row.assignment_mode,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const mapQuestion = (row: any): MentorQuestion => ({
  id: row.id,
  studentId: row.student_id,
  mentorId: row.mentor_id,
  courseId: row.course_id,
  lessonId: row.lesson_id,
  questionText: row.question_text,
  answerText: row.answer_text,
  status: row.status,
  createdAt: row.created_at,
  answeredAt: row.answered_at
});

const mapProfile = (row: any): Profile => ({
  userId: row.user_id,
  role: row.role,
  displayName: row.display_name,
  gender: row.gender ?? "unknown",
  phone: row.phone,
  messengerType: row.messenger_type,
  messengerContact: row.messenger_contact,
  religionRelation: row.religion_relation,
  christianBranch: row.christian_branch,
  christianConfession: row.christian_confession,
  religionOther: row.religion_other,
  createdAt: row.created_at
});

export const getMyMentorAssignment = async (): Promise<MentorAssignment | null> => {
  const { data, error } = await supabase.from("mentor_assignments").select("*").maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapAssignment(data);
};

export const getMentorProfileByStudent = async (): Promise<Profile | null> => {
  const assignment = await getMyMentorAssignment();
  if (!assignment) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", assignment.mentorId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfile(data) : null;
};

export const createMentorQuestion = async (payload: {
  courseId?: string | null;
  lessonId?: string | null;
  questionText: string;
}) => {
  const assignment = await getMyMentorAssignment();
  if (!assignment) {
    throw new Error("Ментор пока не назначен. Обратитесь к директору.");
  }

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
    .from("mentor_questions")
    .insert({
      student_id: user.id,
      mentor_id: assignment.mentorId,
      course_id: payload.courseId ?? null,
      lesson_id: payload.lessonId ?? null,
      question_text: payload.questionText.trim(),
      status: "new"
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapQuestion(data);
};

export const fetchMyMentorQuestions = async (): Promise<MentorQuestion[]> => {
  const { data, error } = await supabase.from("mentor_questions").select("*").order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []).map(mapQuestion);
};

export const fetchMentorQuestions = async (): Promise<MentorQuestion[]> => {
  const { data, error } = await supabase.from("mentor_questions").select("*").order("created_at", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []).map(mapQuestion);
};

export const answerMentorQuestion = async (id: string, answerText: string) => {
  const { data, error } = await supabase
    .from("mentor_questions")
    .update({
      answer_text: answerText.trim(),
      status: "answered",
      answered_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapQuestion(data);
};

export const fetchMyAssignedStudents = async (): Promise<Profile[]> => {
  const { data: assignments, error: assignmentsError } = await supabase.from("mentor_assignments").select("student_id");
  if (assignmentsError) {
    throw assignmentsError;
  }

  const studentIds = (assignments ?? []).map((item) => item.student_id as string);
  if (!studentIds.length) {
    return [];
  }

  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("user_id", studentIds);
  if (profilesError) {
    throw profilesError;
  }

  return (profiles ?? []).map(mapProfile);
};

export const fetchMentorAssignments = async (): Promise<MentorAssignment[]> => {
  const { data, error } = await supabase.from("mentor_assignments").select("*").order("updated_at", { ascending: false });
  if (error) {
    throw error;
  }
  return (data ?? []).map(mapAssignment);
};

export const upsertMentorAssignment = async (payload: {
  studentId: string;
  mentorId: string;
  assignmentMode?: "manual" | "auto";
}) => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const { data, error } = await supabase
    .from("mentor_assignments")
    .upsert({
      student_id: payload.studentId,
      mentor_id: payload.mentorId,
      assigned_by: user?.id ?? null,
      assignment_mode: payload.assignmentMode ?? "manual"
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapAssignment(data);
};

export const getMentorDistributionSettings = async (): Promise<{ enabled: boolean; preferGender: boolean }> => {
  const { data, error } = await supabase
    .from("mentor_distribution_settings")
    .select("enabled,prefer_gender")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    enabled: data?.enabled ?? false,
    preferGender: data?.prefer_gender ?? true
  };
};

export const updateMentorDistributionSettings = async (payload: { enabled: boolean; preferGender: boolean }) => {
  const { error } = await supabase
    .from("mentor_distribution_settings")
    .update({
      enabled: payload.enabled,
      prefer_gender: payload.preferGender,
      updated_at: new Date().toISOString()
    })
    .eq("id", true);
  if (error) {
    throw error;
  }
};
