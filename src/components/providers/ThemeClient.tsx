import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useMemo } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";

export function ThemeClient({ children }: { children: React.ReactNode }) {
  const colorMode = useFinanceStore((s) => s.colorMode ?? "light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode === "dark" ? "dark" : "light",
          primary: { main: colorMode === "dark" ? "#7dd3c0" : "#0d9488" },
          secondary: { main: colorMode === "dark" ? "#a78bfa" : "#6366f1" },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily:
            "var(--font-inter), system-ui, Helvetica, Arial, sans-serif",
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              html: { backgroundColor: "transparent" },
              body: { backgroundColor: "transparent" },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                transition:
                  "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: { transition: "transform 0.15s ease, box-shadow 0.2s ease" },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: { transition: "background-color 0.15s ease, transform 0.15s ease" },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: { transition: "box-shadow 0.2s ease, border-color 0.2s ease" },
            },
          },
          MuiPopover: {
            defaultProps: {
              disableScrollLock: true,
            },
          },
          MuiMenu: {
            defaultProps: {
              disableScrollLock: true,
            },
          },
        },
      }),
    [colorMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
