import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { parseXlsBuffer, type ImportResult } from "./xls-importer";

// Helper — build an ArrayBuffer from a 2-D array of cell values
function makeBuffer(
  rows: unknown[][],
  opts: { dateAsSerial?: boolean } = {},
): ArrayBuffer {
  const ws = opts.dateAsSerial
    ? XLSX.utils.aoa_to_sheet(rows)
    : XLSX.utils.aoa_to_sheet(rows, { cellDates: true });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { type: "array", bookType: "xls" });
  return buf as ArrayBuffer;
}

const VALID_HEADER = ["date", "description", "category", "amount"] as const;

function validRow(overrides: Partial<Record<string, unknown>> = {}): unknown[] {
  return [
    // Default to an ISO string so there is no timezone ambiguity.
    // Pass a Date explicitly in tests that specifically exercise Date cells.
    overrides.date ?? "2026-09-01",
    overrides.description ?? "September rent",
    overrides.category ?? "housing",
    overrides.amount ?? 1500.0,
  ];
}

/** A JS Date at noon local time on a given date — safe for any UTC offset. */
function noonDate(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12, 0, 0);
}

describe("parseXlsBuffer", () => {
  describe("valid workbooks", () => {
    it("parses a minimal valid workbook with a Date cell", () => {
      // Use noon local time — safe for any UTC offset (midnight would shift
      // across midnight UTC in UTC+N zones, changing the stored calendar day).
      const buf = makeBuffer([
        [...VALID_HEADER],
        validRow({ date: noonDate(2026, 8, 1) }), // Sep 1 noon
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.transactions).toHaveLength(1);
      const [t] = result.transactions;
      expect(t.date).toBe("2026-09-01");
      expect(t.description).toBe("September rent");
      expect(t.category).toBe("housing");
      expect(t.amountCents).toBe(150000);
      expect(t.type).toBe("expense");
    });

    it("parses an ISO date string in the date column", () => {
      const buf = makeBuffer([
        [...VALID_HEADER],
        ["2026-09-15", "Grocery run", "groceries", 87.5], // string date, no timezone ambiguity
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.transactions[0].date).toBe("2026-09-15");
    });

    it("converts a decimal amount to integer cents", () => {
      const buf = makeBuffer([[...VALID_HEADER], validRow({ amount: 19.99 })]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.transactions[0].amountCents).toBe(1999);
    });

    it("accepts all six supported expense categories", () => {
      const categories = [
        "housing",
        "groceries",
        "dining",
        "transport",
        "wellness",
        "shopping",
      ] as const;
      for (const cat of categories) {
        const buf = makeBuffer([
          [...VALID_HEADER],
          validRow({ category: cat }),
        ]);
        const result = parseXlsBuffer(buf);
        expect(result.ok).toBe(true);
        if (!result.ok) return;
        expect(result.transactions[0].category).toBe(cat);
      }
    });

    it("parses multiple rows and sets type to expense on all", () => {
      const buf = makeBuffer([
        [...VALID_HEADER],
        validRow({ description: "Rent", category: "housing", amount: 1000 }),
        validRow({ description: "Food", category: "groceries", amount: 50 }),
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions.every((t) => t.type === "expense")).toBe(true);
    });

    it("trims whitespace from description and category", () => {
      const buf = makeBuffer([
        [...VALID_HEADER],
        validRow({ description: "  Dinner  ", category: " dining " }),
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.transactions[0].description).toBe("Dinner");
      expect(result.transactions[0].category).toBe("dining");
    });
  });

  describe("header validation", () => {
    it("rejects a workbook with missing headers", () => {
      const buf = makeBuffer([["date", "description", "amount"]]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors[0].message).toMatch(/category/i);
    });

    it("rejects a workbook with completely wrong headers", () => {
      const buf = makeBuffer([["foo", "bar", "baz", "qux"]]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
    });

    it("rejects an empty workbook", () => {
      const buf = makeBuffer([]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
    });

    it("rejects a header-only workbook (no data rows)", () => {
      const buf = makeBuffer([[...VALID_HEADER]]);
      const result: ImportResult = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
    });
  });

  describe("row-level validation", () => {
    it("rejects an invalid date and includes the row number", () => {
      const buf = makeBuffer([
        [...VALID_HEADER],
        validRow({ date: "not-a-date" }),
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[0].message).toMatch(/date/i);
    });

    it("rejects a blank description", () => {
      const buf = makeBuffer([
        [...VALID_HEADER],
        validRow({ description: "" }),
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors[0].message).toMatch(/description/i);
    });

    it("rejects an unsupported category (salary)", () => {
      const buf = makeBuffer([
        [...VALID_HEADER],
        validRow({ category: "salary" }),
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors[0].message).toMatch(/category/i);
    });

    it("rejects a zero amount", () => {
      const buf = makeBuffer([[...VALID_HEADER], validRow({ amount: 0 })]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors[0].message).toMatch(/amount/i);
    });

    it("rejects a negative amount", () => {
      const buf = makeBuffer([[...VALID_HEADER], validRow({ amount: -50 })]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
    });

    it("rejects an amount with more than 2 decimal places", () => {
      const buf = makeBuffer([[...VALID_HEADER], validRow({ amount: 19.999 })]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors[0].message).toMatch(/amount/i);
    });

    it("rejects a non-numeric amount string", () => {
      const buf = makeBuffer([[...VALID_HEADER], validRow({ amount: "lots" })]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
    });

    it("rejects the entire file if any row is invalid (whole-file rejection)", () => {
      const buf = makeBuffer([
        [...VALID_HEADER],
        validRow(), // valid
        validRow({ amount: 0 }), // invalid
        validRow({ description: "Dinner" }), // valid
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
      // No partial results
      if (result.ok) return;
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(3);
    });

    it("accumulates multiple row errors from multiple bad rows", () => {
      const buf = makeBuffer([
        [...VALID_HEADER],
        validRow({ date: "bad", description: "" }), // 2 errors on row 2
        validRow({ category: "unknown" }), // 1 error on row 3
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[1].row).toBe(3);
    });
  });

  describe("edge cases", () => {
    it("handles a category value in mixed case (normalised to lowercase)", () => {
      const buf = makeBuffer([
        [...VALID_HEADER],
        validRow({ category: "Groceries" }),
      ]);
      const result = parseXlsBuffer(buf);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.transactions[0].category).toBe("groceries");
    });

    it("returns an error for a corrupted/non-xls buffer", () => {
      // SheetJS may or may not throw on arbitrary bytes; either way the
      // result must be a failure (parse error or missing-headers error).
      const garbage = new Uint8Array([0, 1, 2, 3, 4]).buffer;
      const result = parseXlsBuffer(garbage);
      expect(result.ok).toBe(false);
    });
  });
});
