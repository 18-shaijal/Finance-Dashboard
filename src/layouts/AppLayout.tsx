import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import HelpOutlineOutlined from "@mui/icons-material/HelpOutlineOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import RestartAltOutlined from "@mui/icons-material/RestartAltOutlined";
import {
  AppBar,
  Box,
  Container,
  IconButton,
  Stack,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import CssMeshBackground from "@/components/ambient/CssMeshBackground";
import KeyboardShortcutsDialog from "@/components/KeyboardShortcutsDialog";
import DateRangeControls from "@/components/dashboard/DateRangeControls";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { UserRole } from "@/types";

const ThreeAmbientCanvas = lazy(
  () => import("@/components/ambient/ThreeAmbientCanvas")
);

export default function AppLayout() {
  const theme = useTheme();
  const narrowHeader = useMediaQuery(theme.breakpoints.down("sm"));
  const appBarRef = useRef<HTMLDivElement>(null);
  const [appBarHeight, setAppBarHeight] = useState(64);
  const location = useLocation();
  const role = useFinanceStore((s) => s.role);
  const setRole = useFinanceStore((s) => s.setRole);
  const colorMode = useFinanceStore((s) => s.colorMode);
  const setColorMode = useFinanceStore((s) => s.setColorMode);
  const resetToSeed = useFinanceStore((s) => s.resetToSeed);

  const [helpOpen, setHelpOpen] = useState(false);

  useLayoutEffect(() => {
    const el = appBarRef.current;
    if (!el) return;
    const measure = () => setAppBarHeight(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [narrowHeader]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const inInput =
        tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if (inInput) return;
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setHelpOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const roleValue: UserRole = role === "admin" ? "admin" : "viewer";
  const tabPath =
    location.pathname === "/analytics" ? "/analytics" : "/";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        bgcolor: "transparent",
      }}
    >
      <CssMeshBackground />
      <Suspense fallback={null}>
        <ThreeAmbientCanvas />
      </Suspense>
      <AppBar
        ref={appBarRef}
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.appBar,
          pt: "env(safe-area-inset-top, 0px)",
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, 0.78),
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          pointerEvents: "auto",
        }}
      >
        <Toolbar
          sx={{
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 1.25, sm: 1 },
            py: { xs: 1.25, sm: 1 },
            flexWrap: { sm: "wrap" },
            pointerEvents: "auto",
            "& .MuiIconButton-root, & .MuiFormControl-root": {
              pointerEvents: "auto",
            },
          }}
        >
          {narrowHeader ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ width: 1, minWidth: 0 }}
              >
                <Typography
                  variant="h6"
                  component={Link}
                  to="/"
                  sx={{
                    fontWeight: 700,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: "1rem",
                    color: "text.primary",
                    textDecoration: "none",
                  }}
                >
                  Finance Dashboard
                </Typography>
                <Stack direction="row" spacing={0.25} flexShrink={0}>
                  <IconButton
                    type="button"
                    onClick={() => setHelpOpen(true)}
                    color="inherit"
                    aria-label="Keyboard shortcuts"
                    title="Shortcuts (?)"
                    size="small"
                  >
                    <HelpOutlineOutlined fontSize="small" />
                  </IconButton>
                  <IconButton
                    type="button"
                    onClick={() =>
                      setColorMode(colorMode === "dark" ? "light" : "dark")
                    }
                    color="inherit"
                    aria-label="Toggle color mode"
                    title={colorMode === "dark" ? "Light mode" : "Dark mode"}
                    size="small"
                  >
                    {colorMode === "dark" ? (
                      <LightModeOutlined fontSize="small" />
                    ) : (
                      <DarkModeOutlined fontSize="small" />
                    )}
                  </IconButton>
                  <IconButton
                    type="button"
                    onClick={() => {
                      if (
                        typeof window !== "undefined" &&
                        window.confirm(
                          "Reset all transactions to the built-in demo data?"
                        )
                      ) {
                        resetToSeed();
                      }
                    }}
                    color="inherit"
                    aria-label="Reset demo data"
                    title="Restore demo dataset"
                    size="small"
                  >
                    <RestartAltOutlined fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
              <Tabs
                value={tabPath}
                sx={{
                  minHeight: 40,
                  width: 1,
                  maxWidth: 1,
                  "& .MuiTab-root": {
                    minHeight: 40,
                    py: 0,
                    textTransform: "none",
                  },
                }}
                variant="fullWidth"
              >
                <Tab label="Overview" value="/" component={Link} to="/" />
                <Tab
                  label="Analytics"
                  value="/analytics"
                  component={Link}
                  to="/analytics"
                />
              </Tabs>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={roleValue}
                onChange={(_, v: UserRole | null) => {
                  if (v != null) setRole(v);
                }}
                aria-label="Role"
                color="primary"
                sx={{ alignSelf: "center", width: 1, maxWidth: 280 }}
              >
                <ToggleButton value="viewer" sx={{ flex: 1 }}>
                  Viewer
                </ToggleButton>
                <ToggleButton value="admin" sx={{ flex: 1 }}>
                  Admin
                </ToggleButton>
              </ToggleButtonGroup>
            </>
          ) : (
            <>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  fontWeight: 700,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: "1.25rem",
                  color: "text.primary",
                  textDecoration: "none",
                  mr: 1,
                }}
              >
                Finance Dashboard
              </Typography>

              <Tabs
                value={tabPath}
                sx={{
                  minHeight: 40,
                  "& .MuiTab-root": {
                    minHeight: 40,
                    py: 0,
                    textTransform: "none",
                  },
                  flexShrink: 0,
                }}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
              >
                <Tab label="Overview" value="/" component={Link} to="/" />
                <Tab
                  label="Analytics"
                  value="/analytics"
                  component={Link}
                  to="/analytics"
                />
              </Tabs>

              <Box sx={{ flexGrow: 1, minWidth: 8 }} />

              <ToggleButtonGroup
                exclusive
                size="small"
                value={roleValue}
                onChange={(_, v: UserRole | null) => {
                  if (v != null) setRole(v);
                }}
                aria-label="Role"
                color="primary"
              >
                <ToggleButton value="viewer">Viewer</ToggleButton>
                <ToggleButton value="admin">Admin</ToggleButton>
              </ToggleButtonGroup>

              <IconButton
                type="button"
                onClick={() => setHelpOpen(true)}
                color="inherit"
                aria-label="Keyboard shortcuts"
                title="Shortcuts (?)"
              >
                <HelpOutlineOutlined />
              </IconButton>

              <IconButton
                type="button"
                onClick={() =>
                  setColorMode(colorMode === "dark" ? "light" : "dark")
                }
                color="inherit"
                aria-label="Toggle color mode"
                title={colorMode === "dark" ? "Light mode" : "Dark mode"}
              >
                {colorMode === "dark" ? (
                  <LightModeOutlined />
                ) : (
                  <DarkModeOutlined />
                )}
              </IconButton>

              <IconButton
                type="button"
                onClick={() => {
                  if (
                    typeof window !== "undefined" &&
                    window.confirm(
                      "Reset all transactions to the built-in demo data?"
                    )
                  ) {
                    resetToSeed();
                  }
                }}
                color="inherit"
                aria-label="Reset demo data"
                title="Restore demo dataset"
              >
                <RestartAltOutlined />
              </IconButton>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          pt: `${appBarHeight}px`,
          position: "relative",
          zIndex: 2,
        }}
      >
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Stack spacing={3}>
          <DateRangeControls />
          <Outlet />
        </Stack>
      </Container>
      </Box>

      <KeyboardShortcutsDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        showAdminShortcuts={role === "admin"}
      />
    </Box>
  );
}
