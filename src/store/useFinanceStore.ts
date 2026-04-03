import { format, subMonths } from "date-fns";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ALL_CATEGORIES, seedTransactions } from "@/data/seedTransactions";
import { getClientStorage, withPersistWriteDedupe } from "@/lib/storage";
import type {
  AnalyticsBucketMode,
  AnalyticsRangePreset,
  FilterType,
  SortDirection,
  SortField,
  Transaction,
  UserRole,
} from "@/types";

const _initCustom = (() => {
  const t = new Date();
  return {
    analyticsCustomStart: format(subMonths(t, 1), "yyyy-MM-dd"),
    analyticsCustomEnd: format(t, "yyyy-MM-dd"),
  };
})();

const STORAGE_KEY = "finance-dashboard-v1";

const jsonPersistStorage = createJSONStorage(getClientStorage);

export interface FinanceState {
  transactions: Transaction[];
  role: UserRole;
  searchQuery: string;
  filterType: FilterType;
  filterCategory: string;
  sortBy: SortField;
  sortDir: SortDirection;
  colorMode: "light" | "dark";
  analyticsRangePreset: AnalyticsRangePreset;
  analyticsCustomStart: string;
  analyticsCustomEnd: string;
  analyticsBucket: AnalyticsBucketMode;
  setRole: (role: UserRole) => void;
  setSearchQuery: (q: string) => void;
  setFilterType: (f: FilterType) => void;
  setFilterCategory: (c: string) => void;
  setSort: (by: SortField, dir: SortDirection) => void;
  toggleSortDir: () => void;
  setColorMode: (m: "light" | "dark") => void;
  setAnalyticsRangePreset: (p: AnalyticsRangePreset) => void;
  setAnalyticsCustomRange: (start: string, end: string) => void;
  setAnalyticsBucket: (b: AnalyticsBucketMode) => void;
  clearTableFilters: () => void;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  resetToSeed: () => void;
}

