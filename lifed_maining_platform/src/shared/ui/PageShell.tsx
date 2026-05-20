import { Box, Container, Paper, type PaperProps } from "@mui/material";
import type { PropsWithChildren } from "react";

interface PageShellProps extends PaperProps {
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const PageShell = ({ children, maxWidth = "lg", ...props }: PropsWithChildren<PageShellProps>) => {
  return (
    <Container maxWidth={maxWidth} sx={{ py: 4 }}>
      <Paper sx={{ p: 3, backgroundColor: "#fff" }} {...props}>
        <Box>{children}</Box>
      </Paper>
    </Container>
  );
};
