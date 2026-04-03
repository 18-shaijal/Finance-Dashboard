import AddOutlined from "@mui/icons-material/AddOutlined";
import DeleteOutline from "@mui/icons-material/DeleteOutline";
import EditOutlined from "@mui/icons-material/EditOutlined";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import FilterAltOffOutlined from "@mui/icons-material/FilterAltOffOutlined";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_CATEGORIES } from "@/data/seedTransactions";
import { exportTransactionsCsv, exportTransactionsJson } from "@/lib/exportTransactions";
import { formatCurrency, formatShortDate } from "@/lib/formatCurrency";
import { useFinanceStore } from "@/store/useFinanceStore";
import type { Transaction } from "@/types";
import TransactionDialog from "./TransactionDialog";

const EMPTY_TX: Transaction[] = [];

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_ROWS_PER_PAGE = 10;

const paginationBarSx = {
  borderTop: 1,
  borderColor: "divider",
  "& .MuiTablePagination-toolbar": {
    flexWrap: "wrap",
    justifyContent: { xs: "center", sm: "flex-end" },
    gap: 1,
    py: { xs: 1.25, sm: 0.5 },
    px: { xs: 0.5, sm: 2 },
  },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
    fontSize: { xs: "0.75rem", sm: "0.875rem" },
  },
};

function TypeChip({ type }: { type: Transaction["type"] }) {
  return (
    <Chip
      size="small"
      label={type === "income" ? "Income" : "Expense"}
      color={type === "income" ? "success" : "error"}
      variant="outlined"
    />
  );
}

