"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import type { DailyStat, MonthlyStat, WeeklyStat, YearlyStat } from "@/types/dashboard";

type Granularity = "daily" | "weekly" | "monthly" | "yearly";

const GRANULARITY_LABELS: Record<Granularity, string> = {
  daily: "日別",
  weekly: "週別",
  monthly: "月別",
  yearly: "年別",
};

type GamesCountDatum = { label: string; game_count: number };

export function GamesCountChart({
  daily,
  weekly,
  monthly,
  yearly,
}: {
  daily: DailyStat[];
  weekly: WeeklyStat[];
  monthly: MonthlyStat[];
  yearly: YearlyStat[];
}) {
  const [granularity, setGranularity] = useState<Granularity>("monthly");

  const data: GamesCountDatum[] =
    granularity === "daily"
      ? daily.map((d) => ({ label: d.date.slice(5), game_count: d.game_count }))
      : granularity === "weekly"
        ? weekly.map((w) => ({ label: w.week, game_count: w.game_count }))
        : granularity === "yearly"
          ? yearly.map((y) => ({ label: y.year, game_count: y.game_count }))
          : monthly.map((m) => ({ label: m.month, game_count: m.game_count }));

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">対局数</h3>
        <div className="flex flex-wrap gap-1">
          {(Object.keys(GRANULARITY_LABELS) as Granularity[]).map((g) => (
            <Button
              key={g}
              type="button"
              size="sm"
              variant={g === granularity ? "default" : "ghost"}
              onClick={() => setGranularity(g)}
            >
              {GRANULARITY_LABELS[g]}
            </Button>
          ))}
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">データがありません</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} />
              <YAxis allowDecimals={false} width={32} />
              <Tooltip />
              <Bar dataKey="game_count" name="対局数" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
