import { describe, expect, it } from "vitest";
import {
  filterTransactions,
  getDashboardSummary,
  getMonthlyTotals,
  getSpendingByCategory,
} from "./selectors";
import type { Transaction } from "@/features/transactions/transaction";

const transactions: Transaction[] = [
  {
    id: "salary",
    description: "Paycheck",
    amountCents: 500000,
    date: "2026-09-01",
    category: "salary",
    type: "income",
  },
  {
    id: "market",
    description: "Groceries",
    amountCents: 12500,
    date: "2026-09-10",
    category: "groceries",
    type: "expense",
  },
  {
    id: "dinner",
    description: "Dinner",
    amountCents: 8500,
    date: "2026-09-30",
    category: "dining",
    type: "expense",
  },
];

describe("dashboard selectors", () => {
  it("filters by inclusive date range and category together", () => {
    expect(
      filterTransactions(transactions, {
        startDate: "2026-09-10",
        endDate: "2026-09-30",
        category: "groceries",
      }).map((transaction) => transaction.id),
    ).toEqual(["market"]);
  });

  it("returns zero totals for an empty result and nets income against expenses", () => {
    expect(getDashboardSummary([])).toEqual({
      incomeCents: 0,
      expensesCents: 0,
      balanceCents: 0,
      transactionCount: 0,
    });
    expect(getDashboardSummary(transactions)).toEqual({
      incomeCents: 500000,
      expensesCents: 21000,
      balanceCents: 479000,
      transactionCount: 3,
    });
  });

  it("groups monthly totals and excludes income from category spending", () => {
    expect(getMonthlyTotals(transactions, "2026-09-10", "2026-09-30")).toEqual([
      { month: "2026-09", label: "Sep", incomeCents: 0, expensesCents: 21000 },
    ]);
    expect(getSpendingByCategory(transactions)).toEqual([
      { category: "groceries", label: "Groceries", amountCents: 12500 },
      { category: "dining", label: "Dining", amountCents: 8500 },
    ]);
  });

  it("returns no records for an invalid date range", () => {
    expect(
      filterTransactions(transactions, {
        startDate: "2026-10-01",
        endDate: "2026-09-01",
        category: "all",
      }),
    ).toEqual([]);
    expect(getMonthlyTotals(transactions, "2026-10-01", "2026-09-01")).toEqual(
      [],
    );
  });
});
