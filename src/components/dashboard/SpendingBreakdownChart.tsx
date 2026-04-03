import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
} from "recharts";
import { useChartContainerWidth } from "@/hooks/useChartContainerWidth";
import {
  filterTransactionsInRange,
  formatRangeSummary,
  resolveAnalyticsRange,
} from "@/lib/analyticsRange";
import { spendingByCategory } from "@/lib/financeSelectors";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Transaction } from "@/types";
import ChartEmptyPlaceholder from "./ChartEmptyPlaceholder";

const COLORS = [
  "#0d9488",
  "#6366f1",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#64748b",
];

const CHART_HEIGHT_MD = 280;
const CHART_HEIGHT_SM = 240;

export default function SpendingBreakdownChart({
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
  const setFilterCategory = useFinanceStore((s) => s.setFilterCategory);
  const setFilterType = useFinanceStore((s) => s.setFilterType);

  const { data, rangeSummary, inRangeCount } = useMemo(() => {
    const range = resolveAnalyticsRange(preset, customStart, customEnd);
    const scoped = filterTransactionsInRange(
      transactions,
      range.start,
      range.end
    );
    return {
      data: spendingByCategory(scoped),
      rangeSummary: formatRangeSummary(range.start, range.end),
      inRangeCount: scoped.length,
    };
  }, [transactions, preset, customStart, customEnd]);

  const empty = data.length === 0;
  const noTransactions = transactions.length === 0;
  const noActivityInRange = !noTransactions && inRangeCount === 0;
  const noExpensesInRange =
    !noTransactions && inRangeCount > 0 && empty;

  const outerR = Math.min(
    88,
    Math.max(36, (Math.min(width, chartHeight) - (compactChart ? 56 : 48)) / 2 - 8)
  );
  const innerR = Math.max(28, outerR - 36);

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
        Spending by category
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        Expense totals by category in the selected period
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {rangeSummary}
      </Typography>
      {!empty && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
          Hover for values. Click a slice to filter transactions by that category.
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
          cursor: empty ? "default" : "pointer",
        }}
      >
        {empty ? (
          <ChartEmptyPlaceholder
            title={
              noTransactions
                ? "No transactions yet"
                : noActivityInRange
                  ? "Nothing in this date range"
                  : noExpensesInRange
                    ? "No expenses in this period"
                    : "No expenses to chart"
            }
            detail={
              noTransactions
                ? "Add transactions or restore demo data to see spending by category."
                : noActivityInRange
                  ? "Adjust the chart time range so it overlaps your transaction dates."
                  : noExpensesInRange
                    ? "Try a wider date range or add expenses that fall inside these dates."
                    : "This chart only includes expenses. Add an expense or widen filters elsewhere."
            }
          />
        ) : (
          <PieChart width={width} height={chartHeight}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={innerR}
              outerRadius={outerR}
              paddingAngle={2}
              label={false}
              cursor="pointer"
              onClick={(entry) => {
                const next = entry?.name;
                if (typeof next === "string" && next.length > 0) {
                  setFilterType("expense");
                  setFilterCategory(next);
                }
              }}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  stroke={theme.palette.background.paper}
                />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              height={compactChart ? 52 : 36}
              wrapperStyle={{
                fontSize: compactChart ? 10 : 12,
                lineHeight: compactChart ? "14px" : "16px",
                paddingTop: 4,
              }}
              formatter={(value) => String(value)}
            />
            <Tooltip
              animationDuration={250}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                boxShadow: theme.shadows[4],
              }}
              formatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(Number(value))
              }
            />
          </PieChart>
        )}
      </Box>
    </Paper>
  );
}
