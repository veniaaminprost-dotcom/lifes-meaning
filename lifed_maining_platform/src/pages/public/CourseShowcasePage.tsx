import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { selectRole, selectSession } from "@/entities/auth/model/selectors";
import { fetchShowcaseCourses, type ShowcaseCourse } from "@/entities/course/api/showcaseCourseApi";
import { getCourseTheme, getDashboardLink } from "@/shared/lib/courseShowcase";
import { useAppSelector } from "@/shared/lib/hooks";
import { BrandLockup } from "@/shared/ui/BrandLockup";
import { CourseGlyph } from "@/shared/ui/CourseGlyph";

export const CourseShowcasePage = () => {
  const session = useAppSelector(selectSession);
  const role = useAppSelector(selectRole);
  const dashboardLink = getDashboardLink(role);
  const [courses, setCourses] = useState<ShowcaseCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchShowcaseCourses();
        if (!cancelled) {
          setCourses(data);
        }
      } catch (unknownError) {
        if (!cancelled) {
          setError(unknownError instanceof Error ? unknownError.message : "Не удалось загрузить витрину");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCourses();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `url('/legacy-landing/Кресты.png') bottom right / min(400px, 80vw) no-repeat fixed,
          radial-gradient(circle at 15% 15%, rgba(186,143,113,0.28), transparent 30%), 
          radial-gradient(circle at 85% 20%, rgba(122,163,112,0.2), transparent 35%), 
          #f8f5f1`
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack spacing={3.5} sx={{ mb: 4 }}>
          <BrandLockup size="md" />
          <Chip label="Онлайн-школа «Жизни Смысл»" sx={{ width: "fit-content", bgcolor: "#efe3d7", fontWeight: 600 }} />
          <Typography variant="h2" sx={{ lineHeight: 1.05 }}>
            Витрина курсов
          </Typography>
          <Typography color="text.secondary" maxWidth={740}>
            Выберите курс и начните обучение в удобном формате: видеоуроки, задания и доступ к материалам в облачном хранилище.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component={Link} to={session ? dashboardLink : "/login"} variant="contained" size="large">
              {session ? "Открыть кабинет" : "Войти"}
            </Button>
            {!session && (
              <Button component={Link} to="/register" variant="outlined" size="large">
                Зарегистрироваться
              </Button>
            )}
          </Stack>
        </Stack>

        <Grid container spacing={2.25}>
          {isLoading && (
            <Grid size={{ xs: 12 }}>
              <Typography color="text.secondary">Загружаю витрину курсов...</Typography>
            </Grid>
          )}
          {!isLoading && error && (
            <Grid size={{ xs: 12 }}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
          {!isLoading && !error && !courses.length && (
            <Grid size={{ xs: 12 }}>
              <Typography color="text.secondary">Курсы для витрины пока не опубликованы.</Typography>
            </Grid>
          )}
          {courses.map((course) => {
            const theme = getCourseTheme(course.title);
            
            let bgStyle = `${theme.coverTone}, radial-gradient(circle at 20% 20%, rgba(255,255,255,0.26), transparent 35%)`;
            if (course.title.includes("Краткое")) bgStyle = "url('/covers/cover_summary_1774465922920.png') center / cover no-repeat";
            if (course.title.includes("Панорама")) bgStyle = "url('/covers/cover_panorama_1774465857652.png') center / cover no-repeat";
            if (course.title.includes("Институт")) bgStyle = "url('/covers/cover_family_1774465892440.png') center / cover no-repeat";
            if (course.title.includes("Уникальность")) bgStyle = "url('/covers/cover_uniqueness_1774465959770.png') center / cover no-repeat";
            if (course.title.includes("Молчание")) bgStyle = "url('/covers/cover_silence_1779279282135.png') center / cover no-repeat";

            return (
              <Grid key={course.slug} size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    height: "100%",
                    borderRadius: "12px",
                    border: "1px solid #ece7e2",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                    transition: "transform .25s ease, box-shadow .25s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.12)"
                    },
                    "&:hover [data-course-glyph='true']": {
                      transform: "translateY(-2px) scale(1.04) rotate(-6deg)"
                    }
                  }}
                >
                    <Box
                      sx={{
                        height: 220,
                        p: 2,
                        display: "flex",
                        alignItems: "flex-end",
                        background: bgStyle,
                        color: "#fff",
                        position: "relative",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0, left: 0, right: 0, bottom: 0,
                          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 60%)",
                          zIndex: 1
                        }
                      }}
                    >
                      <Stack spacing={0.75} sx={{ position: "relative", zIndex: 2 }}>
                      <Chip
                        size="small"
                        label={`${course.lessons.length} уроков`}
                        sx={{ width: "fit-content", bgcolor: "rgba(255,255,255,0.24)", color: "#fff" }}
                      />
                      <Stack direction="row" spacing={1.1} alignItems="center">
                        <Box data-course-glyph="true" sx={{ transition: "transform .28s ease" }}>
                          <CourseGlyph iconKey={theme.iconKey} size={33} variant="ornate" />
                        </Box>
                        <Typography variant="h5" sx={{ color: "#fff", textShadow: "0 2px 10px rgba(0,0,0,0.18)" }}>
                          {course.title}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack spacing={1.25}>
                      <Chip size="small" label={`${course.lessons.length} уроков`} sx={{ width: "fit-content" }} />
                      <Typography color="text.secondary">{course.description}</Typography>
                      <Button component={Link} to={`/vitrina/${course.slug}`} variant="text" sx={{ width: "fit-content", px: 0 }}>
                        Открыть витрину курса
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};
