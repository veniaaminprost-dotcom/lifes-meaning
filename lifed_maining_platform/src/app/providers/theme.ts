import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#906b59",
      dark: "#7a5a48",
      light: "#b8937e"
    },
    background: {
      default: "#faf8f5",
      paper: "#ffffff"
    },
    text: {
      primary: "#1a1510",
      secondary: "#676767"
    },
    success: {
      main: "#5a8a6a"
    },
    warning: {
      main: "#c4914a"
    },
    error: {
      main: "#c45a4a"
    }
  },
  shape: {
    borderRadius: 16 // Equivalent to --radius-md in landing
  },
  typography: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    h1: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: "#1a1510" },
    h2: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: "#1a1510" },
    h3: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: "#1a1510" },
    h4: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: "#1a1510" },
    h5: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: "#1a1510" },
    h6: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600, color: "#1a1510" },
    body1: { color: "#676767", lineHeight: 1.75 },
    body2: { color: "#676767", lineHeight: 1.65 }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #E8E0D8", // --color-border
          transition: "all 0.25s ease",
          "&.MuiCard-root:hover": { // If treated as a card
            borderColor: "#b8937e",
            boxShadow: "0 4px 20px rgba(144, 107, 89, 0.12)",
            transform: "translateY(-4px)"
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24, // --radius-lg for cards
          border: "1px solid #E8E0D8",
          boxShadow: "none",
          transition: "all 0.25s ease",
          "&:hover": {
            borderColor: "#b8937e",
            boxShadow: "0 4px 20px rgba(144, 107, 89, 0.12)",
            transform: "translateY(-4px)"
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 16, // --radius-md
          padding: "10px 24px",
          fontFamily: "'Inter', -apple-system, sans-serif",
          transition: "all 0.25s ease",
          whiteSpace: "nowrap"
        },
        containedPrimary: {
          backgroundColor: "#906b59",
          color: "white",
          boxShadow: "none",
          "&:hover": {
            backgroundColor: "#7a5a48",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 20px rgba(144, 107, 89, 0.12)"
          }
        },
        outlinedPrimary: {
          backgroundColor: "transparent",
          color: "#906b59",
          border: "1.5px solid #906b59",
          "&:hover": {
            backgroundColor: "#906b59",
            color: "white",
            border: "1.5px solid #906b59",
            transform: "translateY(-1px)"
          }
        },
        textPrimary: {
          backgroundColor: "#F0ECE8", // Use btn-ghost from landing for text buttons
          color: "#906b59",
          "&:hover": {
            backgroundColor: "#906b59",
            color: "white"
          }
        },
        sizeLarge: {
          padding: "18px 48px",
          fontSize: 17
        },
        sizeSmall: {
          padding: "10px 20px",
          fontSize: 14
        }
      }
    }
  }
});
