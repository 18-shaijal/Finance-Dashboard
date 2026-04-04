import { useMemo } from "react";
import { formatCurrency, formatShortDate } from "@/lib/formatCurrency";
import { useFinanceStore } from "@/store/useFinanceStore";

export function useFormatMoney() {
  const currency = useFinanceStore((s) => s.transactionCurrency);
  return useMemo(
    () => ({
      currency,
      format: (amount: number) => formatCurrency(amount, currency),
      formatDate: (iso: string) => formatShortDate(iso, currency),
    }),
    [currency]
  );
}
