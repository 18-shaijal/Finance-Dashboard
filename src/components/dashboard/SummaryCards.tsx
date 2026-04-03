import AccountBalanceWalletOutlined from "@mui/icons-material/AccountBalanceWalletOutlined";
import ArrowDownwardOutlined from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowUpwardOutlined from "@mui/icons-material/ArrowUpwardOutlined";
import TrendingDownOutlined from "@mui/icons-material/TrendingDownOutlined";
import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import {
  Box,
  Chip,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { addDays, differenceInCalendarDays, subDays } from "date-fns";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  filterTransactionsInRange,
  resolveAnalyticsRange,
} from "@/lib/analyticsRange";
import {
  netBalance,
  totalExpenses,
  totalIncome,
} from "@/lib/financeSelectors";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Transaction } from "@/types";

const cards = [
  {
    key: "balance",
    title: "Total balance",
    icon: AccountBalanceWalletOutlined,
    value: (t: Transaction[]) => netBalance(t),
    hint: "Net in the current range",
    accent: "primary" as const,
  },
  {
    key: "income",
    title: "Income",
    icon: TrendingUpOutlined,
    value: (t: Transaction[]) => totalIncome(t),
    hint: "Income in range",
    accent: "success" as const,
  },
  {
    key: "expenses",
    title: "Expenses",
    icon: TrendingDownOutlined,
    value: (t: Transaction[]) => totalExpenses(t),
    hint: "Expenses in range",
    accent: "error" as const,
  },
];

export default function SummaryCards({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const theme = useTheme();
  const preset = useFinanceStore((s) => s.analyticsRangePreset);
  const customStart = useFinanceStore((s) => s.analyticsCustomStart);
  const customEnd = useFinanceStore((s) => s.analyticsCustomEnd);

  const activeRange = resolveAnalyticsRange(preset, customStart, customEnd);
  const spanDays = Math.max(
    1,
    differenceInCalendarDays(activeRange.end, activeRange.start) + 1
  );
  const previousStart = subDays(activeRange.start, spanDays);
  const previousEnd = subDays(activeRange.start, 1);
  const currentWindowTx = filterTransactionsInRange(
    transactions,
    activeRange.start,
    activeRange.end
  );
  const previousWindowTx = filterTransactionsInRange(
    transactions,
    addDays(previousStart, 0),
    previousEnd
  );

  const emptyInRange = currentWindowTx.length === 0;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
      }}
    >
      {cards.map((c) => {
        const Icon = c.icon;
        const currentValue = c.value(currentWindowTx);
        const previousValue = c.value(previousWindowTx);
        const raw = emptyInRange ? 0 : currentValue;
        const deltaValue = currentValue - previousValue;
        const deltaPct =
          previousValue === 0
            ? currentValue === 0
              ? 0
              : 100
            : (deltaValue / Math.abs(previousValue)) * 100;
        const isUp = deltaValue > 0;
        const isDown = deltaValue < 0;
        const color =
          c.accent === "primary"
            ? theme.palette.primary.main
            : c.accent === "success"
              ? theme.palette.success.main
              : theme.palette.error.main;

        return (
          <Box key={c.key}>
            <Tooltip title={c.hint} placement="top" enterDelay={400}>
              <Card
                variant="outlined"
                tabIndex={0}
                sx={{
                  height: "100%",
                  borderColor: "divider",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  outlineOffset: 2,
                  "&:hover": {
                    boxShadow: 2,
                    transform: "translateY(-2px)",
                  },
                  "&:focus-visible": {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Icon sx={{ color, fontSize: 28, mt: 0.25 }} />
                    <Stack spacing={0.5} flex={1} minWidth={0}>
                      <Typography variant="body2" color="text.secondary">
                        {c.title}
                      </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      sx={{
                        fontSize: { xs: "1.15rem", sm: "1.5rem" },
                        lineHeight: 1.25,
                        wordBreak: "break-word",
                      }}
                    >
                      {formatCurrency(raw)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {emptyInRange ? "Add transactions to see totals" : c.hint}
                    </Typography>
                    {!emptyInRange && (
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        sx={{ pt: 0.25 }}
                      >
                        <Chip
                          size="small"
                          icon={
                            isUp ? (
                              <ArrowUpwardOutlined />
                            ) : isDown ? (
                              <ArrowDownwardOutlined />
                            ) : undefined
                          }
                          label={`${isUp ? "+" : ""}${deltaPct.toFixed(1)}%`}
                          color={
                            isUp ? "success" : isDown ? "error" : "default"
                          }
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          vs prior period
                        </Typography>
                      </Stack>
                    )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Tooltip>
          </Box>
        );
      })}
    </Box>
  );
}
