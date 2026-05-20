import { supabase } from "@/shared/api/supabaseClient";
import type { Invitation } from "@/shared/types";

const mapInvitation = (row: any): Invitation => ({
  id: row.id,
  token: row.token,
  courseId: row.course_id,
  createdBy: row.created_by,
  expiresAt: row.expires_at,
  maxUses: row.max_uses,
  usedCount: row.used_count,
  createdAt: row.created_at
});

export const fetchInvitationsByCourse = async (courseId: string) => {
  const { data, error } = await supabase.from("invitations").select("*").eq("course_id", courseId);

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapInvitation);
};

export const createInvitation = async (payload: { courseId: string; expiresAt?: string | null; maxUses?: number | null }) => {
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      course_id: payload.courseId,
      expires_at: payload.expiresAt ?? null,
      max_uses: payload.maxUses ?? null
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapInvitation(data);
};

export const acceptInvitation = async (token: string) => {
  const { data, error } = await supabase.rpc("accept_invitation", { token_input: token });

  if (error) {
    throw error;
  }

  return data;
};
