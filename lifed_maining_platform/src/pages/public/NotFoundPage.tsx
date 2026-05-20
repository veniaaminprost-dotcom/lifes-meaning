import { Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { PageShell } from "@/shared/ui/PageShell";

export const NotFoundPage = () => (
  <PageShell maxWidth="sm">
    <Stack spacing={2}>
      <Typography variant="h4">Страница не найдена</Typography>
      <Button component={Link} to="/login" variant="contained">
        Перейти ко входу
      </Button>
    </Stack>
  </PageShell>
);
