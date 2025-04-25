// muiTheme.ts
import { createTheme } from "@mui/material/styles";

export const getMuiTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      mode,
      ...(mode === "dark"
        ? {
            background: {
              default: "#0f172a",
              paper: "#1e293b",
            },
            text: {
              primary: "#f8fafc",
              secondary: "#cbd5e1",
            },
          }
        : {
            background: {
              default: "#f9fafb",
              paper: "#ffffff",
            },
            text: {
              primary: "#0f172a",
              secondary: "#334155",
            },
          }),
    },
  });
