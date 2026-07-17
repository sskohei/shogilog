"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { updatePlatformRatingAction } from "@/features/profile/actions";
import { initialPlatformRatingActionState } from "@/features/profile/types";
import { useActionErrorToast } from "@/lib/useActionErrorToast";
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
    initialPlatformRatingActionState
  );
  useActionErrorToast(state.message);
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
        <p className="text-s font-medium">{getPlatformName(rating.platform_id)}</p>
      </div>

      <div className="space-y-1">
        <label
          className="text-xs text-muted-foreground"
          htmlFor={`has_played-${rating.platform_id}`}
        >
          プレイ状況
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
              aria-invalid={state.errors.rank ? true : undefined}
              aria-describedby={state.errors.rank ? `rank-error-${rating.platform_id}` : undefined}
            >
              <option value="">未設定</option>
              {rankOptions.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </Select>
            <FieldError id={`rank-error-${rating.platform_id}`} messages={state.errors.rank} />
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
              aria-invalid={state.errors.rating ? true : undefined}
              aria-describedby={
                state.errors.rating ? `rating-error-${rating.platform_id}` : undefined
              }
            />
            <FieldError
              id={`rating-error-${rating.platform_id}`}
              messages={state.errors.rating}
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
      </div>
    </form>
  );
}
