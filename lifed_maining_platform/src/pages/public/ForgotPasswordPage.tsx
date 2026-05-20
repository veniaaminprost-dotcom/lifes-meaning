import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PageShell } from "@/shared/ui/PageShell";
import { supabase } from "@/app/providers/supabase";

const schema = z.object({
  email: z.string().email("Введите корректный email")
});

type FormValues = z.infer<typeof schema>;

export const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Письмо для восстановления отправлено");
  };

  return (
    <PageShell maxWidth="sm">
      <Stack spacing={2} component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h4">Восстановление пароля</Typography>
        <TextField label="Email" {...register("email")} error={Boolean(errors.email)} helperText={errors.email?.message} />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Отправить ссылку
        </Button>
      </Stack>
    </PageShell>
  );
};
