import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { useState } from "react";
import type { SubmissionStatus } from "@/shared/types";

interface SubmissionReviewFormProps {
  initialStatus: SubmissionStatus;
  initialComment?: string | null;
  loading?: boolean;
  onSubmit: (status: SubmissionStatus, teacherComment: string | null) => Promise<void>;
}

export const SubmissionReviewForm = ({
  initialStatus,
  initialComment,
  loading,
  onSubmit
}: SubmissionReviewFormProps) => {
  const [status, setStatus] = useState<SubmissionStatus>(initialStatus);
  const [comment, setComment] = useState(initialComment ?? "");

  return (
    <Stack spacing={1.5}>
      <TextField select value={status} onChange={(event) => setStatus(event.target.value as SubmissionStatus)} size="small">
        <MenuItem value="submitted">На проверке</MenuItem>
        <MenuItem value="approved">Принято</MenuItem>
        <MenuItem value="needs_work">Нужна доработка</MenuItem>
      </TextField>
      <TextField size="small" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Комментарий" />
      <Button variant="outlined" disabled={loading} onClick={() => onSubmit(status, comment || null)}>
        Обновить
      </Button>
    </Stack>
  );
};
