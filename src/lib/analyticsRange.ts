import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  endOfMonth,
  format,
  isValid,
  max as maxDate,
  min as minDate,
  parseISO,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { totalExpenses, totalIncome } from "@/lib/financeSelectors";
import type {
  AnalyticsBucketMode,
  AnalyticsRangePreset,
  Transaction,
} from "@/types";

export const ANALYTICS_PRESET_LABELS: Record<AnalyticsRangePreset, string> = {
  "7d": "Last 7 days",
  "15d": "Last 15 days",
  "30d": "Last 30 days",
  "1mo": "This month (calendar)",
  "2mo": "Last 2 calendar months",
  "3mo": "Last 3 calendar months",
  "6mo": "Last 6 calendar months",
  "12mo": "Last 12 calendar months",
  custom: "Custom range",
};

const AUTO_DAY_MAX_SPAN = 45;

export type ResolvedAnalyticsRange = { start: Date; end: Date };

export function parseISODateOnly(s: string): Date | null {
  const d = parseISO(s.length >= 10 ? s.slice(0, 10) : s);
  return isValid(d) ? d : null;
}

export function resolveAnalyticsRange(
  preset: AnalyticsRangePreset,
  customStart: string,
  customEnd: string,
  now: Date = new Date()
): ResolvedAnalyticsRange {
  if (preset === "custom") {
    let a = parseISODateOnly(customStart) ?? startOfDay(now);
    let b = parseISODateOnly(customEnd) ?? endOfDay(now);
    let start = startOfDay(a);
    let end = endOfDay(b);
    if (start.getTime() > end.getTime()) {
      [start, end] = [startOfDay(b), endOfDay(a)];
    }
    return { start, end };
  }

  const endMonth = endOfMonth(now);

  if (preset === "7d") {
    return {
      start: startOfDay(subDays(now, 6)),
      end: endOfDay(now),
    };
  }
  if (preset === "15d") {
    return {
      start: startOfDay(subDays(now, 14)),
      end: endOfDay(now),
    };
  }
  if (preset === "30d") {
    return {
      start: startOfDay(subDays(now, 29)),
      end: endOfDay(now),
    };
  }

  const calendarMonths = (n: number) => ({
    start: startOfMonth(subMonths(endMonth, n - 1)),
    end: endMonth,
  });

  if (preset === "1mo") return calendarMonths(1);
  if (preset === "2mo") return calendarMonths(2);
  if (preset === "3mo") return calendarMonths(3);
  if (preset === "6mo") return calendarMonths(6);
  if (preset === "12mo") return calendarMonths(12);

  return calendarMonths(6);
}

export function effectiveBucket(
  start: Date,
  end: Date,
  mode: AnalyticsBucketMode
): "day" | "month" {
  if (mode === "day") return "day";
  if (mode === "month") return "month";
  const span =
    Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
  return span <= AUTO_DAY_MAX_SPAN ? "day" : "month";
}

export function filterTransactionsInRange(
  transactions: Transaction[],
  start: Date,
  end: Date
): Transaction[] {
  const t0 = start.getTime();
  const t1 = end.getTime();
  return transactions.filter((t) => {
    const d = parseISO(t.date);
    if (!isValid(d)) return false;
    const x = d.getTime();
    return x >= t0 && x <= t1;
  });
}

export function formatRangeSummary(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const a = sameYear
    ? format(start, "MMM d")
    : format(start, "MMM d, yyyy");
  const b = format(end, "MMM d, yyyy");
  return `${a} – ${b}`;
}

export type BalanceTrendPoint = {
  key: string;
  label: string;
  balance: number;
};

export function buildBalanceTrendSeries(
  transactions: Transaction[],
  start: Date,
  end: Date,
  bucket: "day" | "month"
): BalanceTrendPoint[] {
  const filtered = filterTransactionsInRange(transactions, start, end);
  let cumulative = 0;

  if (bucket === "day") {
    const from = startOfDay(start);
    const to = endOfDay(end);
    const days = eachDayOfInterval({ start: from, end: to });
    return days.map((d) => {
      const d0 = startOfDay(d).getTime();
      const d1 = endOfDay(d).getTime();
      const inDay = filtered.filter((t) => {
        const x = parseISO(t.date);
        if (!isValid(x)) return false;
        const xt = x.getTime();
        return xt >= d0 && xt <= d1;
      });
      const net = totalIncome(inDay) - totalExpenses(inDay);
      cumulative += net;
      return {
        key: format(d, "yyyy-MM-dd"),
        label: format(d, "MMM d"),
        balance: cumulative,
      };
    });
  }

  const rangeStart = startOfMonth(start);
  const rangeEnd = endOfMonth(end);
  const months = eachMonthOfInterval({ start: rangeStart, end: rangeEnd });

  return months.map((m) => {
    const monthStart = startOfMonth(m);
    const monthEnd = endOfMonth(m);
    const bucketStart = maxDate([monthStart, startOfDay(start)]);
    const bucketEnd = minDate([monthEnd, endOfDay(end)]);
    const inMonth = filtered.filter((t) => {
      const x = parseISO(t.date);
      if (!isValid(x)) return false;
      const xt = x.getTime();
      return xt >= bucketStart.getTime() && xt <= bucketEnd.getTime();
    });
    const net = totalIncome(inMonth) - totalExpenses(inMonth);
    cumulative += net;
    return {
      key: format(m, "yyyy-MM"),
      label: format(m, "MMM yy"),
      balance: cumulative,
    };
  });
}
