import type { Transaction } from "./transaction";

const MONTHLY_EXPENSES = [
  {
    description: "Apartment rent",
    category: "housing",
    amountCents: 158000,
    day: 2,
  },
  {
    description: "Market groceries",
    category: "groceries",
    amountCents: 52600,
    day: 5,
  },
  {
    description: "Neighborhood cafe",
    category: "dining",
    amountCents: 1840,
    day: 9,
  },
  {
    description: "Transit pass",
    category: "transport",
    amountCents: 12600,
    day: 12,
  },
  {
    description: "Weekly dinner",
    category: "dining",
    amountCents: 6840,
    day: 16,
  },
  {
    description: "Wellness studio",
    category: "wellness",
    amountCents: 7400,
    day: 19,
  },
  {
    description: "Home supplies",
    category: "shopping",
    amountCents: 8950,
    day: 23,
  },
] as const;

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDemoTransactions(
  referenceDate = new Date(),
): Transaction[] {
  return Array.from({ length: 6 }, (_, monthIndex) => {
    const monthDate = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - (5 - monthIndex),
      1,
    );
    const salaryDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      1,
    );
    const freelanceDate = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      15,
    );
    const monthId = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    const expenses: Transaction[] = MONTHLY_EXPENSES.map(
      (expense, expenseIndex) => {
        const date = new Date(
          monthDate.getFullYear(),
          monthDate.getMonth(),
          expense.day,
        );
        const seasonalAdjustment = monthIndex * 275;

        return {
          id: `${monthId}-expense-${expenseIndex}`,
          description: expense.description,
          amountCents: expense.amountCents + seasonalAdjustment,
          date: dateKey(date),
          category: expense.category,
          type: "expense",
        };
      },
    );

    const monthlyTransactions: Transaction[] = [
      {
        id: `${monthId}-salary`,
        description: "Northstar Studio",
        amountCents: 524000 + monthIndex * 5000,
        date: dateKey(salaryDate),
        category: "salary",
        type: "income",
      },
      {
        id: `${monthId}-freelance`,
        description: "Brand project",
        amountCents: 68000 + (monthIndex % 3) * 12500,
        date: dateKey(freelanceDate),
        category: "freelance",
        type: "income",
      },
      ...expenses,
    ];

    return monthlyTransactions;
  })
    .flat()
    .filter((transaction) => transaction.date <= dateKey(referenceDate));
}

export const demoTransactions = createDemoTransactions();
