import { expect, test } from "@playwright/test";

test("public demo loads without backend configuration and global filters stay in sync", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Make room for what matters/i }),
  ).toBeVisible();
  await expect(page.getByText("SAMPLE DATA", { exact: true })).toBeVisible();
  await expect(page.getByText(/^\d+ records$/)).toBeVisible();

  await page
    .getByRole("combobox", { name: "Category" })
    .selectOption("groceries");
  await expect(page.getByText("6 records")).toBeVisible();
  await expect(page.getByRole("img", { name: /Groceries/ })).toBeVisible();
  await expect(page.getByText("Apartment rent")).toHaveCount(0);

  await page
    .getByRole("combobox", { name: "Date range" })
    .selectOption("custom");
  await page.getByLabel("Start date").fill("2099-01-01");
  await page.getByLabel("End date").fill("2099-01-31");
  await expect(page.getByText("0 records")).toBeVisible();
  await expect(page.getByText("No activity found")).toBeVisible();
});
