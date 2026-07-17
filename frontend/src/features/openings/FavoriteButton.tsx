"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  addFavoriteOpeningAction,
  removeFavoriteOpeningAction,
} from "@/features/openings/actions";
import { useActionErrorToast } from "@/lib/useActionErrorToast";
import { initialSimpleActionState } from "@/types/actionState";

export function FavoriteButton({
  openingId,
  isFavorite,
}: {
  openingId: number;
  isFavorite: boolean;
}) {
  const action = isFavorite ? removeFavoriteOpeningAction : addFavoriteOpeningAction;
  const [state, formAction, pending] = useActionState(
    action.bind(null, openingId),
    initialSimpleActionState
  );
  useActionErrorToast(state.error);

  return (
    <form action={formAction} className="inline-flex items-center gap-2">
      <Button type="submit" variant={isFavorite ? "default" : "outline"} size="sm" disabled={pending}>
        {isFavorite ? "お気に入り解除" : "お気に入りに追加"}
      </Button>
      {state.error && (
        <span className="text-xs text-destructive" aria-live="polite">
          {state.error}
        </span>
      )}
    </form>
  );
}
