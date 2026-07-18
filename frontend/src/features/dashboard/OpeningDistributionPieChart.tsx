"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type OpeningDistributionDatum = {
  label: string;
  value: number;
};

// Validated 8-slot categorical palette (dataviz skill), used in fixed order.
// Only the first MAX_SLICES are needed since slices beyond that are folded into "その他".
const SLICE_COLORS = ["#2a78d6", "#008300", "#e87ba4", "#eda100", "#1baf7a", "#eb6834"];
const OTHER_LABEL = "その他";
// Pie charts read as part-to-whole only up to ~6 wedges; fold the long tail together.
const MAX_SLICES = 6;

function foldIntoTopSlices(data: OpeningDistributionDatum[]): OpeningDistributionDatum[] {
  if (data.length <= MAX_SLICES) {
    return data;
  }

  const top = data.slice(0, MAX_SLICES - 1);
  const restTotal = data.slice(MAX_SLICES - 1).reduce((sum, d) => sum + d.value, 0);

  return [...top, { label: OTHER_LABEL, value: restTotal }];
}

export function OpeningDistributionPieChart({
  title,
  data,
}: {
  title: string;
  data: OpeningDistributionDatum[];
}) {
  const slices = foldIntoTopSlices(data);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">データがありません</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={70}
                paddingAngle={2}
              >
                {slices.map((slice, index) => (
                  <Cell key={slice.label} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const count = Number(value);
                  const percent = total === 0 ? 0 : Math.round((count / total) * 100);
                  return [`${count}局 (${percent}%)`, name];
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
