import { Box, Stack, Typography } from "@mui/material";
import BalanceTrendChart from "@/components/dashboard/BalanceTrendChart";
import SpendingBreakdownChart from "@/components/dashboard/SpendingBreakdownChart";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Transaction } from "@/types";

const EMPTY_TX: Transaction[] = [];

export default function AnalyticsPage() {
  const transactions = useFinanceStore((s) => s.transactions ?? EMPTY_TX);

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
          Balance trend and spending breakdown for the universal date range above.
          Click the line or pie slices to narrow filters on the Overview page.
        </Typography>
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 0,
          isolation: "isolate",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="stretch">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <BalanceTrendChart transactions={transactions} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SpendingBreakdownChart transactions={transactions} />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
