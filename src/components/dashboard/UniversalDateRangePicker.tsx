import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import {
  ANALYTICS_PRESET_LABELS,
  effectiveBucket,
  formatRangeSummary,
  resolveAnalyticsRange,
} from "@/lib/analyticsRange";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { AnalyticsBucketMode, AnalyticsRangePreset } from "@/types";

const PRESET_ORDER: AnalyticsRangePreset[] = [
  "7d",
  "15d",
  "30d",
  "1mo",
  "2mo",
  "3mo",
  "6mo",
  "12mo",
  "custom",
];

const BUCKET_OPTIONS: { value: AnalyticsBucketMode; label: string }[] = [
  { value: "auto", label: "Auto (by span)" },
  { value: "day", label: "Daily" },
  { value: "month", label: "Monthly" },
];

/**
 * Global date/analytics controls (Zustand). Drives charts on Analytics,
 * % deltas on Overview summary cards, and chart click-to-zoom uses the same store.
 */
export default function UniversalDateRangePicker() {
  const preset = useFinanceStore((s) => s.analyticsRangePreset);
  const customStart = useFinanceStore((s) => s.analyticsCustomStart);
  const customEnd = useFinanceStore((s) => s.analyticsCustomEnd);
  const bucket = useFinanceStore((s) => s.analyticsBucket);
  const setPreset = useFinanceStore((s) => s.setAnalyticsRangePreset);
  const setCustomRange = useFinanceStore((s) => s.setAnalyticsCustomRange);
  const setBucket = useFinanceStore((s) => s.setAnalyticsBucket);

  const resolved = useMemo(
    () => resolveAnalyticsRange(preset, customStart, customEnd),
    [preset, customStart, customEnd]
  );

  const effBucket = useMemo(
    () => effectiveBucket(resolved.start, resolved.end, bucket),
    [resolved.start, resolved.end, bucket]
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        Universal date range
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
        One picker for the whole app: Analytics charts + the “vs previous period” cards.
        Overview also uses this window for the table and insights. Your choice is saved in
        this browser.
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        flexWrap="wrap"
        useFlexGap
        sx={{ alignItems: { xs: "stretch", sm: "flex-end" } }}
      >
        <TextField
          select
          label="Preset"
          size="small"
          value={preset}
          onChange={(e) =>
            setPreset(e.target.value as AnalyticsRangePreset)
          }
          SelectProps={{ native: true }}
          sx={{ minWidth: { xs: "100%", sm: 220 } }}
        >
          {PRESET_ORDER.map((p) => (
            <option key={p} value={p}>
              {ANALYTICS_PRESET_LABELS[p]}
            </option>
          ))}
        </TextField>

        {preset === "custom" && (
          <>
            <TextField
              label="From"
              type="date"
              size="small"
              value={customStart.slice(0, 10)}
              onChange={(e) =>
                setCustomRange(e.target.value, customEnd.slice(0, 10))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { xs: "100%", sm: 150 } }}
            />
            <TextField
              label="To"
              type="date"
              size="small"
              value={customEnd.slice(0, 10)}
              onChange={(e) =>
                setCustomRange(customStart.slice(0, 10), e.target.value)
              }
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { xs: "100%", sm: 150 } }}
            />
          </>
        )}

        <TextField
          select
          label="Balance trend buckets"
          size="small"
          value={bucket}
          onChange={(e) =>
            setBucket(e.target.value as AnalyticsBucketMode)
          }
          SelectProps={{ native: true }}
          sx={{ minWidth: { xs: "100%", sm: 200 } }}
        >
          {BUCKET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary" component="p" sx={{ m: 0 }}>
          Active window:{" "}
          <Box component="span" fontWeight={600} color="text.primary">
            {formatRangeSummary(resolved.start, resolved.end)}
          </Box>
          {" · "}
          Trend granularity:{" "}
          <Box component="span" fontWeight={600} color="text.primary">
            {effBucket === "day" ? "Daily" : "Monthly"}
          </Box>
        </Typography>
      </Box>
    </Paper>
  );
}
