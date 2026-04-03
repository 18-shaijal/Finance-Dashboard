import { Box } from "@mui/material";
import { alpha, keyframes, useTheme } from "@mui/material/styles";

const driftA = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-3%, 4%) scale(1.06); }
`;

const driftB = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(4%, -3%) scale(1.05); }
`;

/**
 * Animated color mesh (CSS only). Sits under Three.js and page content.
 */
export default function CssMeshBackground() {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const p = theme.palette.primary.main;
  const s = theme.palette.secondary.main;

  return (
    <Box
      className="ambient-css-mesh"
      aria-hidden
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        background: dark
          ? `linear-gradient(160deg, #070a0c 0%, #0c1214 40%, #100e18 100%)`
          : `linear-gradient(155deg, #ecfeff 0%, #f8fafc 42%, #f5f3ff 100%)`,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "-25%",
          background: dark
            ? `radial-gradient(ellipse 55% 45% at 18% 28%, ${alpha(p, 0.35)}, transparent 58%),
               radial-gradient(ellipse 50% 42% at 82% 72%, ${alpha(s, 0.28)}, transparent 55%)`
            : `radial-gradient(ellipse 55% 45% at 20% 30%, ${alpha(p, 0.38)}, transparent 60%),
               radial-gradient(ellipse 48% 40% at 78% 70%, ${alpha(s, 0.32)}, transparent 55%)`,
          animation: `${driftA} 24s ease-in-out infinite`,
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: "-20%",
          background: dark
            ? `radial-gradient(ellipse 40% 35% at 70% 20%, ${alpha(s, 0.15)}, transparent 50%),
               radial-gradient(ellipse 35% 30% at 25% 80%, ${alpha(p, 0.12)}, transparent 48%)`
            : `radial-gradient(ellipse 42% 36% at 65% 18%, ${alpha(p, 0.2)}, transparent 52%),
               radial-gradient(ellipse 38% 32% at 30% 85%, ${alpha(s, 0.18)}, transparent 50%)`,
          animation: `${driftB} 32s ease-in-out infinite`,
          animationDelay: "-8s",
          "@media (prefers-reduced-motion: reduce)": {
            animation: "none",
          },
        },
      }}
    />
  );
}
