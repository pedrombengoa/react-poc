import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CATEGORY_COLORS } from "@/features/transactions/transaction";
import type {
  CategorySpending,
  MonthlyTotals,
} from "@/features/dashboard/selectors";
import "@/App.css";

function formatCurrency(amountCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="chart-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <span key={item.name}>
          <i style={{ backgroundColor: item.color }} />
          {item.name}: {formatCurrency(item.value)}
        </span>
      ))}
    </div>
  );
}

export default function DashboardCharts({
  categorySpending,
  expensesCents,
  monthlyTotals,
  rangeLabel,
}: {
  categorySpending: CategorySpending[];
  expensesCents: number;
  monthlyTotals: MonthlyTotals[];
  rangeLabel: string;
}) {
  return (
    <section
      className="chart-grid"
      id="insights"
      aria-label="Spending insights"
    >
      <article className="panel category-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">WHERE IT GOES</p>
            <h2>Spending by category</h2>
          </div>
          <span className="panel-menu" aria-hidden="true">
            USD
          </span>
        </div>
        {categorySpending.length > 0 ? (
          <div className="category-chart-layout">
            <div
              className="donut-wrap"
              role="img"
              aria-label={`Spending by category: ${categorySpending.map((item) => `${item.label} ${formatCurrency(item.amountCents)}`).join(", ")}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    dataKey="amountCents"
                    nameKey="label"
                    innerRadius={69}
                    outerRadius={94}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {categorySpending.map((item) => (
                      <Cell
                        key={item.category}
                        fill={CATEGORY_COLORS[item.category]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <span>TOTAL SPENT</span>
                <strong>{formatCurrency(expensesCents)}</strong>
              </div>
            </div>
            <ul className="category-legend">
              {categorySpending.map((item) => (
                <li key={item.category}>
                  <span className="legend-name">
                    <i
                      style={{
                        backgroundColor: CATEGORY_COLORS[item.category],
                      }}
                    />
                    {item.label}
                  </span>
                  <strong>{formatCurrency(item.amountCents)}</strong>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="chart-empty">No spending in this selection.</div>
        )}
      </article>

      <article className="panel trend-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-kicker">CASH FLOW</p>
            <h2>Income &amp; spending</h2>
          </div>
          <span className="trend-period">MONTHLY</span>
        </div>
        <div className="trend-legend">
          <span>
            <i className="legend-income" />
            Income
          </span>
          <span>
            <i className="legend-expense" />
            Spending
          </span>
        </div>
        {monthlyTotals.length > 0 ? (
          <div
            className="trend-chart"
            role="img"
            aria-label={`Monthly income and spending from ${rangeLabel}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTotals}
                margin={{ top: 12, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#39866d" stopOpacity={0.2} />
                    <stop
                      offset="100%"
                      stopColor="#39866d"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d79073" stopOpacity={0.14} />
                    <stop
                      offset="100%"
                      stopColor="#d79073"
                      stopOpacity={0.01}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#e8eae4"
                  strokeDasharray="3 5"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7b8179", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7b8179", fontSize: 10 }}
                  tickFormatter={(value: number) =>
                    `$${Math.round(value / 1000)}k`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="incomeCents"
                  name="Income"
                  stroke="#39866d"
                  strokeWidth={2.5}
                  fill="url(#incomeFill)"
                />
                <Area
                  type="monotone"
                  dataKey="expensesCents"
                  name="Spending"
                  stroke="#d79073"
                  strokeWidth={2.5}
                  fill="url(#expenseFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-empty">No activity in this selection.</div>
        )}
      </article>
    </section>
  );
}
