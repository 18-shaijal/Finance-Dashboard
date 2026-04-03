import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { endOfMonth, format, parseISO, startOfMonth } from "date-fns";
import { useChartContainerWidth } from "@/hooks/useChartContainerWidth";
import {
  buildBalanceTrendSeries,
  effectiveBucket,
  filterTransactionsInRange,
  formatRangeSummary,
  resolveAnalyticsRange,
} from "@/lib/analyticsRange";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Transaction } from "@/types";
import ChartEmptyPlaceholder from "./ChartEmptyPlaceholder";

const CHART_HEIGHT_MD = 280;
const CHART_HEIGHT_SM = 220;

export default function BalanceTrendChart({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const theme = useTheme();
  const compactChart = useMediaQuery(theme.breakpoints.down("sm"));
  const chartHeight = compactChart ? CHART_HEIGHT_SM : CHART_HEIGHT_MD;
  const { containerRef, width } = useChartContainerWidth();

  const preset = useFinanceStore((s) => s.analyticsRangePreset);
  const customStart = useFinanceStore((s) => s.analyticsCustomStart);
  const customEnd = useFinanceStore((s) => s.analyticsCustomEnd);
  const bucketMode = useFinanceStore((s) => s.analyticsBucket);
  const setAnalyticsCustomRange = useFinanceStore((s) => s.setAnalyticsCustomRange);

  const { data, rangeSummary, effBucket, inRangeCount } = useMemo(() => {
    const range = resolveAnalyticsRange(preset, customStart, customEnd);
    const scoped = filterTransactionsInRange(
      transactions,
      range.start,
      range.end
    );
    const eff = effectiveBucket(range.start, range.end, bucketMode);
    const series = buildBalanceTrendSeries(
      transactions,
      range.start,
      range.end,
      eff
    );
    return {
      data: series,
      rangeSummary: formatRangeSummary(range.start, range.end),
      effBucket: eff,
      inRangeCount: scoped.length,
    };
  }, [transactions, preset, customStart, customEnd, bucketMode]);

  const empty = transactions.length === 0;
  const noActivityInRange = !empty && inRangeCount === 0;
  const denseDayTicks = effBucket === "day" && data.length > 12;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        height: "100%",
        overflow: "hidden",
        position: "relative",
        cursor: "default",
        "&:hover": {
          boxShadow: 2,
          borderColor: "primary.main",
        },
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        Balance trend
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Running net ({effBucket === "day" ? "daily" : "monthly"})
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: !empty && !noActivityInRange ? 1.5 : 0.5 }}>
        {rangeSummary}
      </Typography>
      {!empty && !noActivityInRange && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
          Hover for numbers; click a point to snap the range.
        </Typography>
      )}
      <Box
        ref={containerRef}
        sx={{
          width: "100%",
          minWidth: 0,
          minHeight: chartHeight,
          height: chartHeight,
          overflow: "hidden",
          position: "relative",
          cursor: empty || noActivityInRange ? "default" : "crosshair",
        }}
      >
        {empty ? (
          <ChartEmptyPlaceholder
            title="No data"
            detail="Add rows or hit reset in the header for sample data."
          />
        ) : noActivityInRange ? (
          <ChartEmptyPlaceholder
            title="No rows in range"
            detail="Widen the range or pick custom dates that overlap your data."
          />
        ) : (
          <LineChart
            width={width}
            height={chartHeight}
            data={data}
            margin={
              compactChart
                ? {
                    top: 6,
                    right: 6,
                    left: 0,
                    bottom: denseDayTicks ? 36 : 4,
                  }
                : {
                    top: 8,
                    right: 12,
                    left: 4,
                    bottom: denseDayTicks ? 40 : 4,
                  }
            }
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis
              dataKey="label"
              tick={{
                fill: theme.palette.text.secondary,
                fontSize: compactChart ? 9 : denseDayTicks ? 10 : 12,
              }}
              axisLine={{ stroke: theme.palette.divider }}
              interval={denseDayTicks ? "preserveStartEnd" : 0}
              angle={denseDayTicks ? -40 : 0}
              textAnchor={denseDayTicks ? "end" : "middle"}
              height={denseDayTicks ? 48 : undefined}
            />
            <YAxis
              width={compactChart ? 42 : 56}
              tick={{
                fill: theme.palette.text.secondary,
                fontSize: compactChart ? 10 : 12,
              }}
              axisLine={{ stroke: theme.palette.divider }}
              tickFormatter={(v) =>
                new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(v as number)
              }
            />
            <Tooltip
              animationDuration={250}
              cursor={{ stroke: theme.palette.primary.main, strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                boxShadow: theme.shadows[4],
              }}
              formatter={(value) => [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(Number(value)),
                "Balance",
              ]}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: data.length > 40 ? 0 : 3 }}
              activeDot={{ r: 7, stroke: theme.palette.primary.main, strokeWidth: 2 }}
              onClick={(point) => {
                const key = String(point?.key ?? "");
                if (key.length === 10) {
                  setAnalyticsCustomRange(key, key);
                  return;
                }
                if (key.length === 7) {
                  const monthStart = startOfMonth(parseISO(`${key}-01`));
                  const monthEnd = endOfMonth(monthStart);
                  setAnalyticsCustomRange(
                    format(monthStart, "yyyy-MM-dd"),
                    format(monthEnd, "yyyy-MM-dd")
                  );
                }
              }}
            />
          </LineChart>
        )}
      </Box>
    </Paper>
  );
}
