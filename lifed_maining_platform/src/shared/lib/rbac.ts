import type { UserRole } from "@/shared/types";

export const roleLabels: Record<UserRole, string> = {
  admin: "Админ",
  director: "Директор",
  editor: "Редактор",
  teacher: "Преподаватель",
  student: "Студент"
};

export const roleViewOptions: Record<UserRole, UserRole[]> = {
  student: [],
  teacher: ["teacher", "student"],
  admin: ["admin", "student", "teacher", "editor"],
  editor: ["editor", "teacher", "student"],
  director: ["director", "admin", "editor", "teacher", "student"]
};

export const hasRoleAccess = (userRole: UserRole | null, allowedRoles: UserRole[]) => {
  if (!userRole) {
    return false;
  }

  return allowedRoles.includes(userRole);
};

export const canViewAsRole = (actualRole: UserRole | null, targetRole: UserRole) => {
  if (!actualRole) {
    return false;
  }

  return actualRole === targetRole || roleViewOptions[actualRole].includes(targetRole);
};

export const firstAllowedViewRole = (actualRole: UserRole | null, allowedRoles: UserRole[]) =>
  allowedRoles.find((role) => canViewAsRole(actualRole, role)) ?? null;
