export type UserRole = "viewer" | "admin";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: TransactionType;
  description: string;
}

export type SortField = "date" | "amount";
export type SortDirection = "asc" | "desc";
export type FilterType = "all" | TransactionType;

/** Presets for analytics charts (balance trend + spending breakdown). */
export type AnalyticsRangePreset =
  | "7d"
  | "15d"
  | "30d"
  | "1mo"
  | "2mo"
  | "3mo"
  | "6mo"
  | "12mo"
  | "custom";

/** How to bucket the balance trend; auto picks day vs month from span length. */
export type AnalyticsBucketMode = "auto" | "day" | "month";
