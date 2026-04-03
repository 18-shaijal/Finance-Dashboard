import {
  eachMonthOfInterval,
  endOfMonth,
  format,
  isValid,
  isWithinInterval,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import type { Transaction } from "@/types";

export function totalIncome(transactions: Transaction[]) {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
}

export function totalExpenses(transactions: Transaction[]) {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
}

export function netBalance(transactions: Transaction[]) {
  return totalIncome(transactions) - totalExpenses(transactions);
}

export function spendingByCategory(transactions: Transaction[]) {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function balanceTrendByMonth(
  transactions: Transaction[],
  monthsBack = 6
) {
  const end = endOfMonth(new Date());
  const start = startOfMonth(subMonths(end, monthsBack - 1));
  const months = eachMonthOfInterval({ start, end });

  let cumulative = 0;
  const points: { month: string; label: string; balance: number }[] = [];

  for (const m of months) {
    const interval = { start: startOfMonth(m), end: endOfMonth(m) };
    const inMonth = transactions.filter((t) => {
      const parsed = parseISO(t.date);
      return isValid(parsed) && isWithinInterval(parsed, interval);
    });
    const net =
      totalIncome(inMonth) - totalExpenses(inMonth);
    cumulative += net;
    points.push({
      month: format(m, "yyyy-MM"),
      label: format(m, "MMM yy"),
      balance: cumulative,
    });
  }

  return points;
}

export function highestExpenseCategory(transactions: Transaction[]) {
  const breakdown = spendingByCategory(transactions);
  if (breakdown.length === 0) return null;
  return breakdown[0];
}

export function compareThisMonthVsLast(transactions: Transaction[]) {
  const now = new Date();
  const thisStart = startOfMonth(now);
  const thisEnd = endOfMonth(now);
  const lastStart = startOfMonth(subMonths(now, 1));
  const lastEnd = endOfMonth(subMonths(now, 1));

  const sumExpenses = (start: Date, end: Date) =>
    transactions
      .filter((t) => {
        if (t.type !== "expense") return false;
        const parsed = parseISO(t.date);
        return (
          isValid(parsed) && isWithinInterval(parsed, { start, end })
        );
      })
      .reduce((s, t) => s + t.amount, 0);

  const thisMonth = sumExpenses(thisStart, thisEnd);
  const lastMonth = sumExpenses(lastStart, lastEnd);
  const diff = thisMonth - lastMonth;
  const pct =
    lastMonth === 0 ? (thisMonth > 0 ? 100 : 0) : (diff / lastMonth) * 100;

  return { thisMonth, lastMonth, diff, pct };
}
