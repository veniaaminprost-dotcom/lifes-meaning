import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { SubmissionReviewForm } from "@/features/submission-review/ui/SubmissionReviewForm";
import type { Submission, SubmissionStatus } from "@/shared/types";

interface SubmissionsTableProps {
  items: Submission[];
  loading?: boolean;
  onReview: (id: string, status: SubmissionStatus, comment: string | null) => Promise<void>;
}

export const SubmissionsTable = ({ items, loading, onReview }: SubmissionsTableProps) => {
  if (!items.length) {
    return <Typography color="text.secondary">Домашние задания ещё не отправляли.</Typography>;
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Студент</TableCell>
            <TableCell>Ответ</TableCell>
            <TableCell>Статус</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{submission.studentId.slice(0, 8)}</TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography>{submission.textAnswer}</Typography>
                  {submission.filePaths.map((filePath) => (
                    <Typography key={filePath} color="text.secondary" fontSize={12}>
                      {filePath}
                    </Typography>
                  ))}
                </Stack>
              </TableCell>
              <TableCell sx={{ minWidth: 230 }}>
                <SubmissionReviewForm
                  initialStatus={submission.status}
                  initialComment={submission.teacherComment}
                  loading={loading}
                  onSubmit={(status, teacherComment) => onReview(submission.id, status, teacherComment)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};
