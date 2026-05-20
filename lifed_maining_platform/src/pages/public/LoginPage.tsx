import { Alert, Link as MuiLink, Stack, Typography } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { AuthForm, type AuthFormValues } from "@/features/auth/ui/AuthForm";
import { PageShell } from "@/shared/ui/PageShell";
import { supabase } from "@/app/providers/supabase";
import { createProfile, getMyProfile } from "@/entities/profile/api/profileApi";
import { BrandLockup } from "@/shared/ui/BrandLockup";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: AuthFormValues) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });

      if (loginError) {
        throw loginError;
      }

      let profile = await getMyProfile();

      // If signup required email confirmation, profile may not exist at first login.
      if (!profile && data.user) {
        try {
          await createProfile({
            userId: data.user.id,
            displayName: data.user.email ?? values.email,
            role: "student",
            gender: "unknown"
          });
        } catch {
          // Ignore: profile could be created in parallel in another tab/device.
        }
        profile = await getMyProfile();
      }

      const destination = location.state?.from?.pathname ?? `/${profile?.role ?? "student"}`;
      toast.success("Вход выполнен");
      navigate(destination, { replace: true });
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка входа";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell maxWidth="sm">
      <Stack spacing={2}>
        <BrandLockup size="md" />
        <Typography variant="h4">Вход в «Жизни Смысл»</Typography>
        <Typography color="text.secondary">Доступ к курсам только по приглашению.</Typography>
        <AuthForm mode="login" onSubmit={handleLogin} loading={loading} error={error} />
        <MuiLink component={Link} to="/register">Нет аккаунта? Зарегистрироваться</MuiLink>
        <MuiLink component={Link} to="/vitrina">Посмотреть витрину курсов</MuiLink>
        <MuiLink component={Link} to="/forgot-password">Забыли пароль?</MuiLink>
        <Alert severity="info">После входа вы попадёте в кабинет по вашей роли.</Alert>
      </Stack>
    </PageShell>
  );
};
