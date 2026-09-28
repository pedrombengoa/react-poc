import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import App from "@/App";
import { demoTransactions } from "@/features/transactions/demo-data";

function renderDashboard() {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  );
}

describe("public dashboard", () => {
  it("applies the category filter to KPIs, charts, and the transaction list", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Category" }),
      "groceries",
    );

    const summary = within(screen.getByLabelText("Financial summary"));
    expect(summary.getByText("$3,197.25")).toBeInTheDocument();
    expect(
      summary.getByText("6", { selector: ".kpi-value" }),
    ).toBeInTheDocument();
    expect(screen.getByText("6 records")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Groceries/ })).toBeInTheDocument();
    expect(screen.queryByText("Apartment rent")).not.toBeInTheDocument();
    expect(screen.getAllByText("Market groceries")).toHaveLength(6);
  });

  it("shows an honest empty state when the selected range has no data", async () => {
    const user = userEvent.setup();
    renderDashboard();

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
    expect(
      within(screen.getByLabelText("Financial summary")).getByText("0", {
        selector: ".kpi-value",
      }),
    ).toBeInTheDocument();
  });

  it("resets the global filters to the default demo view", async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Category" }),
      "groceries",
    );
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

    await user.click(screen.getByRole("button", { name: "Reset filters" }));

    expect(
      screen.getByText(`${demoTransactions.length} records`),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Category" })).toHaveValue(
      "all",
    );
    expect(screen.getByRole("combobox", { name: "Date range" })).toHaveValue(
      "six-months",
    );
  });

  it("handles a reversed custom date range without crashing", async () => {
    const user = userEvent.setup();
    renderDashboard();

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
