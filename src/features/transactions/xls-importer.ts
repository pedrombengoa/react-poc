import * as XLSX from "xlsx";
import type { Category, Transaction } from "./transaction";

export interface ImportRowError {
  row: number;
  message: string;
}

export type ImportResult =
  | { ok: true; transactions: Transaction[] }
  | { ok: false; errors: ImportRowError[] };

const EXPENSE_CATEGORIES = new Set<string>([
  "housing",
  "groceries",
  "dining",
  "transport",
  "wellness",
  "shopping",
]);

const REQUIRED_HEADERS = ["date", "description", "category", "amount"] as const;

function normalizeDate(value: unknown): string | null {
  if (value instanceof Date) {
    // SheetJS with cellDates:true produces local-midnight Dates, so local
    // accessors correctly recover the calendar date stored in the sheet.
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const d = new Date(`${trimmed}T12:00:00`);
      if (!isNaN(d.getTime())) return trimmed;
    }
  }
  return null;
}

function toCents(value: unknown): number | null {
  let num: number;
  if (typeof value === "number") {
    num = value;
  } else {
    num = parseFloat(String(value ?? ""));
  }
  if (!isFinite(num) || num <= 0) return null;
  // Allow at most 2 decimal places
  const cents = Math.round(num * 100);
  if (Math.abs(cents / 100 - num) > 1e-9) return null;
  return cents;
}

function isExpenseCategory(value: string): value is Category {
  return EXPENSE_CATEGORIES.has(value);
}

export function parseXlsBuffer(buffer: ArrayBuffer): ImportResult {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  } catch {
    return {
      ok: false,
      errors: [
        {
          row: 0,
          message:
            "Could not read the workbook. Make sure the file is a valid .xls file.",
        },
      ],
    };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return {
      ok: false,
      errors: [{ row: 0, message: "The workbook has no sheets." }],
    };
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: true,
  }) as unknown[][];

  if (rows.length === 0) {
    return {
      ok: false,
      errors: [{ row: 0, message: "The workbook is empty." }],
    };
  }

  const headerRow = (rows[0] as unknown[]).map((h) =>
    String(h ?? "")
      .toLowerCase()
      .trim(),
  );

  const missing = REQUIRED_HEADERS.filter((h) => !headerRow.includes(h));
  if (missing.length > 0) {
    return {
      ok: false,
      errors: [
        {
          row: 1,
          message: `Missing required columns: ${missing.join(", ")}. Expected: date, description, category, amount.`,
        },
      ],
    };
  }

  const dateIdx = headerRow.indexOf("date");
  const descIdx = headerRow.indexOf("description");
  const catIdx = headerRow.indexOf("category");
  const amtIdx = headerRow.indexOf("amount");

  if (rows.length < 2) {
    return {
      ok: false,
      errors: [{ row: 0, message: "The workbook has no data rows." }],
    };
  }

  const errors: ImportRowError[] = [];
  const transactions: Transaction[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    const rowNum = i + 1;

    const rawDate = row[dateIdx];
    const rawDesc = row[descIdx];
    const rawCat = row[catIdx];
    const rawAmt = row[amtIdx];

    const rowErrors: string[] = [];

    const date = normalizeDate(rawDate);
    if (!date) {
      rowErrors.push(
        `Invalid date "${String(rawDate)}". Use YYYY-MM-DD or an Excel date cell.`,
      );
    }

    const desc = String(rawDesc ?? "").trim();
    if (!desc) {
      rowErrors.push("Description must not be blank.");
    }

    const cat = String(rawCat ?? "")
      .toLowerCase()
      .trim();
    if (!isExpenseCategory(cat)) {
      rowErrors.push(
        `Unknown category "${String(rawCat)}". Allowed: housing, groceries, dining, transport, wellness, shopping.`,
      );
    }

    const amountCents = toCents(rawAmt);
    if (amountCents === null) {
      rowErrors.push(
        `Invalid amount "${String(rawAmt)}". Must be a positive number with at most 2 decimal places.`,
      );
    }

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join(" ") });
    } else {
      transactions.push({
        id: `import-row-${i}`,
        description: desc,
        amountCents: amountCents!,
        date: date!,
        category: cat as Category,
        type: "expense",
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  if (transactions.length === 0) {
    return {
      ok: false,
      errors: [{ row: 0, message: "The workbook has no data rows." }],
    };
  }

  return { ok: true, transactions };
}

export function parseXlsFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result;
      if (!(buffer instanceof ArrayBuffer)) {
        resolve({
          ok: false,
          errors: [{ row: 0, message: "Failed to read the file." }],
        });
        return;
      }
      resolve(parseXlsBuffer(buffer));
    };
    reader.onerror = () => {
      resolve({
        ok: false,
        errors: [{ row: 0, message: "Failed to read the file." }],
      });
    };
    reader.readAsArrayBuffer(file);
  });
}
