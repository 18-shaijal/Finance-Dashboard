export const SUPPORTED_TRANSACTION_CURRENCIES = [
  { code: "INR", label: "INR — Indian rupee" },
  { code: "USD", label: "USD — US dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — Pound sterling" },
  { code: "AED", label: "AED — UAE dirham" },
  { code: "SGD", label: "SGD — Singapore dollar" },
  { code: "JPY", label: "JPY — Japanese yen" },
] as const;

export type TransactionCurrencyCode =
  (typeof SUPPORTED_TRANSACTION_CURRENCIES)[number]["code"];

export const DEFAULT_TRANSACTION_CURRENCY: TransactionCurrencyCode = "INR";

export function isSupportedTransactionCurrency(
  c: string
): c is TransactionCurrencyCode {
  return SUPPORTED_TRANSACTION_CURRENCIES.some((x) => x.code === c);
}

/** Locale hint for Intl number/date formatting (not a full i18n pass). */
export function localeForCurrency(code: string): string {
  const map: Record<string, string> = {
    INR: "en-IN",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    AED: "en-AE",
    SGD: "en-SG",
    JPY: "ja-JP",
  };
  return map[code] ?? "en-IN";
}

export function getCurrencySymbol(code: string): string {
  try {
    const fmt = new Intl.NumberFormat(localeForCurrency(code), {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return fmt.formatToParts(0).find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}
