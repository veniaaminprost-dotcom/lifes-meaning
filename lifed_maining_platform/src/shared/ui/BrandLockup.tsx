import { Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import mark from "@/shared/assets/lifes-meaning-mark.svg";

interface BrandLockupProps {
  size?: "sm" | "md";
  withText?: boolean;
}

export const BrandLockup = ({ size = "md", withText = true }: BrandLockupProps) => {
  const iconHeight = size === "sm" ? 24 : 32;
  const fontSize = size === "sm" ? 20 : 26;
  const letterSpacing = size === "sm" ? "0.03em" : "0.04em";

  return (
    <Stack
      component={Link}
      to="/vitrina"
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ textDecoration: "none", width: "fit-content" }}
    >
      <img src={mark} alt="Жизни Смысл" style={{ height: iconHeight, width: "auto", display: "block" }} />
      {withText && (
        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 600,
            fontSize,
            letterSpacing,
            lineHeight: 1,
            textTransform: "uppercase",
            color: "#1A1510",
            display: "flex",
            flexDirection: "column"
          }}
        >
          Жизни Смысл
        </Typography>
      )}
    </Stack>
  );
};