function newId() {
  return `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: seedTransactions,
      role: "viewer",
      searchQuery: "",
      filterType: "all",
      filterCategory: "all",
      sortBy: "date",
      sortDir: "desc",
      colorMode: "light",
      analyticsRangePreset: "6mo",
      analyticsCustomStart: _initCustom.analyticsCustomStart,
      analyticsCustomEnd: _initCustom.analyticsCustomEnd,
      analyticsBucket: "auto",

      setRole: (role) => set((s) => (s.role === role ? s : { role })),
      setSearchQuery: (searchQuery) =>
        set((s) => (s.searchQuery === searchQuery ? s : { searchQuery })),
      setFilterType: (filterType) =>
        set((s) => (s.filterType === filterType ? s : { filterType })),
      setFilterCategory: (filterCategory) =>
        set((s) =>
          s.filterCategory === filterCategory ? s : { filterCategory }
        ),
      setSort: (sortBy, sortDir) =>
        set((s) =>
          s.sortBy === sortBy && s.sortDir === sortDir ? s : { sortBy, sortDir }
        ),
      toggleSortDir: () =>
        set((s) => {
          const cur = s.sortDir === "asc" ? "asc" : "desc";
          return { sortDir: cur === "asc" ? "desc" : "asc" };
        }),
      setColorMode: (colorMode) =>
        set((s) => (s.colorMode === colorMode ? s : { colorMode })),

      setAnalyticsRangePreset: (analyticsRangePreset) =>
        set((s) =>
          s.analyticsRangePreset === analyticsRangePreset
            ? s
            : { analyticsRangePreset }
        ),
      setAnalyticsCustomRange: (analyticsCustomStart, analyticsCustomEnd) =>
        set({
          analyticsCustomStart,
          analyticsCustomEnd,
          analyticsRangePreset: "custom",
        }),
      setAnalyticsBucket: (analyticsBucket) =>
        set((s) => (s.analyticsBucket === analyticsBucket ? s : { analyticsBucket })),

      clearTableFilters: () =>
        set((s) =>
          s.searchQuery === "" &&
          s.filterType === "all" &&
          s.filterCategory === "all"
            ? s
            : {
                searchQuery: "",
                filterType: "all",
                filterCategory: "all",
              }
        ),

      addTransaction: (t) =>
        set((s) => ({
          transactions: [
            { ...t, id: newId() },
            ...(s.transactions ?? []),
          ],
        })),

      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: (s.transactions ?? []).map((x) =>
            x.id === id ? { ...x, ...patch } : x
          ),
        })),

      deleteTransaction: (id) =>
        set((s) => ({
          transactions: (s.transactions ?? []).filter((x) => x.id !== id),
        })),

      resetToSeed: () => set({ transactions: [...seedTransactions] }),
    }),
    {
      name: STORAGE_KEY,
      storage:
        withPersistWriteDedupe(jsonPersistStorage) ?? jsonPersistStorage,
      partialize: (s) => ({
        transactions: s.transactions,
        colorMode: s.colorMode,
        analyticsRangePreset: s.analyticsRangePreset,
        analyticsCustomStart: s.analyticsCustomStart,
        analyticsCustomEnd: s.analyticsCustomEnd,
        analyticsBucket: s.analyticsBucket,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<FinanceState> | undefined;
        if (!p || typeof p !== "object") return current;

        const validPresets: AnalyticsRangePreset[] = [
          "7d",
          "15d",
          "30d",
          "1mo",
          "2mo",
          "3mo",
          "6mo",
          "12mo",
          "custom",
        ];
        const presetOk =
          typeof p.analyticsRangePreset === "string" &&
          validPresets.includes(p.analyticsRangePreset as AnalyticsRangePreset)
            ? (p.analyticsRangePreset as AnalyticsRangePreset)
            : current.analyticsRangePreset;

        const bucketOk =
          p.analyticsBucket === "auto" ||
          p.analyticsBucket === "day" ||
          p.analyticsBucket === "month"
            ? p.analyticsBucket
            : current.analyticsBucket;

        const startOk =
          typeof p.analyticsCustomStart === "string" &&
          p.analyticsCustomStart.length >= 8
            ? p.analyticsCustomStart
            : current.analyticsCustomStart;
        const endOk =
          typeof p.analyticsCustomEnd === "string" &&
          p.analyticsCustomEnd.length >= 8
            ? p.analyticsCustomEnd
            : current.analyticsCustomEnd;

        return {
          ...current,
          transactions: Array.isArray(p.transactions)
            ? p.transactions
            : current.transactions,
          colorMode:
            p.colorMode === "dark" || p.colorMode === "light"
              ? p.colorMode
              : current.colorMode,
          analyticsRangePreset: presetOk,
          analyticsCustomStart: startOk,
          analyticsCustomEnd: endOk,
          analyticsBucket: bucketOk,
        };
      },
    }
  )
);

function normalizeFilters(state: FinanceState) {
  const txs = state.transactions ?? [];

  const filterType: FilterType =
    state.filterType === "income" ||
    state.filterType === "expense" ||
    state.filterType === "all"
      ? state.filterType
      : "all";

  const validCategories = new Set<string>(["all", ...ALL_CATEGORIES]);
  txs.forEach((t) => validCategories.add(t.category));
  const filterCategory = validCategories.has(state.filterCategory)
    ? state.filterCategory
    : "all";

  const sortBy: SortField = state.sortBy === "amount" ? "amount" : "date";
  const sortDir: SortDirection =
    state.sortDir === "asc" || state.sortDir === "desc"
      ? state.sortDir
      : "desc";

  return { txs, filterType, filterCategory, sortBy, sortDir };
}

export function selectFilteredSortedTransactions(state: FinanceState) {
  const { txs, filterType, filterCategory, sortBy, sortDir } =
    normalizeFilters(state);
  let list = [...txs];
  const q = state.searchQuery.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (t) =>
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.category ?? "").toLowerCase().includes(q)
    );
  }
  if (filterType !== "all") {
    list = list.filter((t) => t.type === filterType);
  }
  if (filterCategory !== "all") {
    list = list.filter((t) => t.category === filterCategory);
  }
  list.sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortBy === "amount") {
      const aa = Number(a.amount);
      const bb = Number(b.amount);
      return (
        ((Number.isFinite(aa) ? aa : 0) - (Number.isFinite(bb) ? bb : 0)) * dir
      );
    }
    const ad = new Date(a.date).getTime();
    const bd = new Date(b.date).getTime();
    return ((Number.isFinite(ad) ? ad : 0) - (Number.isFinite(bd) ? bd : 0)) * dir;
  });
  return list;
}
