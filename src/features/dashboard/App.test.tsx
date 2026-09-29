import * as XLSX from "xlsx";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "@/App";

// ── XLS test-file helpers ────────────────────────────────────────

const VALID_HEADER = ["date", "description", "category", "amount"] as const;

function makeXlsFile(rows: unknown[][], name = "expenses.xls"): File {
  const ws = XLSX.utils.aoa_to_sheet(rows, { cellDates: true });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { type: "array", bookType: "xls" }) as ArrayBuffer;
  return new File([buf], name, { type: "application/vnd.ms-excel" });
}

// Use ISO strings for dates — SheetJS stores them as text, so there is
// no UTC-offset ambiguity when the importer reads them back.
const SAMPLE_FILE = makeXlsFile([
  [...VALID_HEADER],
  ["2026-09-01", "Rent", "housing", 1500.0],
  ["2026-09-05", "Weekly groceries", "groceries", 87.5],
  ["2026-09-10", "Restaurant dinner", "dining", 62.4],
]);

const REPLACEMENT_FILE = makeXlsFile([
  [...VALID_HEADER],
  ["2026-08-15", "August rent", "housing", 1450.0],
]);

const INVALID_FILE = makeXlsFile([
  [...VALID_HEADER],
  [new Date("2026-09-01"), "Broken row", "salary", -999], // salary not allowed, negative amount
]);

// ── Render helper ────────────────────────────────────────────────

function renderDashboard() {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
}

// Uploads a File to the hidden file input and waits for the async import
// to produce a visible status badge or error message.
async function uploadFile(file: File) {
  const user = userEvent.setup();
  await user.upload(screen.getByLabelText("Import .xls file"), file);
}

// ── Empty startup state ──────────────────────────────────────────

