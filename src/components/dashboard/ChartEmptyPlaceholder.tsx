import { Box, Typography } from "@mui/material";

export default function ChartEmptyPlaceholder({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "inherit",
        px: { xs: 2, sm: 3 },
        py: 2,
        textAlign: "center",
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {title}
      </Typography>
      {detail ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, maxWidth: 320, lineHeight: 1.5 }}
        >
          {detail}
        </Typography>
      ) : null}
    </Box>
  );
}
