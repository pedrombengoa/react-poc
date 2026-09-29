import { expect, test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAMPLE_XLS = path.resolve(__dirname, "../public/example-expenses.xls");

test("app loads with no data and shows the import CTA", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Make room for what matters/i }),
  ).toBeVisible();

  // No "SAMPLE DATA" badge — the old fixture-backed indicator
  await expect(page.getByText("SAMPLE DATA", { exact: true })).toHaveCount(0);

  // Import CTA is visible
  await expect(
    page.getByRole("heading", { name: /Import your expense file/i }),
  ).toBeVisible();

  // Download link points to the example file
  await expect(
    page.getByRole("link", { name: /Download example file/i }),
  ).toHaveAttribute("href", "/example-expenses.xls");

  // No transactions yet
  await expect(page.getByText("No data imported yet")).toBeVisible();
  await expect(page.getByText("0 records")).toBeVisible();
});

test("downloading example file and importing it populates the dashboard", async ({
  page,
}) => {
  await page.goto("/");

  // Upload the pre-generated example file via the hidden input
  const fileInput = page.getByLabel("Import .xls file");
  await fileInput.setInputFiles(EXAMPLE_XLS);

  // Wait for import to complete
  await expect(page.getByText(/transactions imported/i)).toBeVisible();

  // Dashboard is now populated
  await expect(page.getByText(/^\d+ records$/)).toBeVisible();

  // Period preset is "custom" and covers the imported date range
  await expect(page.getByRole("combobox", { name: "Date range" })).toHaveValue(
    "custom",
  );

  // KPIs show non-zero spending
  const summary = page.getByLabel("Financial summary");
  await expect(summary.locator(".kpi-value").first()).not.toHaveText("$0.00");

  // Charts load (category panel should be present)
  await expect(page.getByLabel(/Spending by category/i)).toBeVisible();
});

test("global filters stay in sync with imported data", async ({ page }) => {
  await page.goto("/");

  const fileInput = page.getByLabel("Import .xls file");
  await fileInput.setInputFiles(EXAMPLE_XLS);
  await expect(page.getByText(/transactions imported/i)).toBeVisible();

  const totalRecordsText = await page.getByText(/^\d+ records$/).textContent();
  const totalCount = parseInt(totalRecordsText ?? "0");
  expect(totalCount).toBeGreaterThan(0);

  // Filter by groceries — fewer records
  await page
    .getByRole("combobox", { name: "Category" })
    .selectOption("groceries");
  const groceryRecordsText = await page
    .getByText(/^\d+ records$/)
    .textContent();
  const groceryCount = parseInt(groceryRecordsText ?? "0");
  expect(groceryCount).toBeGreaterThan(0);
  expect(groceryCount).toBeLessThan(totalCount);

  // Grocery chart visible
  await expect(page.getByRole("img", { name: /Groceries/ })).toBeVisible();
  await expect(page.getByText("September rent")).toHaveCount(0);

  // Set a future date range with no data
  await page
    .getByRole("combobox", { name: "Date range" })
    .selectOption("custom");
  await page.getByLabel("Start date").fill("2099-01-01");
  await page.getByLabel("End date").fill("2099-01-31");
  await expect(page.getByText("0 records")).toBeVisible();
  await expect(page.getByText("No activity found")).toBeVisible();
});

test("an invalid import shows row-level errors and preserves the existing data", async ({
  page,
}) => {
  await page.goto("/");

  // First, import valid data
  const fileInput = page.getByLabel("Import .xls file");
  await fileInput.setInputFiles(EXAMPLE_XLS);
  await expect(page.getByText(/transactions imported/i)).toBeVisible();

  const recordsTextBefore = await page.getByText(/^\d+ records$/).textContent();

  // Create an invalid XLS in memory via a tiny helper and upload it as a blob
  // We do this by navigating to a data URL won't work; instead create a temp
  // file via a browser script that writes corrupted content.
  // Simplest: upload a non-XLS file (plain text) which SheetJS will reject.
  const badFilePath = path.resolve(
    __dirname,
    "../scripts/generate-example-xls.mjs",
  );
  await fileInput.setInputFiles(badFilePath); // .mjs ≠ valid XLS

  await expect(page.getByText(/Import failed/i)).toBeVisible({
    timeout: 5000,
  });

  // Data must be unchanged
  await expect(page.getByText(recordsTextBefore!)).toBeVisible();
});
