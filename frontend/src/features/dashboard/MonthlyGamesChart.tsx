"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyStat } from "@/types/dashboard";

export function MonthlyGamesChart({ data }: { data: MonthlyStat[] }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <h3 className="mb-2 text-sm font-medium">月別対局数</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">データがありません</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} interval={0} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip />
              <Bar dataKey="game_count" name="対局数" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
