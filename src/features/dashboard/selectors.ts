import {
  CATEGORY_LABELS,
  type Category,
  type Transaction,
} from "@/features/transactions/transaction";

export interface DashboardFilters {
  startDate: string;
  endDate: string;
  category: Category | "all";
}

export interface DashboardSummary {
  incomeCents: number;
  expensesCents: number;
  balanceCents: number;
  transactionCount: number;
}

export interface CategorySpending {
  category: Category;
  label: string;
  amountCents: number;
}

export interface MonthlyTotals {
  month: string;
  label: string;
  incomeCents: number;
  expensesCents: number;
}

export function filterTransactions(
  transactions: Transaction[],
  filters: DashboardFilters,
): Transaction[] {
  if (filters.startDate > filters.endDate) return [];

  return transactions.filter((transaction) => {
    const inDateRange =
      transaction.date >= filters.startDate &&
      transaction.date <= filters.endDate;
    const inCategory =
      filters.category === "all" || transaction.category === filters.category;

    return inDateRange && inCategory;
  });
}

export function getDashboardSummary(
  transactions: Transaction[],
): DashboardSummary {
  const totals = transactions.reduce(
    (summary, transaction) => {
      if (transaction.type === "income")
        summary.incomeCents += transaction.amountCents;
      else summary.expensesCents += transaction.amountCents;
      return summary;
    },
    {
      incomeCents: 0,
      expensesCents: 0,
      balanceCents: 0,
      transactionCount: transactions.length,
    },
  );

  return { ...totals, balanceCents: totals.incomeCents - totals.expensesCents };
}

export function getSpendingByCategory(
  transactions: Transaction[],
): CategorySpending[] {
  const totals = new Map<Category, number>();

  for (const transaction of transactions) {
    if (transaction.type === "expense") {
      totals.set(
        transaction.category,
        (totals.get(transaction.category) ?? 0) + transaction.amountCents,
      );
    }
  }

  return Array.from(totals, ([category, amountCents]) => ({
    category,
    label: CATEGORY_LABELS[category],
    amountCents,
  })).sort((left, right) => right.amountCents - left.amountCents);
}

function monthKey(date: string): string {
  return date.slice(0, 7);
}

export function getMonthlyTotals(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
): MonthlyTotals[] {
  if (startDate > endDate) return [];

  const monthlyTotals = new Map<string, MonthlyTotals>();
  const start = new Date(`${monthKey(startDate)}-01T12:00:00`);
  const end = new Date(`${monthKey(endDate)}-01T12:00:00`);

  for (
    const cursor = new Date(start);
    cursor <= end;
    cursor.setMonth(cursor.getMonth() + 1)
  ) {
    const month = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    monthlyTotals.set(month, {
      month,
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(
        cursor,
      ),
      incomeCents: 0,
      expensesCents: 0,
    });
  }

  for (const transaction of transactions) {
    if (transaction.date < startDate || transaction.date > endDate) continue;
    const total = monthlyTotals.get(monthKey(transaction.date));
    if (!total) continue;
    if (transaction.type === "income")
      total.incomeCents += transaction.amountCents;
    else total.expensesCents += transaction.amountCents;
  }

  return Array.from(monthlyTotals.values());
}
