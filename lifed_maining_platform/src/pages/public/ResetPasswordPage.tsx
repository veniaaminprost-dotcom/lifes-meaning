import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { PageShell } from "@/shared/ui/PageShell";
import { supabase } from "@/app/providers/supabase";

const schema = z
  .object({
    password: z.string().min(8, "Минимум 8 символов"),
    confirmPassword: z.string().min(8, "Подтвердите пароль")
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"]
  });

type FormValues = z.infer<typeof schema>;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Пароль обновлён. Теперь можно войти.");
    navigate("/login", { replace: true });
  };

  return (
    <PageShell maxWidth="sm">
      <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h4">Новый пароль</Typography>
        <Alert severity="info">
          Если вы перешли по ссылке из письма Supabase, задайте новый пароль и затем войдите в систему.
        </Alert>
        <TextField
          label="Новый пароль"
          type="password"
          {...register("password")}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
        />
        <TextField
          label="Повторите пароль"
          type="password"
          {...register("confirmPassword")}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Сохранить новый пароль
        </Button>
        <Button component={Link} to="/login" variant="text">
          Вернуться ко входу
        </Button>
      </Stack>
    </PageShell>
  );
};
