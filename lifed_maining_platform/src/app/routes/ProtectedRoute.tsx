import { Navigate, Outlet, useLocation } from "react-router-dom";
import { CircularProgress, Stack } from "@mui/material";
import { useAppSelector } from "@/shared/lib/hooks";
import { selectIsInitialized, selectRole, selectSession } from "@/entities/auth/model/selectors";
import { firstAllowedViewRole, hasRoleAccess } from "@/shared/lib/rbac";
import type { UserRole } from "@/shared/types";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const session = useAppSelector(selectSession);
  const initialized = useAppSelector(selectIsInitialized);
  const role = useAppSelector(selectRole);

  if (!initialized) {
    return (
      <Stack minHeight="50vh" alignItems="center" justifyContent="center">
        <CircularProgress color="primary" />
      </Stack>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !hasRoleAccess(role, allowedRoles) && !firstAllowedViewRole(role, allowedRoles)) {
    return <Navigate to={`/${role ?? "student"}`} replace />;
  }

  return <Outlet />;
};
