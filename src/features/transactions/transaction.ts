export const CATEGORIES = [
  "housing",
  "groceries",
  "dining",
  "transport",
  "wellness",
  "shopping",
  "salary",
  "freelance",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  description: string;
  amountCents: number;
  date: string;
  category: Category;
  type: TransactionType;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  housing: "Housing",
  groceries: "Groceries",
  dining: "Dining",
  transport: "Transport",
  wellness: "Wellness",
  shopping: "Shopping",
  salary: "Salary",
  freelance: "Freelance",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  housing: "#235e4a",
  groceries: "#92ad78",
  dining: "#dc916e",
  transport: "#738baf",
  wellness: "#c6a34d",
  shopping: "#b780a0",
  salary: "#235e4a",
  freelance: "#738baf",
};
