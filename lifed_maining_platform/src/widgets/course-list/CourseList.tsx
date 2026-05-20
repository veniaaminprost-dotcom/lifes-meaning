import { Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import type { Course } from "@/shared/types";

interface CourseListProps {
  courses: Course[];
  role: "admin" | "director" | "editor" | "teacher" | "student";
}

export const CourseList = ({ courses, role }: CourseListProps) => {
  if (!courses.length) {
    return <Typography color="text.secondary">Курсов пока нет.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      {courses.map((course) => (
        <Grid key={course.id} size={{ xs: 12, md: 6 }}>
          <Card component={Link} to={`/${role}/course/${course.id}`} sx={{ height: "100%", backgroundColor: "#f7f3ee" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="h6">{course.title}</Typography>
                <Typography color="text.secondary">{course.description}</Typography>
                {course.archivedAt && <Chip label="Архив" color="warning" size="small" sx={{ width: "fit-content" }} />}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