describe("empty startup state", () => {
  it("shows the import CTA and no transaction data", () => {
    renderDashboard();

    expect(
      screen.getByRole("heading", { name: /Import your expense file/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Download example file/i }),
    ).toHaveAttribute("href", "/example-expenses.xls");
    expect(
      screen.getByRole("button", { name: /Import file/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("No data imported yet")).toBeInTheDocument();
    expect(screen.getByText("0 records")).toBeInTheDocument();
  });

  it("shows zero KPIs before any import", () => {
    renderDashboard();

    const summary = within(screen.getByLabelText("Financial summary"));
    // All three currency KPIs should show $0.00
    expect(summary.getAllByText("$0.00")).toHaveLength(3);
    // Transaction count KPI shows 0
    expect(
      summary.getByText("0", { selector: ".kpi-value" }),
    ).toBeInTheDocument();
  });
});

// ── Valid import ─────────────────────────────────────────────────

describe("valid import", () => {
  it("populates the dashboard after a successful import", async () => {
    renderDashboard();
    await uploadFile(SAMPLE_FILE);

    expect(await screen.findByText("3 records")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("Weekly groceries")).toBeInTheDocument();
    expect(screen.getByText("Restaurant dinner")).toBeInTheDocument();
  });

  it("shows the success badge and switches to compact import bar", async () => {
    renderDashboard();
    await uploadFile(SAMPLE_FILE);

    expect(
      await screen.findByText(/3 transactions imported/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Import your expense file/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Replace data/i }),
    ).toBeInTheDocument();
  });

  it("sets the active date range to cover the imported transaction dates", async () => {
    renderDashboard();
    await uploadFile(SAMPLE_FILE);

    await screen.findByText(/3 transactions imported/i);

    expect(screen.getByRole("combobox", { name: "Date range" })).toHaveValue(
      "custom",
    );
    expect(screen.getByLabelText("Start date")).toHaveValue("2026-09-01");
    expect(screen.getByLabelText("End date")).toHaveValue("2026-09-10");
  });

  it("resets category to all after a successful import", async () => {
    const user = userEvent.setup();
    renderDashboard();

    // First import
    await user.upload(screen.getByLabelText("Import .xls file"), SAMPLE_FILE);
    await screen.findByText(/3 transactions imported/i);

    // Change category
    await user.selectOptions(
      screen.getByRole("combobox", { name: "Category" }),
      "groceries",
    );
    expect(screen.getByText("1 records")).toBeInTheDocument();

    // Second import should reset category
    await user.upload(screen.getByLabelText("Import .xls file"), SAMPLE_FILE);
    await screen.findByText(/3 transactions imported/i);

    expect(screen.getByRole("combobox", { name: "Category" })).toHaveValue(
      "all",
    );
    expect(screen.getByText("3 records")).toBeInTheDocument();
  });
});

// ── Invalid import ───────────────────────────────────────────────

describe("invalid import", () => {
  it("shows row-level errors and does not update the transaction list", async () => {
    renderDashboard();
    await uploadFile(INVALID_FILE);

    expect(await screen.findByText(/Import failed/i)).toBeInTheDocument();
    // Still no data
    expect(screen.getByText("No data imported yet")).toBeInTheDocument();
  });

  it("shows row number in the error list", async () => {
    renderDashboard();
    await uploadFile(INVALID_FILE);

    // The error badge shows "Row 2" for the invalid row
    expect(await screen.findByText("Row 2")).toBeInTheDocument();
  });

  it("preserves existing data when a second import fails", async () => {
    renderDashboard();
    await uploadFile(SAMPLE_FILE);
    expect(await screen.findByText("3 records")).toBeInTheDocument();

    await uploadFile(INVALID_FILE);

    // Original data stays
    expect(await screen.findByText(/Import failed/i)).toBeInTheDocument();
    expect(screen.getByText("3 records")).toBeInTheDocument();
  });
});

// ── Replace import ───────────────────────────────────────────────

describe("replace import", () => {
  it("replaces the current dataset when a later valid import succeeds", async () => {
    renderDashboard();
    await uploadFile(SAMPLE_FILE);
    expect(await screen.findByText("3 records")).toBeInTheDocument();

    await uploadFile(REPLACEMENT_FILE);
    expect(await screen.findByText("1 records")).toBeInTheDocument();
    expect(screen.getByText("August rent")).toBeInTheDocument();
    expect(screen.queryByText("Rent")).not.toBeInTheDocument();
  });
});

// ── Filter behaviour with imported data ──────────────────────────

describe("filters with imported data", () => {
  it("applies the category filter to KPIs, charts, and the transaction list", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.upload(screen.getByLabelText("Import .xls file"), SAMPLE_FILE);
    await screen.findByText(/3 transactions imported/i);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Category" }),
      "groceries",
    );

    expect(screen.getByText("1 records")).toBeInTheDocument();
    expect(screen.queryByText("Rent")).not.toBeInTheDocument();
    expect(screen.getByText("Weekly groceries")).toBeInTheDocument();
  });

  it("shows an empty state when the selected range has no data", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.upload(screen.getByLabelText("Import .xls file"), SAMPLE_FILE);
    await screen.findByText(/3 transactions imported/i);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Date range" }),
      "custom",
    );
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2099-01-01" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2099-01-31" },
    });

    expect(screen.getByText("0 records")).toBeInTheDocument();
    expect(screen.getByText("No activity found")).toBeInTheDocument();
    expect(
      screen.getByText("No spending in this selection."),
    ).toBeInTheDocument();
  });

  it("resets filters to the imported date range on reset", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.upload(screen.getByLabelText("Import .xls file"), SAMPLE_FILE);
    await screen.findByText(/3 transactions imported/i);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Category" }),
      "dining",
    );

    await user.click(screen.getByRole("button", { name: "Reset filters" }));

    expect(screen.getByRole("combobox", { name: "Category" })).toHaveValue(
      "all",
    );
    expect(screen.getByText("3 records")).toBeInTheDocument();
  });

  it("handles a reversed custom date range without crashing", async () => {
    const user = userEvent.setup();
    renderDashboard();
    await user.upload(screen.getByLabelText("Import .xls file"), SAMPLE_FILE);
    await screen.findByText(/3 transactions imported/i);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Date range" }),
      "custom",
    );
    fireEvent.change(screen.getByLabelText("Start date"), {
      target: { value: "2099-02-01" },
    });
    fireEvent.change(screen.getByLabelText("End date"), {
      target: { value: "2099-01-31" },
    });

    expect(screen.getByText(/Invalid date range/)).toBeInTheDocument();
    expect(screen.getByText("0 records")).toBeInTheDocument();
  });
});
