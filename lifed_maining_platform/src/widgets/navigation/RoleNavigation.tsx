import { AppBar, Box, Button, Menu, MenuItem, Stack, Toolbar } from "@mui/material";
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/app/providers/supabase";
import { useAppDispatch, useAppSelector } from "@/shared/lib/hooks";
import { signOutState } from "@/entities/auth/model/sessionSlice";
import { selectRole } from "@/entities/auth/model/selectors";
import { BrandLockup } from "@/shared/ui/BrandLockup";
import { roleLabels, roleViewOptions } from "@/shared/lib/rbac";
import type { UserRole } from "@/shared/types";

export const RoleNavigation = () => {
  const role = useAppSelector(selectRole);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null);
  const roleMenuOpen = Boolean(roleMenuAnchor);
  const viewRole = useMemo(() => {
    const pathRole = location.pathname.split("/").filter(Boolean)[0];
    return pathRole && pathRole in roleLabels ? (pathRole as UserRole) : role;
  }, [location.pathname, role]);
  const switchOptions = role ? roleViewOptions[role] : [];
  const canSwitchRole = switchOptions.length > 0;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    dispatch(signOutState());
    navigate("/login", { replace: true });
  };

  const roleLabel = role && viewRole && role !== viewRole
    ? `${roleLabels[role]} -> ${roleLabels[viewRole]}`
    : role
      ? `Статус: ${roleLabels[role]}`
      : "Статус";

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #e8e0d8" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <BrandLockup size="md" />
          </Box>
          <Box sx={{ display: { xs: "block", sm: "none" } }}>
            <BrandLockup size="sm" withText={false} />
          </Box>
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button component={Link} to="/vitrina" color="primary" variant="text">
            Витрина
          </Button>
          {role && (
            <Button component={Link} to={`/${role}`} color="primary" variant="outlined">
              Кабинет
            </Button>
          )}
          <Button
            color="primary"
            disabled={!canSwitchRole}
            variant="outlined"
            onClick={(event) => setRoleMenuAnchor(event.currentTarget)}
            sx={{ minWidth: 150, textTransform: "none" }}
          >
            {roleLabel}
          </Button>
          <Menu anchorEl={roleMenuAnchor} open={roleMenuOpen} onClose={() => setRoleMenuAnchor(null)}>
            {switchOptions.map((option) => (
              <MenuItem
                key={option}
                selected={option === viewRole}
                onClick={() => {
                  setRoleMenuAnchor(null);
                  navigate(`/${option}`);
                }}
              >
                Смотреть как {roleLabels[option].toLowerCase()}
              </MenuItem>
            ))}
          </Menu>
          <Button onClick={handleSignOut} color="primary" variant="contained">
            Выйти
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
