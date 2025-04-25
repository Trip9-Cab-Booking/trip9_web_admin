"use client";
import React from "react";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { useTheme } from "@/context/ThemeContext";
import { getMuiTheme } from "@/hooks/muiTheme";
import Providers from "@/store/redux-provider";
import { SidebarProvider } from "@/context/SidebarContext";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const muiTheme = getMuiTheme(theme);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Providers>
        <SidebarProvider>{children}</SidebarProvider>
      </Providers>
    </MuiThemeProvider>
  );
}
