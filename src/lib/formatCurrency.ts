import { localeForCurrency } from "./currencies";

export function formatCurrency(amount: number, currencyCode: string) {
  return new Intl.NumberFormat(localeForCurrency(currencyCode), {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortDate(iso: string, currencyCode: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(localeForCurrency(currencyCode), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
