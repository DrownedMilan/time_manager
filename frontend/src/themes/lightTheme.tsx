import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#9c27b0" },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  shape: { borderRadius: 8 },
});

export default lightTheme;
