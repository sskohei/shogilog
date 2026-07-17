"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { updatePlatformRatingAction } from "@/features/profile/actions";
import { useActionErrorToast } from "@/lib/useActionErrorToast";
import { initialSimpleActionState } from "@/types/actionState";
import {
  getPlatformName,
  getPlatformRatingMetric,
  getRankOptions,
  getRatingMetricLabel,
  usesRankRating,
} from "@/features/games/platforms";
import type { PlatformRating } from "@/types/profile";

export function PlatformRatingRow({ rating }: { rating: PlatformRating }) {
  const [state, formAction, pending] = useActionState(
    updatePlatformRatingAction.bind(null, rating.platform_id),
    initialSimpleActionState
  );
  useActionErrorToast(state.error);
  const [hasPlayed, setHasPlayed] = useState(rating.has_played);

  const ratingMetric = getPlatformRatingMetric(rating.platform_id);
  const ratingLabel = getRatingMetricLabel(ratingMetric);
  const showRank = usesRankRating(rating.platform_id);
  const rankOptions = getRankOptions(rating.platform_id);

  return (
    <form
      action={formAction}
      className="grid grid-cols-2 gap-3 rounded-lg border border-border p-3 sm:grid-cols-4 sm:items-end"
    >
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">プラットフォーム</p>
        <p className="text-sm font-medium">{getPlatformName(rating.platform_id)}</p>
      </div>

      <div className="space-y-1">
        <label
          className="text-xs text-muted-foreground"
          htmlFor={`has_played-${rating.platform_id}`}
        >
          状態
        </label>
        <Select
          id={`has_played-${rating.platform_id}`}
          name="has_played"
          value={hasPlayed ? "played" : "not_played"}
          onChange={(event) => setHasPlayed(event.target.value === "played")}
        >
          <option value="not_played">未プレイ</option>
          <option value="played">プレイ済み</option>
        </Select>
      </div>

      {hasPlayed ? (
        showRank ? (
          <div className="space-y-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor={`rank-${rating.platform_id}`}
            >
              段級位
            </label>
            <Select
              id={`rank-${rating.platform_id}`}
              name="rank"
              defaultValue={rating.rank ?? ""}
            >
              <option value="">未設定</option>
              {rankOptions.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <div className="space-y-1">
            <label
              className="text-xs text-muted-foreground"
              htmlFor={`rating-${rating.platform_id}`}
            >
              {ratingLabel}
            </label>
            <Input
              id={`rating-${rating.platform_id}`}
              name="rating"
              type="number"
              defaultValue={rating.rating ?? undefined}
            />
          </div>
        )
      ) : (
        <div />
      )}

      <div className="space-y-1">
        <Button type="submit" size="sm" disabled={pending}>
          保存
        </Button>
        {state.error && (
          <p className="text-xs text-destructive" aria-live="polite">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
