import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3, "Введите название"),
  description: z.string().min(10, "Добавьте описание")
});

type FormValues = z.infer<typeof schema>;

interface CreateCourseDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onCreate: (values: FormValues) => Promise<void>;
}

export const CreateCourseDialog = ({ open, loading, onClose, onCreate }: CreateCourseDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const submit = async (values: FormValues) => {
    await onCreate(values);
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Новый курс</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Название" {...register("title")} error={Boolean(errors.title)} helperText={errors.title?.message} />
          <TextField
            multiline
            minRows={4}
            label="Описание"
            {...register("description")}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit(submit)} disabled={loading}>
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
};