export default function TransactionsTable({
  baseTransactions,
}: {
  baseTransactions?: Transaction[];
}) {
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down("md"));
  const compactLabels = useMediaQuery(theme.breakpoints.down("sm"));

  const storeTransactions = useFinanceStore((s) => s.transactions ?? EMPTY_TX);
  const transactions = baseTransactions ?? storeTransactions;
  const role = useFinanceStore((s) => s.role);
  const searchQuery = useFinanceStore((s) => s.searchQuery);
  const filterType = useFinanceStore((s) => s.filterType);
  const filterCategory = useFinanceStore((s) => s.filterCategory);
  const sortBy = useFinanceStore((s) => s.sortBy);
  const sortDir = useFinanceStore((s) => s.sortDir);

  const setSearchQuery = useFinanceStore((s) => s.setSearchQuery);
  const setFilterType = useFinanceStore((s) => s.setFilterType);
  const setFilterCategory = useFinanceStore((s) => s.setFilterCategory);
  const setSort = useFinanceStore((s) => s.setSort);
  const toggleSortDir = useFinanceStore((s) => s.toggleSortDir);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const clearTableFilters = useFinanceStore((s) => s.clearTableFilters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [toast, setToast] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>(ALL_CATEGORIES);
    transactions.forEach((t) => set.add(t.category));
    return ["all", ...Array.from(set).sort()];
  }, [transactions]);

  const filterTypeValue =
    filterType === "income" || filterType === "expense" || filterType === "all"
      ? filterType
      : "all";

  const filterCategoryValue = categoryOptions.includes(filterCategory)
    ? filterCategory
    : "all";

  const sortByValue = sortBy === "amount" ? "amount" : "date";
  const sortDirValue = sortDir === "asc" ? "asc" : "desc";

  const filtered = useMemo(() => {
    let list = [...transactions];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (t) =>
          (t.description ?? "").toLowerCase().includes(q) ||
          (t.category ?? "").toLowerCase().includes(q)
      );
    }

    if (filterTypeValue !== "all") {
      list = list.filter((t) => t.type === filterTypeValue);
    }

    if (filterCategoryValue !== "all") {
      list = list.filter((t) => t.category === filterCategoryValue);
    }

    list.sort((a, b) => {
      const dir = sortDirValue === "asc" ? 1 : -1;
      if (sortByValue === "amount") {
        const aa = Number(a.amount);
        const bb = Number(b.amount);
        return (
          ((Number.isFinite(aa) ? aa : 0) - (Number.isFinite(bb) ? bb : 0)) *
          dir
        );
      }
      const ad = new Date(a.date).getTime();
      const bd = new Date(b.date).getTime();
      return ((Number.isFinite(ad) ? ad : 0) - (Number.isFinite(bd) ? bd : 0)) * dir;
    });

    return list;
  }, [
    transactions,
    searchQuery,
    filterTypeValue,
    filterCategoryValue,
    sortByValue,
    sortDirValue,
  ]);

  useEffect(() => {
    setPage(0);
  }, [
    searchQuery,
    filterTypeValue,
    filterCategoryValue,
    sortBy,
    sortDir,
    transactions,
  ]);

  const maxPage = Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1);
  useEffect(() => {
    if (page > maxPage) setPage(maxPage);
  }, [page, maxPage]);

  const paginated = useMemo(
    () =>
      filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const isAdmin = role === "admin";

  const hasTableFilters =
    searchQuery.trim().length > 0 ||
    filterTypeValue !== "all" ||
    filterCategoryValue !== "all";

  const openCreate = () => {
    setDialogMode("create");
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (t: Transaction) => {
    setDialogMode("edit");
    setEditing(t);
    setDialogOpen(true);
  };

  const handleSave = (payload: Omit<Transaction, "id">) => {
    if (dialogMode === "create") {
      addTransaction(payload);
      setToast("Transaction added");
    } else if (editing) {
      updateTransaction(editing.id, payload);
      setToast("Transaction updated");
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const inInput =
        tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if (e.key === "/" && !inInput) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((e.key === "a" || e.key === "A") && !inInput && isAdmin) {
        e.preventDefault();
        openCreate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin]);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderColor: "divider",
        overflow: "hidden",
        "&:hover": { boxShadow: 2 },
      }}
    >
      <Toolbar
        sx={{
          flexWrap: "wrap",
          gap: 1,
          rowGap: 1.5,
          py: 1.5,
          px: { xs: 1.5, sm: 2 },
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
          Transactions
        </Typography>
        {isAdmin && (
          <Button
            startIcon={<AddOutlined />}
            variant="contained"
            size="small"
            onClick={openCreate}
            sx={{ flexShrink: 0 }}
          >
            Add
          </Button>
        )}
        <Button
          size="small"
          variant="outlined"
          startIcon={<FileDownloadOutlined />}
          onClick={() => exportTransactionsCsv(filtered)}
          sx={{ flexShrink: 0 }}
        >
          CSV
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => exportTransactionsJson(filtered)}
          sx={{ flexShrink: 0 }}
        >
          JSON
        </Button>
      </Toolbar>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ p: { xs: 1.5, sm: 2 }, pb: 1 }}
        flexWrap="wrap"
      >
        <TextField
          size="small"
          placeholder="Search description or category"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          inputRef={searchInputRef}
          sx={{ minWidth: { xs: 0, sm: 200 }, width: { xs: "100%", sm: "auto" }, flex: { sm: 1 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Type"
          size="small"
          sx={{ minWidth: { xs: 0, sm: 120 }, width: { xs: "100%", sm: "auto" } }}
          value={filterTypeValue}
          onChange={(e) =>
            setFilterType(e.target.value as typeof filterType)
          }
          SelectProps={{ native: true }}
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </TextField>
        <TextField
          select
          label="Category"
          size="small"
          sx={{ minWidth: { xs: 0, sm: 160 }, width: { xs: "100%", sm: "auto" } }}
          value={filterCategoryValue}
          onChange={(e) => setFilterCategory(e.target.value)}
          SelectProps={{ native: true }}
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "All categories" : c}
            </option>
          ))}
        </TextField>
        <TextField
          select
          label="Sort"
          size="small"
          sx={{ minWidth: { xs: 0, sm: 120 }, width: { xs: "100%", sm: "auto" } }}
          value={sortByValue}
          onChange={(e) =>
            setSort(e.target.value as typeof sortBy, sortDirValue)
          }
          SelectProps={{ native: true }}
        >
          <option value="date">Date</option>
          <option value="amount">Amount</option>
        </TextField>
        <Button
          size="small"
          variant="text"
          onClick={toggleSortDir}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          {compactLabels
            ? sortDirValue === "asc"
              ? "Order: Asc"
              : "Order: Desc"
            : `Order: ${sortDirValue === "asc" ? "Ascending" : "Descending"}`}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: "auto" } }}>
          Shortcuts: `/` search, `A` add, `?` help
        </Typography>
      </Stack>

      {hasTableFilters && (
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            pb: 1,
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Chip
            size="small"
            icon={<FilterAltOffOutlined />}
            label="Clear filters"
            onClick={() => {
              clearTableFilters();
              setToast("Filters cleared");
            }}
            variant="outlined"
            color="primary"
            sx={{ cursor: "pointer" }}
          />
        </Box>
      )}

      {filtered.length === 0 ? (
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 4, sm: 5 },
            textAlign: "center",
            maxWidth: 480,
            mx: "auto",
          }}
          role="status"
          aria-live="polite"
        >
          <InboxOutlined
            sx={{ fontSize: { xs: 40, sm: 48 }, color: "text.disabled", mb: 1.5 }}
            aria-hidden
          />
          <Typography color="text.secondary" gutterBottom fontWeight={600}>
            {storeTransactions.length === 0
              ? "No transactions yet"
              : "No matches for this filter"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            {storeTransactions.length === 0
              ? "Admin can add rows; header reset loads the seed set."
              : "Clear filters or widen the date range."}
          </Typography>
        </Box>
      ) : narrow ? (
        <Stack spacing={1} sx={{ p: { xs: 1.5, sm: 2 }, pt: 0 }}>
          {paginated.map((row) => (
            <Paper
              key={row.id}
              variant="outlined"
              sx={{
                p: 1.5,
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                "&:active": { transform: "scale(0.998)" },
                "&:hover": { boxShadow: 2, borderColor: "action.hover" },
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2">
                    {formatShortDate(row.date)}
                  </Typography>
                  <TypeChip type={row.type} />
                </Stack>
                <Typography fontWeight={700}>
                  {row.type === "expense" ? "−" : "+"}
                  {formatCurrency(row.amount)}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ wordBreak: "break-word" }}
                >
                  {row.category} · {row.description}
                </Typography>
                {isAdmin && (
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(row)}
                      aria-label="Edit transaction"
                      title="Edit"
                    >
                      <EditOutlined fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        if (
                          typeof window !== "undefined" &&
                          window.confirm("Delete this transaction?")
                        ) {
                          deleteTransaction(row.id);
                          setToast("Transaction deleted");
                        }
                      }}
                      aria-label="Delete transaction"
                      title="Delete"
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </Stack>
                )}
              </Stack>
            </Paper>
          ))}
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[...ROWS_PER_PAGE_OPTIONS]}
            labelRowsPerPage={compactLabels ? "Rows" : "Rows per page"}
            sx={paginationBarSx}
          />
        </Stack>
      ) : (
        <TableContainer
          sx={{
            overflowX: "auto",
            maxWidth: "100%",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Table
            size="small"
            sx={{
              minWidth: 640,
              "& .MuiTableRow-root": {
                transition: "background-color 0.15s ease",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                {isAdmin && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{formatShortDate(row.date)}</TableCell>
                  <TableCell align="right">
                    {row.type === "expense" ? "−" : "+"}
                    {formatCurrency(row.amount)}
                  </TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>
                    <TypeChip type={row.type} />
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: { md: 240, lg: 320 },
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={row.description}
                  >
                    {row.description}
                  </TableCell>
                  {isAdmin && (
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => openEdit(row)}
                        aria-label="Edit transaction"
                        title="Edit"
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          if (
                            typeof window !== "undefined" &&
                            window.confirm("Delete this transaction?")
                          ) {
                            deleteTransaction(row.id);
                            setToast("Transaction deleted");
                          }
                        }}
                        aria-label="Delete transaction"
                        title="Delete"
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[...ROWS_PER_PAGE_OPTIONS]}
            labelRowsPerPage={compactLabels ? "Rows" : "Rows per page"}
            sx={paginationBarSx}
          />
        </TableContainer>
      )}

      <TransactionDialog
        open={dialogOpen}
        mode={dialogMode}
        initial={editing}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
      <Snackbar
        open={toast != null}
        autoHideDuration={2200}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setToast(null)} severity="success" variant="filled">
          {toast}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
