import type { Transaction } from "@/types";

function escapeCsvCell(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportTransactionsCsv(transactions: Transaction[]) {
  const headers = ["date", "amount", "category", "type", "description"];
  const lines = [
    headers.join(","),
    ...transactions.map((t) =>
      [
        t.date,
        String(t.amount),
        escapeCsvCell(t.category),
        t.type,
        escapeCsvCell(t.description),
      ].join(",")
    ),
  ];
  const blob = new Blob([lines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTransactionsJson(transactions: Transaction[]) {
  const blob = new Blob([JSON.stringify(transactions, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
