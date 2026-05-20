import { supabase } from "@/shared/api/supabaseClient";
import type { ChristianBranch, Gender, MessengerType, Profile, ReligionRelation, UserRole } from "@/shared/types";

const mapProfile = (data: any): Profile => ({
  userId: data.user_id,
  role: data.role,
  displayName: data.display_name,
  gender: data.gender ?? "unknown",
  phone: data.phone,
  messengerType: data.messenger_type,
  messengerContact: data.messenger_contact,
  religionRelation: data.religion_relation,
  christianBranch: data.christian_branch,
  christianConfession: data.christian_confession,
  religionOther: data.religion_other,
  createdAt: data.created_at
});

export const getMyProfile = async (): Promise<Profile | null> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!userData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapProfile(data);
};

export const createProfile = async (input: {
  userId: string;
  displayName: string;
  role?: UserRole;
  gender?: Gender;
  phone?: string | null;
  messengerType?: MessengerType | null;
  messengerContact?: string | null;
  religionRelation?: ReligionRelation | null;
  christianBranch?: ChristianBranch | null;
  christianConfession?: string | null;
  religionOther?: string | null;
}) => {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: input.userId,
        display_name: input.displayName,
        role: input.role ?? "student",
        gender: input.gender ?? "unknown",
        phone: input.phone ?? null,
        messenger_type: input.messengerType ?? null,
        messenger_contact: input.messengerContact ?? null,
        religion_relation: input.religionRelation ?? null,
        christian_branch: input.christianBranch ?? null,
        christian_confession: input.christianConfession ?? null,
        religion_other: input.religionOther ?? null
      },
      { onConflict: "user_id" }
    );

  if (error) {
    throw error;
  }
};

export const fetchStudentProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapProfile);
};

export const fetchTeacherProfiles = async (): Promise<Profile[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapProfile);
};
