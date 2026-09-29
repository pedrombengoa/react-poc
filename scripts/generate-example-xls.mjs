/**
 * Generates public/example-expenses.xls — the downloadable sample workbook
 * for the expense import feature. Run with: node scripts/generate-example-xls.mjs
 */
import * as XLSX from "xlsx";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, "../public/example-expenses.xls");

// Header row
const headers = ["date", "description", "category", "amount"];

// Use local-time constructors (year, 0-based month, day) so SheetJS stores
// the intended calendar date regardless of the machine's UTC offset.
// Month 8 = September, month 7 = August, etc.
const rows = [
  [new Date(2026, 8, 1),  "September rent",       "housing",   1500.00],
  [new Date(2026, 8, 3),  "Weekly groceries",     "groceries",   87.50],
  [new Date(2026, 8, 5),  "Restaurant dinner",    "dining",      62.40],
  [new Date(2026, 8, 8),  "Monthly transit pass", "transport",   45.00],
  [new Date(2026, 8, 10), "Gym membership",       "wellness",    35.00],
  [new Date(2026, 8, 12), "Weekend groceries",    "groceries",   54.80],
  [new Date(2026, 8, 15), "Coffee and lunch",     "dining",      22.75],
  [new Date(2026, 8, 18), "New running shoes",    "shopping",    89.99],
  [new Date(2026, 8, 22), "Ride sharing",         "transport",   18.50],
  [new Date(2026, 8, 25), "Grocery run",          "groceries",   91.30],
  [new Date(2026, 8, 28), "Pharmacy visit",       "wellness",    28.60],
];

const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

// Apply a date format to the date column (column A, rows 2 onward)
for (let i = 1; i <= rows.length; i++) {
  const cellRef = XLSX.utils.encode_cell({ r: i, c: 0 });
  if (worksheet[cellRef]) {
    worksheet[cellRef].z = "yyyy-mm-dd";
  }
}

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

mkdirSync(resolve(__dirname, "../public"), { recursive: true });
const xlsBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xls" });
writeFileSync(outPath, xlsBuffer);

console.log(`✓ Written ${outPath}`);
