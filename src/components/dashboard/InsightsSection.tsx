import InsightsOutlined from "@mui/icons-material/InsightsOutlined";
import {
  Card,
  CardContent,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  highestExpenseCategory,
  totalExpenses,
} from "@/lib/financeSelectors";
import { filterTransactionsInRange, resolveAnalyticsRange } from "@/lib/analyticsRange";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Transaction } from "@/types";

export default function InsightsSection({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const preset = useFinanceStore((s) => s.analyticsRangePreset);
  const customStart = useFinanceStore((s) => s.analyticsCustomStart);
  const customEnd = useFinanceStore((s) => s.analyticsCustomEnd);

  const range = resolveAnalyticsRange(preset, customStart, customEnd);
  const scoped = filterTransactionsInRange(transactions, range.start, range.end);
  const expenseOnly = scoped.filter((t) => t.type === "expense");
  const avgExpense =
    expenseOnly.length === 0 ? 0 : totalExpenses(scoped) / expenseOnly.length;

  const high = highestExpenseCategory(scoped);

  const spanDays = Math.max(
    1,
    differenceInCalendarDays(range.end, range.start) + 1
  );
  const prevStart = subDays(range.start, spanDays);
  const prevEnd = subDays(range.start, 1);
  const prevScoped = filterTransactionsInRange(transactions, prevStart, prevEnd);

  const thisExpenses = totalExpenses(scoped);
  const lastExpenses = totalExpenses(prevScoped);
  const diff = thisExpenses - lastExpenses;
  const pct =
    lastExpenses === 0 ? (thisExpenses > 0 ? 100 : 0) : (diff / lastExpenses) * 100;

  const items: { primary: string; secondary: string }[] = [];

  if (scoped.length === 0) {
    items.push({
      primary: "Nothing in this range",
      secondary: "Move the dates or add rows that fall inside the window.",
    });
  } else {
    if (expenseOnly.length === 0) {
      items.push({
        primary: "No expenses here",
        secondary: "Category breakdown needs at least one expense line.",
      });
    }
    if (high) {
      items.push({
        primary: `Top category: ${high.name}`,
        secondary: `${formatCurrency(high.value)} in this range.`,
      });
    }
    items.push({
      primary: "Expenses vs last window",
      secondary:
        lastExpenses === 0 && thisExpenses === 0
          ? "Zero in both windows."
          : `${formatCurrency(thisExpenses)} now vs ${formatCurrency(
              lastExpenses
            )} before (${diff >= 0 ? "+" : ""}${pct.toFixed(1)}%).`,
    });
    items.push({
      primary: "Snapshot",
      secondary: `${scoped.length} rows${expenseOnly.length ? ` · avg expense ${formatCurrency(avgExpense)}` : ""}`,
    });
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: "divider",
        height: "100%",
        "&:hover": { boxShadow: 2, borderColor: "secondary.main" },
      }}
    >
      <CardContent sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <InsightsOutlined color="secondary" />
          <Typography variant="subtitle1" fontWeight={600}>
            Insights
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          As of {format(new Date(), "MMM d, yyyy")}
        </Typography>
        <List dense disablePadding>
          {items.map((it, i) => (
            <ListItemButton
              key={i}
              alignItems="flex-start"
              sx={{
                px: 0,
                py: 1,
                borderRadius: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Typography variant="body2" color="primary" fontWeight={700}>
                  {i + 1}.
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={it.primary}
                secondary={it.secondary}
                primaryTypographyProps={{ fontWeight: 600 }}
                secondaryTypographyProps={{
                  sx: { wordBreak: "break-word", lineHeight: 1.5 },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
