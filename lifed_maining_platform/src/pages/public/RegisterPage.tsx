import { Link as MuiLink, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthForm, type AuthFormValues } from "@/features/auth/ui/AuthForm";
import { createProfile } from "@/entities/profile/api/profileApi";
import { supabase } from "@/app/providers/supabase";
import { PageShell } from "@/shared/ui/PageShell";
import { BrandLockup } from "@/shared/ui/BrandLockup";

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegister = async (values: AuthFormValues) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user && data.session) {
        const religionRelation = values.religionRelation ?? null;
        const christianBranch =
          religionRelation === "christian" ? values.christianBranch ?? null : null;
        const christianConfession =
          religionRelation === "christian" && christianBranch === "protestant"
            ? values.christianConfession?.trim() || null
            : null;
        const religionOther =
          religionRelation === "other" ? values.religionOther?.trim() || null : null;

        await createProfile({
          userId: data.user.id,
          displayName: values.displayName || values.email,
          role: "student",
          gender: values.gender ?? "unknown",
          phone: values.phone ?? null,
          messengerType: values.messengerType ?? null,
          messengerContact: values.messengerContact ?? null,
          religionRelation,
          christianBranch,
          christianConfession,
          religionOther
        });
      }

      if (data.session) {
        toast.success("Аккаунт создан. Теперь войдите в систему.");
      } else {
        toast.success("Аккаунт создан. Подтвердите email, затем войдите в систему.");
      }
      navigate("/login", { replace: true, state: location.state });
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Ошибка регистрации";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell maxWidth="sm">
      <Stack spacing={2}>
        <BrandLockup size="md" />
        <Typography variant="h4">Регистрация</Typography>
        <AuthForm mode="register" loading={loading} error={error} onSubmit={handleRegister} />
        <MuiLink component={Link} to="/login">Уже есть аккаунт? Войти</MuiLink>
        <MuiLink component={Link} to="/vitrina">Посмотреть витрину курсов</MuiLink>
      </Stack>
    </PageShell>
  );
};
