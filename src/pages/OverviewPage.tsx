import { Box, Stack, Typography } from "@mui/material";
import InsightsSection from "@/components/dashboard/InsightsSection";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TransactionsTable from "@/components/dashboard/TransactionsTable";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Transaction } from "@/types";
import { filterTransactionsInRange, resolveAnalyticsRange } from "@/lib/analyticsRange";
import { useMemo } from "react";

const EMPTY_TX: Transaction[] = [];

export default function OverviewPage() {
  const transactions = useFinanceStore((s) => s.transactions ?? EMPTY_TX);
  const role = useFinanceStore((s) => s.role);

  const preset = useFinanceStore((s) => s.analyticsRangePreset);
  const customStart = useFinanceStore((s) => s.analyticsCustomStart);
  const customEnd = useFinanceStore((s) => s.analyticsCustomEnd);

  const resolvedRange = useMemo(
    () => resolveAnalyticsRange(preset, customStart, customEnd),
    [preset, customStart, customEnd]
  );

  const scopedTransactions = useMemo(
    () =>
      filterTransactionsInRange(
        transactions,
        resolvedRange.start,
        resolvedRange.end
      ),
    [transactions, resolvedRange.start, resolvedRange.end]
  );

  return (
    <Stack spacing={3}>
      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Overview
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, maxWidth: 560, lineHeight: 1.6 }}
        >
          {role === "viewer"
            ? "You are viewing as Viewer — transactions are read-only."
            : "You are viewing as Admin — you can add, edit, or delete transactions."}{" "}
          Open <strong>Analytics</strong> for charts; use the date range above for period
          comparisons on these cards.
        </Typography>
        <SummaryCards transactions={transactions} />
      </Box>

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        alignItems="stretch"
        sx={{ position: "relative", zIndex: 2 }}
      >
        <Box sx={{ flex: 2, minWidth: 0 }}>
          <TransactionsTable baseTransactions={scopedTransactions} />
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            maxWidth: { lg: 400 },
          }}
        >
          <InsightsSection transactions={transactions} />
        </Box>
      </Stack>
    </Stack>
  );
}
