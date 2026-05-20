import { Stack, Typography } from "@mui/material";
import { RoleNavigation } from "@/widgets/navigation/RoleNavigation";
import { CourseList } from "@/widgets/course-list/CourseList";
import { PageShell } from "@/shared/ui/PageShell";
import { useMyCoursesQuery } from "@/shared/api/baseApi";

export const StudentDashboardPage = () => {
  const { data = [] } = useMyCoursesQuery();

  return (
    <>
      <RoleNavigation />
      <PageShell>
        <Stack spacing={2.5}>
          <Typography variant="h4">Мои курсы</Typography>
          <CourseList courses={data} role="student" />
        </Stack>
      </PageShell>
    </>
  );
};
