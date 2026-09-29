import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  ChevronDown,
  Download,
  FileSpreadsheet,
  LayoutDashboard,
  RotateCcw,
  SlidersHorizontal,
  Upload,
  WalletCards,
} from "lucide-react";
import {
  lazy,
  Suspense,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  CATEGORY_LABELS,
  CATEGORIES,
  type Category,
} from "@/features/transactions/transaction";
import type { Transaction } from "@/features/transactions/transaction";
import {
  type ImportRowError,
  parseXlsFile,
} from "@/features/transactions/xls-importer";
import { Button } from "@/components/ui/button";
import {
  filterTransactions,
  getDashboardSummary,
  getMonthlyTotals,
  getSpendingByCategory,
} from "@/features/dashboard/selectors";
import "./App.css";

const DashboardCharts = lazy(
  () => import("@/features/dashboard/DashboardCharts"),
);

type RangePreset = "six-months" | "this-month" | "last-30-days" | "custom";

interface DateRange {
  preset: RangePreset;
  startDate: string;
  endDate: string;
}

type ImportStatus =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; count: number }
  | { kind: "error"; errors: ImportRowError[] };

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function rangeForPreset(
  preset: Exclude<RangePreset, "custom">,
  today = new Date(),
): DateRange {
  let startDate: Date;

  if (preset === "this-month") {
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (preset === "last-30-days") {
    startDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 29,
    );
  } else {
    startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);
  }

  return { preset, startDate: toDateKey(startDate), endDate: toDateKey(today) };
}

function rangeForTransactions(transactions: Transaction[]): DateRange {
  const dates = transactions.map((t) => t.date).sort();
  return {
    preset: "custom",
    startDate: dates[0],
    endDate: dates[dates.length - 1],
  };
}

