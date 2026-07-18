"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CATEGORY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export type WinRateDatum = {
  label: string;
  winRate: number;
};

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function WinRateBarChart({
  title,
  data,
  colorByCategory = false,
}: {
  title: string;
  data: WinRateDatum[];
  colorByCategory?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">データがありません</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
              <YAxis domain={[0, 1]} tickFormatter={formatPercent} width={48} />
              <Tooltip formatter={(value) => formatPercent(Number(value))} />
              <Bar dataKey="winRate" name="勝率" fill="var(--chart-1)" radius={[4, 4, 0, 0]}>
                {colorByCategory &&
                  data.map((entry, index) => (
                    <Cell
                      key={entry.label}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
