import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/data/seedTransactions";
import type { Transaction, TransactionType } from "@/types";

type Mode = "create" | "edit";

const initialForm = {
  date: "",
  amount: "",
  category: "",
  type: "expense" as TransactionType,
  description: "",
};

export default function TransactionDialog({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: Mode;
  initial: Transaction | null;
  onClose: () => void;
  onSave: (payload: Omit<Transaction, "id">) => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [form, setForm] = useState(initialForm);

  const categories = useMemo(() => {
    return form.type === "expense"
      ? [...EXPENSE_CATEGORIES]
      : [...INCOME_CATEGORIES];
  }, [form.type]);

  // Depend on initial?.id only — `initial` object identity from parent can change every render
  // and would re-fire this effect + setForm in an infinite loop.
  const initialId = initial?.id;
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      const catList =
        initial.type === "expense"
          ? EXPENSE_CATEGORIES
          : INCOME_CATEGORIES;
      const category = (catList as readonly string[]).includes(
        initial.category
      )
        ? initial.category
        : catList[0];
      setForm({
        date: initial.date,
        amount: String(initial.amount),
        category,
        type: initial.type,
        description: initial.description,
      });
    } else {
      setForm({
        ...initialForm,
        date: new Date().toISOString().slice(0, 10),
        category: EXPENSE_CATEGORIES[0],
        type: "expense",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial fields read when id/edit mode match
  }, [open, mode, initialId]);

  const handleSubmit = () => {
    const amount = Number.parseFloat(form.amount);
    if (!form.date || Number.isNaN(amount) || amount <= 0 || !form.category) {
      return;
    }
    onSave({
      date: form.date,
      amount,
      category: form.category,
      type: form.type,
      description: form.description.trim() || "—",
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      scroll="paper"
    >
      <DialogTitle>
        {mode === "create" ? "Add transaction" : "Edit transaction"}
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            select
            fullWidth
            label="Type"
            value={form.type}
            onChange={(e) => {
              const type = e.target.value as TransactionType;
              const nextCat =
                type === "expense"
                  ? EXPENSE_CATEGORIES[0]
                  : INCOME_CATEGORIES[0];
              setForm((f) => ({ ...f, type, category: nextCat }));
            }}
            SelectProps={{ native: true }}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </TextField>
          <TextField
            label="Amount"
            type="number"
            inputProps={{ min: 0, step: "0.01" }}
            value={form.amount}
            onChange={(e) =>
              setForm((f) => ({ ...f, amount: e.target.value }))
            }
            fullWidth
          />
          <TextField
            select
            fullWidth
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
            SelectProps={{ native: true }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </TextField>
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            fullWidth
            multiline
            minRows={2}
          />
        </Stack>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          pb: 2,
          flexWrap: "wrap",
          gap: 1,
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {mode === "create" ? "Add" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
