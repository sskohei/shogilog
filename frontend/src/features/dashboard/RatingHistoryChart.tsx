"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { getPlatformName, getPlatformRatingMetric, getRatingMetricLabel } from "@/features/games/platforms";
import type { RatingHistoryPoint } from "@/types/dashboard";

const LINE_COLORS = ["#f97316", "#7c3aed", "#0891b2", "#db2777"];

type RatingHistoryDatum = {
  platform_id: number;
  index: number;
  rating: number;
  rank: string | null;
};

type PlatformSeries = {
  platformId: number;
  points: RatingHistoryDatum[];
};

function groupByPlatform(data: RatingHistoryPoint[]): PlatformSeries[] {
  const grouped = new Map<number, PlatformSeries>();

  for (const point of data) {
    const series = grouped.get(point.platform_id) ?? {
      platformId: point.platform_id,
      points: [],
    };
    series.points.push({
      platform_id: point.platform_id,
      index: series.points.length,
      rating: point.rating,
      rank: point.rank,
    });
    grouped.set(point.platform_id, series);
  }

  return [...grouped.values()].sort((a, b) => a.platformId - b.platformId);
}

export type RankChange = { index: number; rank: string };

export function findRankChanges(points: RatingHistoryDatum[]): RankChange[] {
  const changes: RankChange[] = [];
  let previousRank: string | null = null;

  for (const point of points) {
    if (point.rank && point.rank !== previousRank) {
      changes.push({ index: point.index, rank: point.rank });
    }
    previousRank = point.rank;
  }

  return changes;
}

function pickDefaultPlatformId(series: PlatformSeries[]): number | null {
  if (series.length === 0) return null;

  return series.reduce((best, current) =>
    current.points.length > best.points.length ? current : best
  ).platformId;
}

export function RatingHistoryChart({ data }: { data: RatingHistoryPoint[] }) {
  const series = useMemo(() => groupByPlatform(data), [data]);
  const defaultPlatformId = useMemo(() => pickDefaultPlatformId(series), [series]);
  const [manualPlatformId, setManualPlatformId] = useState<number | null>(null);

  const selectedPlatformId =
    manualPlatformId !== null &&
    series.some((platformSeries) => platformSeries.platformId === manualPlatformId)
      ? manualPlatformId
      : defaultPlatformId;

  const selectedIndex = series.findIndex((platformSeries) => platformSeries.platformId === selectedPlatformId);
  const selectedSeries = selectedIndex === -1 ? null : series[selectedIndex];
  const isRankBased = selectedPlatformId !== null && getPlatformRatingMetric(selectedPlatformId) !== "rating";
  const rankChanges = useMemo(
    () => (isRankBased && selectedSeries ? findRankChanges(selectedSeries.points) : []),
    [isRankBased, selectedSeries]
  );

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">レーティング推移</h3>
        {series.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {series.map((platformSeries) => (
              <Button
                key={platformSeries.platformId}
                type="button"
                size="sm"
                variant={platformSeries.platformId === selectedPlatformId ? "default" : "ghost"}
                onClick={() => setManualPlatformId(platformSeries.platformId)}
              >
                {getPlatformName(platformSeries.platformId)}
              </Button>
            ))}
          </div>
        )}
      </div>
      {data.length === 0 || !selectedSeries ? (
        <p className="text-sm text-muted-foreground">データがありません</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedSeries.points} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" type="number" domain={["dataMin", "dataMax"]} tick={false} tickLine={false} />
              {isRankBased ? (
                <YAxis width={48} domain={[0, "dataMax"]} />
              ) : (
                <YAxis width={48} />
              )}
              <Tooltip
                labelFormatter={() => ""}
                formatter={(value, name, item) => {
                  const datum = item.payload as RatingHistoryDatum;
                  const metric = getPlatformRatingMetric(datum.platform_id);
                  const label = `${value} ${getRatingMetricLabel(metric)}`;
                  return [datum.rank ? `${label}(${datum.rank})` : label, name];
                }}
              />
              <Line
                dataKey="rating"
                name={getPlatformName(selectedSeries.platformId)}
                stroke={LINE_COLORS[selectedIndex % LINE_COLORS.length]}
                connectNulls
                dot={{ r: 3 }}
              />
              {rankChanges.map((change) => (
                <ReferenceLine
                  key={change.index}
                  x={change.index}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  label={{ value: change.rank, position: "insideBottomLeft", fontSize: 11 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
