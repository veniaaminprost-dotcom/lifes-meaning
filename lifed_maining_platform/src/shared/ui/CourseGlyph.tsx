import { Box } from "@mui/material";
import type { ReactNode } from "react";
import crossesImg from "@/shared/assets/crosses.png";
import bibleImg from "@/shared/assets/bible.png";
import bibleSunImg from "@/shared/assets/bible-sun.png";

export type CourseIconKey = "panorama" | "uniqueness" | "family" | "silence" | "summary" | "default";

interface CourseGlyphProps {
  iconKey: CourseIconKey;
  size?: number;
  variant?: "plain" | "ornate";
}

const ICONS: Record<CourseIconKey, ReactNode> = {
  panorama: <img src={bibleSunImg} alt="Panorama" style={{ width: '75%', height: '75%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />,
  uniqueness: <img src={crossesImg} alt="Uniqueness" style={{ width: '75%', height: '75%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />,
  family: <img src={bibleImg} alt="Family" style={{ width: '75%', height: '75%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />,
  silence: <img src={crossesImg} alt="Silence" style={{ width: '75%', height: '75%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />,
  summary: <img src={bibleImg} alt="Summary" style={{ width: '75%', height: '75%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />,
  default: <img src={crossesImg} alt="Default" style={{ width: '75%', height: '75%', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
};

const ACCENTS: Record<CourseIconKey, { ring: string; glow: string }> = {
  panorama: { ring: "rgba(255,230,204,0.8)", glow: "rgba(255,214,170,0.34)" },
  uniqueness: { ring: "rgba(219,234,255,0.85)", glow: "rgba(171,199,255,0.35)" },
  family: { ring: "rgba(224,255,218,0.82)", glow: "rgba(172,227,160,0.32)" },
  silence: { ring: "rgba(242,224,255,0.82)", glow: "rgba(206,166,235,0.3)" },
  summary: { ring: "rgba(255,241,221,0.86)", glow: "rgba(237,203,157,0.3)" },
  default: { ring: "rgba(238,238,238,0.9)", glow: "rgba(217,217,217,0.28)" }
};

export const CourseGlyph = ({ iconKey, size = 36, variant = "ornate" }: CourseGlyphProps) => {
  const accent = ACCENTS[iconKey] ?? ACCENTS.default;
  if (variant === "plain") {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "999px",
          bgcolor: "rgba(255,255,255,0.18)",
          color: "currentColor",
          flexShrink: 0
        }}
      >
        {ICONS[iconKey] ?? ICONS.default}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), rgba(255,255,255,0.15) 60%, transparent 100%)",
          border: `1px solid ${accent.ring}`,
          boxShadow: `inset 0 2px 6px rgba(255,255,255,0.4), 0 4px 14px ${accent.glow}`
        }}
      />
      <Box
        sx={{
          width: "60%",
          height: "60%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "currentColor",
          zIndex: 1
        }}
      >
        {ICONS[iconKey] ?? ICONS.default}
      </Box>
    </Box>
  );
};