function formatCurrency(amountCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function KpiCard({
  label,
  amount,
  icon,
  detail,
  tone,
}: {
  label: string;
  amount: string;
  icon: ReactNode;
  detail: string;
  tone: "green" | "rose" | "blue" | "gold";
}) {
  return (
    <article className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-label">{label}</span>
        <span className={`kpi-icon kpi-icon-${tone}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="kpi-value">{amount}</p>
      <p className="kpi-detail">{detail}</p>
    </article>
  );
}

function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    kind: "idle",
  });
  const [dateRange, setDateRange] = useState<DateRange>(() =>
    rangeForPreset("six-months"),
  );
  const [category, setCategory] = useState<Category | "all">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasData = transactions.length > 0;

  const filteredTransactions = filterTransactions(transactions, {
    ...dateRange,
    category,
  });
  const sortedTransactions = [...filteredTransactions].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
  const summary = getDashboardSummary(filteredTransactions);
  const categorySpending = getSpendingByCategory(filteredTransactions);
  const monthlyTotals = getMonthlyTotals(
    filteredTransactions,
    dateRange.startDate,
    dateRange.endDate,
  );
  const rangeLabel =
    dateRange.startDate <= dateRange.endDate
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).formatRange(
          new Date(`${dateRange.startDate}T12:00:00`),
          new Date(`${dateRange.endDate}T12:00:00`),
        )
      : "Invalid date range";

  function changePreset(value: RangePreset) {
    if (value !== "custom") setDateRange(rangeForPreset(value));
    else setDateRange({ ...dateRange, preset: "custom" });
  }

  function resetFilters() {
    if (hasData) {
      setDateRange(rangeForTransactions(transactions));
    } else {
      setDateRange(rangeForPreset("six-months"));
    }
    setCategory("all");
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset so the same file can be re-selected after a fix
    e.target.value = "";
    setImportStatus({ kind: "loading" });
    const result = await parseXlsFile(file);
    if (result.ok) {
      setTransactions(result.transactions);
      setDateRange(rangeForTransactions(result.transactions));
      setCategory("all");
      setImportStatus({ kind: "success", count: result.transactions.length });
    } else {
      setImportStatus({ kind: "error", errors: result.errors });
    }
  }

  function triggerFilePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div className="app-shell">
      {/* Hidden file input — triggered programmatically */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xls"
        aria-label="Import .xls file"
        className="sr-only"
        onChange={handleFileChange}
      />

      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Morrow Finance home">
          <span className="brand-mark">
            <WalletCards size={19} strokeWidth={1.8} />
          </span>
          <span className="brand-copy">
            morrow<span>PERSONAL FINANCE</span>
          </span>
        </a>

        <div className="workspace-switcher">
          <span className="workspace-avatar">A</span>
          <span className="workspace-name">Alex's workspace</span>
          <ChevronDown size={15} />
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          <a className="nav-link nav-link-active" href="#overview">
            <LayoutDashboard size={17} /> Overview
          </a>
          <a className="nav-link" href="#transactions">
            <ArrowLeftRight size={17} /> Transactions
          </a>
          <a className="nav-link" href="#insights">
            <ChartNoAxesCombined size={17} /> Insights
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sample-note">
            <span className="sample-note-icon">
              <FileSpreadsheet size={16} />
            </span>
            <span>
              <strong>Import your data</strong>
              <small>Upload an .xls expense file to get started.</small>
            </span>
          </div>
          <span className="sidebar-version">PERSONAL FINANCE · 2026</span>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Personal</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Overview</strong>
          </div>
          <div className="topbar-right">
            <span className="profile-avatar" aria-label="Demo profile: Alex">
              AK
            </span>
          </div>
        </header>

        <main className="dashboard-content" id="overview">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">YOUR MONEY, IN PERSPECTIVE</p>
              <h1>
                Make room for <em>what matters.</em>
              </h1>
              <p className="welcome-copy">
                Import your expenses to see a considered view of where your
                money goes.
              </p>
            </div>
            {hasData && (
              <div className="period-summary">
                <span className="period-dot" /> Showing {rangeLabel}
              </div>
            )}
          </section>

          {/* Import panel — prominent before first import, compact after */}
          {!hasData ? (
            <section className="import-cta panel" aria-label="Import expenses">
              <div className="import-cta-content">
                <span className="import-cta-icon" aria-hidden="true">
                  <FileSpreadsheet size={26} />
                </span>
                <div>
                  <h2>Import your expense file</h2>
                  <p className="import-cta-copy">
                    Upload a <code>.xls</code> spreadsheet with columns:{" "}
                    <strong>date</strong>, <strong>description</strong>,{" "}
                    <strong>category</strong>, <strong>amount</strong>.
                  </p>
                  <p className="import-cta-copy">
                    Categories: housing, groceries, dining, transport, wellness,
                    shopping.
                  </p>
                </div>
              </div>
              <div className="import-cta-actions">
                <a
                  href="/example-expenses.xls"
                  download
                  className="import-download-link"
                >
                  <Download size={13} />
                  Download example file
                </a>
                <Button
                  onClick={triggerFilePicker}
                  disabled={importStatus.kind === "loading"}
                >
                  <Upload size={14} />
                  {importStatus.kind === "loading"
                    ? "Importing…"
                    : "Import file"}
                </Button>
              </div>
              {importStatus.kind === "error" && (
                <div className="import-errors" role="alert">
                  <strong>Import failed — fix the following rows:</strong>
                  <ul className="import-error-list">
                    {importStatus.errors.map((err, idx) => (
                      <li key={idx}>
                        {err.row > 0 ? (
                          <span className="import-error-row">
                            Row {err.row}
                          </span>
                        ) : null}
                        {err.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ) : (
            <div className="import-bar">
              <div className="import-bar-left">
                {importStatus.kind === "success" && (
                  <span className="import-success-badge">
                    ✓ {importStatus.count} transaction
                    {importStatus.count !== 1 ? "s" : ""} imported
                  </span>
                )}
              </div>
              <div className="import-bar-right">
                {importStatus.kind === "error" && (
                  <span className="import-error-inline" role="alert">
                    Import failed —{" "}
                    {importStatus.errors[0]?.message ?? "unknown error"}
                  </span>
                )}
                {importStatus.kind === "loading" && (
                  <span className="import-loading">Importing…</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={triggerFilePicker}
                  disabled={importStatus.kind === "loading"}
                >
                  <Upload size={12} />
                  Replace data
                </Button>
              </div>
            </div>
          )}

          <section className="kpi-grid" aria-label="Financial summary">
            <KpiCard
              label="Total spending"
              amount={formatCurrency(summary.expensesCents)}
              icon={<ArrowDownRight size={18} />}
              detail="Across selected period"
              tone="rose"
            />
            <KpiCard
              label="Total income"
              amount={formatCurrency(summary.incomeCents)}
              icon={<ArrowUpRight size={18} />}
              detail="Across selected period"
              tone="green"
            />
            <KpiCard
              label="Net balance"
              amount={formatCurrency(summary.balanceCents)}
              icon={<WalletCards size={18} />}
              detail="Income minus spending"
              tone="blue"
            />
            <KpiCard
              label="Transactions"
              amount={String(summary.transactionCount)}
              icon={<ArrowLeftRight size={18} />}
              detail="In selected period"
              tone="gold"
            />
          </section>

          <section className="filter-bar" aria-label="Dashboard filters">
            <div className="filter-heading">
              <SlidersHorizontal size={16} />
              <span>Explore activity</span>
            </div>
            <div className="filter-controls">
              <label className="filter-field">
                <span className="filter-caption">PERIOD</span>
                <select
                  aria-label="Date range"
                  value={dateRange.preset}
                  onChange={(event) =>
                    changePreset(event.target.value as RangePreset)
                  }
                >
                  <option value="six-months">Last 6 months</option>
                  <option value="this-month">This month</option>
                  <option value="last-30-days">Last 30 days</option>
                  <option value="custom">Custom range</option>
                </select>
              </label>
              {dateRange.preset === "custom" && (
                <div className="custom-date-fields">
                  <label className="filter-field filter-field-date">
                    <span className="filter-caption">FROM</span>
                    <input
                      aria-label="Start date"
                      type="date"
                      value={dateRange.startDate}
                      onChange={(event) =>
                        setDateRange({
                          ...dateRange,
                          startDate: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="filter-field filter-field-date">
                    <span className="filter-caption">TO</span>
                    <input
                      aria-label="End date"
                      type="date"
                      value={dateRange.endDate}
                      onChange={(event) =>
                        setDateRange({
                          ...dateRange,
                          endDate: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              )}
              <label className="filter-field">
                <span className="filter-caption">CATEGORY</span>
                <select
                  aria-label="Category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as Category | "all")
                  }
                >
                  <option value="all">All categories</option>
                  {CATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {CATEGORY_LABELS[item]}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Reset filters"
                title="Reset filters"
                onClick={resetFilters}
              >
                <RotateCcw size={15} />
              </Button>
            </div>
          </section>

          <Suspense
            fallback={
              <section
                className="chart-grid chart-loading"
                aria-label="Loading insights"
              >
                <div className="panel">Loading spending insights…</div>
                <div className="panel">Loading monthly activity…</div>
              </section>
            }
          >
            <DashboardCharts
              categorySpending={categorySpending}
              expensesCents={summary.expensesCents}
              monthlyTotals={monthlyTotals}
              rangeLabel={rangeLabel}
            />
          </Suspense>

          <section className="panel transactions-panel" id="transactions">
            <div className="panel-heading transaction-heading">
              <div>
                <p className="panel-kicker">THE DETAILS</p>
                <h2>Recent transactions</h2>
              </div>
              <span className="record-count">
                {filteredTransactions.length} records
              </span>
            </div>
            {!hasData ? (
              <div className="empty-state">
                <span className="empty-icon">
                  <FileSpreadsheet size={19} />
                </span>
                <strong>No data imported yet</strong>
                <span>
                  Download the example file above and import it to see
                  transactions here.
                </span>
              </div>
            ) : sortedTransactions.length > 0 ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">TRANSACTION</th>
                      <th scope="col">CATEGORY</th>
                      <th scope="col">DATE</th>
                      <th scope="col" className="amount-column">
                        AMOUNT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <span className="transaction-name">
                            {transaction.description}
                          </span>
                        </td>
                        <td>
                          <span className="category-tag">
                            {CATEGORY_LABELS[transaction.category]}
                          </span>
                        </td>
                        <td className="date-cell">
                          {formatDate(transaction.date)}
                        </td>
                        <td
                          className={`amount-cell ${transaction.type === "income" ? "amount-income" : "amount-expense"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amountCents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">
                  <SlidersHorizontal size={19} />
                </span>
                <strong>No activity found</strong>
                <span>
                  Try widening the date range or choosing another category.
                </span>
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <span>Made for a clearer view of everyday money.</span>
            <span>Imported data is session-only and not saved.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
