import { Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import type { LessonQuizResult } from "@/shared/types";

interface QuizResultsTableProps {
  items: LessonQuizResult[];
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("ru-RU");
};

export const QuizResultsTable = ({ items }: QuizResultsTableProps) => {
  if (!items.length) {
    return <Typography color="text.secondary">Результатов тестов пока нет.</Typography>;
  }

  return (
    <Paper>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Студент</TableCell>
            <TableCell>Урок</TableCell>
            <TableCell>Баллы</TableCell>
            <TableCell>Процент</TableCell>
            <TableCell>Обновлено</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((result) => (
            <TableRow key={`${result.lessonId}-${result.studentId}`}>
            <TableCell>{result.studentName}</TableCell>
            <TableCell>{result.lessonTitle}</TableCell>
            <TableCell>{result.score}/{result.total}</TableCell>
            <TableCell>
              <Chip
                size="small"
                color={result.percent >= 80 ? "success" : result.percent >= 50 ? "warning" : "error"}
                label={`${result.percent}%`}
              />
            </TableCell>
            <TableCell>{formatDate(result.updatedAt)}</TableCell>
          </TableRow>
        ))}
        </TableBody>
      </Table>
    </Paper>
  );
};
